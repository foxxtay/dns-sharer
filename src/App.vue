<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-[var(--border)] backdrop-blur-sm bg-[var(--surface)]/80 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 no-underline group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <span class="text-lg font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            DNS Sharer
          </span>
        </router-link>
        <a
          href="https://github.com"
          class="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-sm"
        >
          v1.0
        </a>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-muted)]">
      DNS records encoded client-side &mdash; nothing stored on a server.
    </footer>
  </div>
</template>
