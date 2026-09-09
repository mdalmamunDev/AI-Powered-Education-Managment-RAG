<template>
  <div class="min-h-screen flex p-3 relative">
    <!-- Theme toggle (top-right, available before login) -->
    <div class="absolute top-5 end-6 z-10">
      <theme-toggle />
    </div>

    <div class="flex w-full h-fit my-auto gap-4 max-w-7xl mx-auto px-8">
      <!-- Left side - Logo -->
      <div class="flex-1 flex items-center justify-center my-10">
        <img class="w-full max-w-[400px] auth-illustration" :src="`/images/logo.png`" alt="">
      </div>

      <div class="w-[1px] theme-divider"></div>

      <!-- Right side - Login Form -->
      <div class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-lg">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "AuthLayout",
  data() {
    return {
      email: "",
      password: "",
      rememberMe: false,
    };
  },
  methods: {
    handleSubmit() {
      console.log("Email:", this.email);
      console.log("Password:", this.password);
      console.log("Remember Me:", this.rememberMe);
      alert(
        `Logging in with\nEmail: ${this.email}\nPassword: ${"*".repeat(
          this.password.length
        )}`
      );
    },
  },
};
</script>
