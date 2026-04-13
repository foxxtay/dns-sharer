<template>
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- Error state -->
    <div v-if="error" class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center">
        <svg class="w-8 h-8 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold mb-2">Invalid Share Link</h2>
      <p class="text-[var(--text-secondary)] mb-6">This link appears to be malformed or corrupted.</p>
      <router-link to="/" class="btn-primary inline-flex">
        Create New Records
      </router-link>
    </div>

    <!-- Loaded state -->
    <div v-else-if="payload">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
            Shared
          </div>
        </div>
        <h1 class="text-3xl font-bold tracking-tight mb-1">
          DNS Records for <span class="text-[var(--accent)]">{{ payload.d }}</span>
        </h1>
        <p class="text-[var(--text-secondary)]">
          {{ payload.r.length }} record{{ payload.r.length !== 1 ? 's' : '' }} to configure
        </p>
      </div>

      <!-- Notes -->
      <div v-if="payload.n" class="mb-8 p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span class="text-sm font-medium text-[var(--text-muted)]">Notes</span>
        </div>
        <p class="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{{ payload.n }}</p>
      </div>

      <!-- Records table -->
      <div class="rounded-xl border border-[var(--border)] overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-[var(--surface-raised)]">
              <th class="table-header w-20">Type</th>
              <th class="table-header">Name</th>
              <th class="table-header">Value</th>
              <th class="table-header w-24">TTL</th>
              <th class="table-header w-16"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(record, index) in payload.r"
              :key="index"
              class="border-t border-[var(--border)] hover:bg-[var(--surface-raised)]/50 transition-colors"
            >
              <td class="table-cell">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] font-mono">
                  {{ record.t }}
                </span>
              </td>
              <td class="table-cell font-mono text-sm">{{ record.n || '@' }}</td>
              <td class="table-cell font-mono text-sm break-all text-[var(--text-secondary)]">{{ record.v }}</td>
              <td class="table-cell text-sm text-[var(--text-muted)]">{{ formatTTL(record.l) }}</td>
              <td class="table-cell">
                <button
                  @click="copyValue(record.v, index)"
                  class="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer bg-transparent border-0"
                  title="Copy value"
                >
                  <svg v-if="copiedIndex !== index" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-3.5 h-3.5 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Copy all button -->
      <div class="mt-6 flex gap-3">
        <button @click="copyAll" class="btn-secondary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copiedAll ? 'Copied all records' : 'Copy all as text' }}
        </button>
        <router-link to="/" class="btn-ghost">
          Create your own
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const payload = ref(null)
const error = ref(false)
const copiedIndex = ref(-1)
const copiedAll = ref(false)

onMounted(() => {
  try {
    const data = route.params.data
    const padded = data.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - data.length % 4) % 4)
    const decoded = decodeURIComponent(escape(atob(padded)))
    payload.value = JSON.parse(decoded)
  } catch {
    error.value = true
  }
})

function formatTTL(ttl) {
  const seconds = parseInt(ttl)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${seconds / 60}m`
  if (seconds < 86400) return `${seconds / 3600}h`
  return `${seconds / 86400}d`
}

function copyValue(value, index) {
  navigator.clipboard.writeText(value)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = -1 }, 2000)
}

function copyAll() {
  const lines = payload.value.r.map(r =>
    `${r.t}\t${r.n || '@'}\t${r.v}\t${formatTTL(r.l)}`
  )
  const text = `DNS Records for ${payload.value.d}\n${'─'.repeat(40)}\n` +
    `Type\tName\tValue\tTTL\n` +
    lines.join('\n')
  navigator.clipboard.writeText(text)
  copiedAll.value = true
  setTimeout(() => { copiedAll.value = false }, 2000)
}
</script>

<style scoped>
.table-header {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-cell {
  padding: 14px 16px;
  vertical-align: middle;
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
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--surface-raised);
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

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--surface-raised);
}
</style>
