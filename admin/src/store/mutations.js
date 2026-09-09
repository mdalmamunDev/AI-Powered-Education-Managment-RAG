export const mutations = {
    setAuth(state, data) {
        if (!data) data = {}; 
        
        state.auth = data;
    },
    setDataList(state, data) {
        state.dataList = data;
    },
    setFormData(state, data) {
        state.formData = data;
    },
    setConfig(state, data) {
        state.Config = data;
    },
    setSettings(state, data) {
        state.settings = data;
    },
    setShowHeader(state, data) {
        state.showHeader = data;
    },
    setShowFooter(state, data) {
        state.showFooter = data;
    },
    setFilters(state, data) {
        state.filters = data;
    },
    setIsModalOpen(state, data) {
        state.isModalOpen = data;
    },
    setIsLoading(state, data) {
        state.isLoading = data;
    },
    setTheme(state, theme) {
        const t = theme === 'light' ? 'light' : 'dark';
        state.theme = t;
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', t);
            // keep Tailwind's class-based dark mode in sync with the CSS variables
            document.documentElement.classList.toggle('dark', t === 'dark');
        }
        try { localStorage.setItem('app-theme', t); } catch (e) { /* ignore */ }
    }
};