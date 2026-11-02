<template>
  <div class="text-center mb-8">
    <h2 class="text-3xl font-semibold text-main mb-3">Sign in to Account!</h2>
    <p class="text-sub text-base sm:text-lg">Please enter your email and password to continue.</p>
  </div>

  <form @submit.prevent="handleLogin">
    <!-- Email Field -->
    <div class="mb-5">
      <label for="email" class="my-label">Email</label>
      <input type="email" id="email" v-model="formData.email" class="my-input" placeholder="Enter your email" />
    </div>

    <!-- Password Field -->
    <password-comp v-model="formData.password" class="mb-3" />
    <!-- Remember Password -->
    <div class="flex items-center justify-between">
      <label class="flex items-center cursor-pointer">
        <input type="checkbox" checked
          class="w-4 h-4 accent-amber-500 bg-surface-2 border-theme rounded focus:ring-amber-400 focus:ring-2">
        <span class="ml-2 text-sm text-sub">Remember password</span>
      </label>
    </div>

    <!-- Sign In Button -->
    <action-button class="mt-10">SIGN IN</action-button>

    <!-- Demo credentials -->
    <div class="mt-8 rounded-xl border border-theme bg-2 px-4 py-4">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <p class="text-sm font-medium text-main">Demo account</p>
          <p class="text-xs text-sub mt-0.5">Use these credentials for a quick try.</p>
        </div>
        <button
          type="button"
          class="shrink-0 text-xs font-semibold text-main border border-theme bg-surface bg-hover px-3 py-1.5 rounded-lg transition"
          @click="fillDemoCredentials"
        >
          Autofill
        </button>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3 rounded-lg bg-surface border border-theme px-3 py-2">
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-wide text-sub">Email</p>
            <p class="text-sm text-main truncate font-mono">{{ demoCredentials.email }}</p>
          </div>
          <button
            type="button"
            class="text-xs font-medium text-main hover:opacity-70 shrink-0"
            @click="copyCredential('email')"
          >
            {{ copiedField === 'email' ? 'Copied' : 'Copy' }}
          </button>
        </div>

        <div class="flex items-center justify-between gap-3 rounded-lg bg-surface border border-theme px-3 py-2">
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-wide text-sub">Password</p>
            <p class="text-sm text-main truncate font-mono">{{ demoCredentials.password }}</p>
          </div>
          <button
            type="button"
            class="text-xs font-medium text-main hover:opacity-70 shrink-0"
            @click="copyCredential('password')"
          >
            {{ copiedField === 'password' ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import ActionButton from '@/components/ActionButton.vue';
import PasswordComp from '@/components/PasswordComp.vue';

const DEMO_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '1qazxsw2',
};

export default {
  name: "LoginPage",
  components: { PasswordComp, ActionButton },
  data() {
    return {
      demoCredentials: DEMO_CREDENTIALS,
      copiedField: null,
      copyResetTimer: null,
    };
  },
  mounted() {
    this.$store.commit('setFormData', { email: '', password: '' });
  },
  beforeUnmount() {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
  },
  methods: {
    fillDemoCredentials() {
      this.$store.commit('setFormData', {
        ...this.formData,
        email: this.demoCredentials.email,
        password: this.demoCredentials.password,
      });
    },
    async copyCredential(field) {
      const value = this.demoCredentials[field];
      try {
        await navigator.clipboard.writeText(value);
        this.copiedField = field;
        if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
        this.copyResetTimer = setTimeout(() => {
          this.copiedField = null;
        }, 1500);
      } catch {
        // Clipboard unavailable — ignore silently
      }
    },
    handleLogin() {
      this.httpReq({
        customUrl: 'auth/login',
        callback: (data) => {
          if (!data?.token) return;
          localStorage.setItem('token', data.token);
          this.$store.commit('setAuth', data.user);
          this.$router.replace('/');
        },
        errorCallback: () => {
          // credentials rejected by backend — stay on the page
        }
      });
    },
  },
};
</script>

<style></style>
