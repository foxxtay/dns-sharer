<template>
  <div class="group grid grid-cols-[1fr_1fr_2fr_100px_48px] gap-3 items-start animate-in">
    <!-- Type -->
    <div>
      <select
        :value="record.type"
        @input="$emit('update', { ...record, type: $event.target.value })"
        class="input-field font-mono text-sm"
      >
        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Name / Host -->
    <div>
      <input
        type="text"
        :value="record.name"
        @input="$emit('update', { ...record, name: $event.target.value })"
        placeholder="@ or subdomain"
        class="input-field font-mono text-sm"
      />
    </div>

    <!-- Value -->
    <div>
      <input
        type="text"
        :value="record.value"
        @input="$emit('update', { ...record, value: $event.target.value })"
        :placeholder="valuePlaceholder"
        class="input-field font-mono text-sm"
      />
    </div>

    <!-- TTL -->
    <div>
      <select
        :value="record.ttl"
        @input="$emit('update', { ...record, ttl: $event.target.value })"
        class="input-field text-sm"
      >
        <option value="300">5 min</option>
        <option value="900">15 min</option>
        <option value="1800">30 min</option>
        <option value="3600">1 hour</option>
        <option value="14400">4 hours</option>
        <option value="86400">1 day</option>
      </select>
    </div>

    <!-- Remove button -->
    <button
      @click="$emit('remove')"
      class="h-[42px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all cursor-pointer"
      title="Remove record"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  record: { type: Object, required: true },
})

defineEmits(['update', 'remove'])

const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'PTR']

const valuePlaceholder = computed(() => {
  const map = {
    A: '192.0.2.1',
    AAAA: '2001:db8::1',
    CNAME: 'target.example.com',
    MX: '10 mail.example.com',
    TXT: 'v=spf1 include:...',
    NS: 'ns1.example.com',
    SRV: '10 5 443 target.example.com',
    CAA: '0 issue "letsencrypt.org"',
    PTR: 'host.example.com',
  }
  return map[props.record.type] || 'Value'
})
</script>

<style scoped>
.input-field {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  background: var(--surface);
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

select.input-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235c6078' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.animate-in {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
