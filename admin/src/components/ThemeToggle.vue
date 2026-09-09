<template>
  <button type="button" class="theme-toggle" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
    <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
  </button>
</template>

<script>
export default {
  name: "ThemeToggle",
  computed: {
    isDark() {
      return (this.$store.getters.theme || 'light') === 'dark';
    },
  },
  methods: {
    toggle() {
      // setTheme also syncs <html data-theme> and persists to localStorage
      this.$store.commit('setTheme', this.isDark ? 'light' : 'dark');
    },
  },
};
</script>

<style scoped>
.theme-toggle {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-2);
  border: 1px solid var(--border);
  color: var(--text-1);
  font-size: 1.05rem;
  cursor: pointer;
  transition: background-color .25s ease, color .25s ease, transform .15s ease, box-shadow .2s ease;
}

.theme-toggle:hover {
  transform: scale(1.06);
  box-shadow: 0 0 0 3px var(--border-strong);
}
</style>