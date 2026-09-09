export const getters = {
    auth(state) {
        return state.auth;
    },
    dataList(state) {
        return state.dataList;
    },
    formData(state) {
        return state.formData;
    },
    Config(state) {
        return state.Config;
    },
    settings(state) {
        return state.settings;
    },
    showHeader(state) {
        return state.showHeader;
    },
    showFooter(state) {
        return state.showFooter;
    },
    filters(state) {
        return state.filters;
    },
    isModalOpen(state) {
        return state.isModalOpen;
    },
    isLoading(state) {
        return state.isLoading;
    },
    theme(state) {
        return state.theme;
    }
};