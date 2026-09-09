export const state = {
    auth: null,
    dataList: {},
    formData: {},
    Config: null,
    settings: {},
    showHeader: 1,
    showFooter: 1,
    filters: {},
    isModalOpen: false,
    isLoading: false,
    // 'light' | 'dark' — persisted in localStorage, applied on <html data-theme>
    theme: (typeof localStorage !== 'undefined' && localStorage.getItem('app-theme')) || 'light',
};