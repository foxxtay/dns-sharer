<template>
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- Hero -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold tracking-tight mb-3">
        Share DNS Records
      </h1>
      <p class="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
        Enter your DNS records below, generate a link, and share it with your clients.
        Everything is encoded in the URL &mdash; no data is stored.
      </p>
    </div>

    <!-- Domain field -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Domain</label>
      <input
        v-model="domain"
        type="text"
        placeholder="example.com"
        class="input-field font-mono text-base max-w-md"
      />
    </div>

    <!-- Notes field -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Notes <span class="text-[var(--text-muted)]">(optional)</span></label>
      <textarea
        v-model="notes"
        placeholder="Any instructions or context for your client..."
        rows="2"
        class="input-field text-sm resize-y min-h-[42px] py-2.5"
      ></textarea>
    </div>

    <!-- Records -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <label class="text-sm font-medium text-[var(--text-secondary)]">DNS Records</label>
        <span class="text-xs text-[var(--text-muted)]">{{ records.length }} record{{ records.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Column headers -->
      <div class="grid grid-cols-[1fr_1fr_2fr_100px_48px] gap-3 mb-3 px-0.5">
        <span class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Type</span>
        <span class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</span>
        <span class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Value</span>
        <span class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">TTL</span>
        <span></span>
      </div>

      <div class="space-y-3">
        <DnsRecordRow
          v-for="(record, index) in records"
          :key="record.id"
          :record="record"
          @update="updateRecord(index, $event)"
          @remove="removeRecord(index)"
        />
      </div>

      <button
        @click="addRecord"
        class="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-sm cursor-pointer bg-transparent"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add record
      </button>
    </div>

    <!-- Generate button -->
    <div class="mt-10 pt-8 border-t border-[var(--border)]">
      <button
        @click="generateLink"
        :disabled="!canGenerate"
        class="btn-primary w-full sm:w-auto"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Generate Share Link
      </button>
    </div>

    <!-- Generated link -->
    <div v-if="shareLink" class="mt-8 p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] animate-in">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-2 h-2 rounded-full bg-[var(--success)]"></div>
        <span class="text-sm font-medium text-[var(--success)]">Link generated</span>
      </div>
      <div class="flex gap-2">
        <input
          :value="shareLink"
          readonly
          class="input-field font-mono text-sm flex-1 text-[var(--text-secondary)]"
          @click="$event.target.select()"
        />
        <button
          @click="copyLink"
          class="btn-secondary shrink-0 flex items-center gap-2"
        >
          <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deflate } from 'pako'
import DnsRecordRow from '../components/DnsRecordRow.vue'

const router = useRouter()

let nextId = 1
function createRecord() {
  return { id: nextId++, type: 'A', name: '', value: '', ttl: '3600' }
}

const domain = ref('')
const notes = ref('')
const records = ref([createRecord()])
const shareLink = ref('')
const copied = ref(false)

function addRecord() {
  records.value.push(createRecord())
}

function updateRecord(index, updated) {
  records.value[index] = updated
}

function removeRecord(index) {
  if (records.value.length > 1) {
    records.value.splice(index, 1)
  }
}

const canGenerate = computed(() => {
  return domain.value.trim() && records.value.some(r => r.name.trim() || r.value.trim())
})

function generateLink() {
  const payload = {
    d: domain.value.trim(),
    n: notes.value.trim(),
    r: records.value.map(r => ({
      t: r.type,
      n: r.name.trim(),
      v: r.value.trim(),
      l: r.ttl,
    })).filter(r => r.n || r.v),
  }

  const json = JSON.stringify(payload)
  const compressed = deflate(new TextEncoder().encode(json))
  const base64 = btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // Prefix with 'z.' to indicate compressed format
  const resolved = router.resolve({ name: 'share', params: { data: 'z.' + base64 } })
  shareLink.value = window.location.origin + resolved.href
}

function copyLink() {
  navigator.clipboard.writeText(shareLink.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.input-field {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input-field:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.input-field::placeholder {
  color: var(--text-muted);
}

textarea.input-field {
  height: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 42px;
  background: var(--surface-overlay);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
