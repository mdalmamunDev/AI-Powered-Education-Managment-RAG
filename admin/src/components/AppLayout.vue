<template>
  <div class="flex gap-3 p-4 h-screen w-screen app-font">
    <!-- Sidebar -->
    <SideBar />

    <!-- Main Content -->
    <div class="flex-1 overflow-auto hide-scrollbar">
      <!-- Header -->
      <div class="bg-g px-10 py-4 rounded-lg flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-main">Welcome, {{ auth?.name }}</h1>
          <p class="text-gray-300 mt-1">EduTech — manage your institution from one place.</p>
        </div>
        <div class="flex items-center space-x-6">
          <!-- Light / Dark theme toggle -->
          <button type="button" @click="toggleTheme" title="Toggle light / dark theme"
            class="w-14 h-14 rounded-full theme-ring flex items-center justify-center text-xl cursor-pointer hover:opacity-70 transition-opacity">
            <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
          </button>
          <div
            class="relative w-14 h-14 theme-ring flex items-center justify-center rounded-full cursor-pointer hover:opacity-70 transition-opacity">
            <i class="fa-regular fa-bell text-3xl"></i>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="on-color w-14 h-14 rounded-full border-[2px] bg-accent flex items-center justify-center text-white text-lg font-bold uppercase">
              {{ (auth?.name || 'A').charAt(0) }}
            </div>
            <div>
              <div class="text-main font-medium">{{ auth?.name }}</div>
              <div class="text-gray-300 text-sm text-end">{{ auth?.role || 'Admin' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="py-8">
        <router-view />
      </div>
    </div>

    <!-- Floating AI chat assistant (persists across every authenticated page) -->
    <AiChatWidget />
  </div>

</template>

<script>
import SideBar from './SideBar.vue';
import AiChatWidget from './AiChatWidget.vue';

export default {
  name: "AppLayout",
  components: { SideBar, AiChatWidget },
  mounted() {
    const existAuth = this.$store.getters.auth;
    if (!existAuth?.id) {
      this.httpReq({
        customUrl: 'auth/me',
        method: 'get',
        callback: (data) => {
          this.$store.commit('setAuth', data);
        },
        errorCallback: () => {
          localStorage.removeItem('token');
          this.$router.push('/auth/login');
        }
      });
    }
  }
};
</script>
