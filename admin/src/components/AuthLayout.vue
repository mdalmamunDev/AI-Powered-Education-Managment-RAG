<template>
  <div class="auth-shell min-h-screen flex p-3 relative">
    <!-- Theme toggle (top-right, available before login) -->
    <div class="absolute top-5 end-6 z-10">
      <theme-toggle />
    </div>

    <div class="flex w-full h-fit my-auto gap-6 lg:gap-10 max-w-7xl mx-auto px-4 sm:px-8 flex-col lg:flex-row items-center">
      <!-- Left side - Logo -->
      <div class="flex-1 flex items-center justify-center my-6 lg:my-10 w-full">
        <div class="auth-logo-plate">
          <img class="w-full max-w-[360px] auth-illustration" src="/images/logo.png" alt="EduTech">
        </div>
      </div>

      <div class="hidden lg:block w-px self-stretch min-h-[280px] theme-divider"></div>

      <!-- Right side - Login Form -->
      <div class="flex-1 flex items-center justify-center w-full pb-8 lg:pb-0">
        <div class="auth-form-panel w-full max-w-lg">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
};
</script>
