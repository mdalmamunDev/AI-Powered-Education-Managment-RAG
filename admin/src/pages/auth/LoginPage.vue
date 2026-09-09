<template>
  <div class="text-center mb-8">
    <h2 class="text-3xl font-semibold mb-4">Sign in to Account!</h2>
    <p class="text-gray-300 text-xl">Please enter your email and password to continue.</p>
  </div>

  <form @submit.prevent="handleLogin">
    <!-- Email Field -->
    <div class="mb-5">
      <label for="email" class="my-label">Email</label>
      <input type="email" id="email" v-model="formData.email" class="my-input" placeholder="Enter your email" />
    </div>

    <!-- Password Field -->
    <password-comp v-model="formData.password" class="mb-3" />
    <!-- Remember Password & Forgot Password -->
    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input type="checkbox" checked
          class="w-4 h-4 accent-blue-600 bg-surface-2 border-theme rounded focus:ring-blue-500 focus:ring-2">
        <span class="ml-2 text-sm text-accent">Remember password</span>
      </label>
    </div>

    <!-- Sign In Button -->
    <action-button class="mt-10">SIGN IN</action-button>

  </form>
</template>

<script>
import ActionButton from '@/components/ActionButton.vue';
import PasswordComp from '@/components/PasswordComp.vue';

export default {
  name: "LoginPage",
  components: { PasswordComp, ActionButton },
  mounted() {
    this.$store.commit('setFormData', { email: '', password: '' });
  },
  methods: {
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
