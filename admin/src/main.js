import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
import commonMixin from "./mixins/commonMixin";
import Toast, { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
import httpMixin from "./mixins/httpMixin";
import store from "./store";
import ActionButton from "./components/ActionButton.vue";
import BackButton from "./components/BackButton.vue";
import ThemeToggle from "./components/ThemeToggle.vue";

const app = createApp(App);

app.use(router);
app.use(Antd);
app.use(store);

// Apply the persisted light/dark theme to <html> before the app renders
// (data-theme drives the CSS variables, `dark` class drives Tailwind dark: utilities)
const initialTheme = store.state.theme === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', initialTheme);
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

app.mixin(commonMixin);
app.mixin(httpMixin);

// toast notification
const toast = useToast();
app.config.globalProperties.$toast = toast;

app.use(Toast, {
  // Global options (optional)
});

app.component("ActionButton", ActionButton);
app.component("BackButton", BackButton);
app.component("ThemeToggle", ThemeToggle);

app.mount("#app");
