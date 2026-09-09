import Swal from "sweetalert2";
export default {
  data() {
    return {
      //
    };
  },
  computed: {
    auth() {
      // const existAuth = this.$store.getters.auth;
      // if (existAuth) return existAuth;

      // this.$store.commit('setAuth', {});
      // this.httpReq({
      //   customUrl: 'user/profile', method: 'get', callback: (data) => {
      //     this.$store.commit('setAuth', data);
      //   }
      // });
      return this.$store.getters.auth
    },
    /**
     * Retrieve the list of data from the Vuex store.
     * This is a computed property to automatically react to changes in the store.
     */
    dataList() {
      return this.$store.getters.dataList
    },

    /**
     * Retrieve form data from the Vuex store.
     * This is a computed property to automatically react to changes in the store.
     */
    formData() {
      return this.$store.getters.formData;
    },

    isModalOpen() {
      return this.$store.getters.isModalOpen;
    },

    isLoading() {
      return this.$store.getters.isLoading;
    },

    /** True when the dark theme is active (used by the header toggle + charts) */
    isDark() {
      return (this.$store.getters.theme || 'light') === 'dark';
    },

    showFooter() {
      return this.$store.getters.showFooter;
    },

    /**
     * Retrieve configuration data from the Vuex store.
     * This is a computed property to automatically react to changes in the store.
     */
    Config() {
      const exist = this.$store.getters.Config;
      if (exist) return exist;

      this.$store.commit('setConfig', {});
      this.httpReq({
        customUrl: 'settings/config', method: 'get', callback: (data) => {
          this.$store.commit('setConfig', data);
        }
      });
      return this.$store.getters.Config
    },

    perPage() {
      const settings = this.$store.getters.settings;
      return settings && settings.items_per_page ? +settings.items_per_page : 10;
    },

    filters() {
      return this.$store.getters.filters;
    },
  },
  methods: {
    openModal(data = {}) {
      this.$store.commit('setIsModalOpen', true);
      this.$store.commit('setFormData', data);

    },
    closeModal() {
      this.$store.commit('setIsModalOpen', false);
      this.$store.commit('setFormData', {});
    },
    /** Switch between the light and dark theme (persisted via the store) */
    toggleTheme() {
      this.$store.commit('setTheme', this.isDark ? 'light' : 'dark');
    },
    openAlert({
      title = 'Are you sure?',
      text = "You won't be able to revert this!",
      icon = 'warning',
      showCancelButton = true,
      confirmButtonText = 'Yes',
      cancelButtonText = 'No',
      confirmButtonColor = '#E11E1E',
      cancelButtonColor = '#303030',
      callback = false
    } = {}) {
      // Follow the active light/dark theme
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      Swal.fire({
        title,
        text,
        icon,
        showCancelButton,
        confirmButtonText,
        cancelButtonText,
        confirmButtonColor,
        cancelButtonColor,
        background: dark ? '#1e293b' : '#ffffff', // theme-aware background
        color: dark ? '#f1f5f9' : '#111827',      // theme-aware text
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-10 py-4 rounded-lg',
          cancelButton: 'px-10 py-4 rounded-lg',
        },
      }).then((result) => {
        if (typeof callback === 'function') callback(result.isConfirmed);
      });
    },
    formatDate(date) {
      if (!date) return date;
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${month}-${day}-${year}`;
    },
    inputDate(date) {
      return date && !isNaN(new Date(date)) ? new Date(date).toISOString().split('T')[0] : '';
    },
    onImageError(event) {
      event.target.src = '/images/error-img.png'; // Fallback image
    },
    showImg(path, isOther = false) {
      if (!path) return '/images/def.png';

      const baseFilePath = process.env.VUE_APP_BASE_FILE_PATH || '';

      // Extract file extension
      const ext = path.split('.').pop()?.toLowerCase();

      // List of image extensions
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      if (isOther || imageExtensions.includes(ext)) return `${baseFilePath}/${path}`;

      if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'm3u8', 'mp4'].includes(ext)) return `/images/def/${ext}.png`;

      return '/icons/file.png';

    },
    isRoute(route) {
      return this.$route && this.$route.fullPath && this.$route.fullPath.includes(route);
    },
    showToast(message, type = "success") {
      this.$toast(message, {
        type: type,
        timeout: 3000,        // 3 seconds timeout
        position: "top-right", // Toast position at top-right
      });
    },
    printStr(str, len = 20) {
      if (!str || typeof str !== 'string') return str;
      return str.length > len ? str.substring(0, len) + '...' : str;
    },

    removeItem(arr, index) {
      if (Array.isArray(arr) && arr.length > 0) {
        arr.splice(index, 1);
      }
    },
    addItem(arr, item) {
      if (Array.isArray(arr)) {
        arr.push(item);
      }
    },
    getTime(dateTime) {
      if (!dateTime) return "";

      const date = new Date(dateTime);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      // Convert 24h to 12h
      hours = hours % 12;
      if (hours === 0) hours = 12;

      return `${hours}:${minutes} ${ampm}`;
    },
    getDate(dateTime) {
      if (!dateTime) return "";
      return new Date(dateTime).toLocaleDateString();
    },
    printStatus(status, colors = {
      pending: "amber",
      upcoming: "amber",
      late: "amber",
      unpaid: "amber",
      "in-progress": "blue",
      submitted: "blue",
      borrowed: "blue",
      partial: "blue",
      enrolled: "blue",
      completed: "green",
      active: "green",
      graded: "green",
      present: "green",
      returned: "green",
      paid: "green",
      available: "green",
      cancelled: "red",
      inactive: "red",
      absent: "red",
      dropped: "red",
      overdue: "red",
    }
    ) {
      if (!status) return "";

      const key = String(status).toLowerCase();

      // convert status to readable format (supports kebab/SCREAMING_SNAKE)
      const readable = key
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const color = colors[key] || "gray"; // fallback

      // Solid formal chips readable on both light and dark surfaces
      const classes = color === "amber"
        ? "bg-amber-500 text-gray-900"
        : `bg-${color}-600 text-white`;

      return `<span class="${classes} px-3 py-1 rounded-full text-xs font-semibold">${readable}</span>`;
    },
    printEnum(enumValue) {
      if (!enumValue) return '';

      return enumValue
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    /** Convert SCREAMING_SNAKE_CASE / kebab-case values (e.g. BANK_TRANSFER) to "Bank Transfer" */
    humanize(value) {
      if (!value && value !== 0) return '';
      return String(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
    printArea(title, ref = 'printArea') {
      const content = this.$refs[ref].innerHTML;

      const printWindow = window.open('', '_blank', 'width=900,height=700');

      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="styles/main.css" rel="stylesheet">
            <style>
              @media print {
                body {
                  margin: 0;
                  padding: 1rem;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${content}
          </body>
        </html>
      `);

      printWindow.document.close();
    }
  },
};