<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0">
      <div
        class="absolute w-20 h-20 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-10 top-1/4 left-1/4 animate-bounce">
      </div>
      <div
        class="absolute w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 top-3/4 right-1/4 animate-pulse">
      </div>
      <div
        class="absolute w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 top-1/2 right-1/3 animate-ping">
      </div>
      <div
        class="absolute w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-10 bottom-1/4 left-1/3 animate-bounce">
      </div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <!-- 404 Number with gradient -->
      <div class="text-center mb-8">
        <h1
          class="text-8xl md:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
          404
        </h1>
        <div class="relative -mt-4 space-y-2">
          <h2 class="text-2xl md:text-4xl font-bold text-white animate-pulse">
            Oops! Page Not Found
          </h2>
          <p class="text-lg text-gray-300 max-w-md mx-auto">
            The page you're looking for seems to have vanished into the digital void
          </p>
        </div>
      </div>

      <!-- Animated illustration -->
      <div class="mb-12 animate-bounce">
        <div class="relative">
          <div class="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl">
          </div>
          <div
            class="relative bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-10 shadow-2xl">
            <div class="text-6xl mb-4 text-center animate-bounce">🚀</div>
            <div class="text-center text-white text-opacity-80">
              <div class="text-sm">Lost in cyberspace...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="flex flex-col sm:flex-row gap-4 mb-12">
        <router-link to="/"
          class="group px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500 hover:shadow-opacity-25 flex items-center gap-2">
          <span class="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Take Me Home
        </router-link>

        <button v-if="pages?.length" @click="showPages = !showPages"
          class="px-8 py-4 bg-gray-800 bg-opacity-50 backdrop-blur-sm text-white font-semibold rounded-full border border-white border-opacity-20 hover:bg-gray-700 hover:bg-opacity-50 transition-all duration-300 transform hover:scale-105">
          {{ showPages ? 'Hide Pages' : 'Browse Pages' }}
        </button>
      </div>

      <!-- Available pages with transition -->
      <div v-if="showPages" class="w-full max-w-4xl transition-all duration-500 ease-out transform"
        :class="showPages ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'">
        <div v-if="pages?.length"
          class="bg-gray-900 bg-opacity-40 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl">
          <h3 class="text-2xl font-bold text-white mb-6 text-center">Available Pages</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link v-for="(page, index) in pages" :key="index" :to="page.path"
              class="group flex items-center gap-3 p-4 rounded-xl bg-gray-800 bg-opacity-30 hover:bg-gray-700 hover:bg-opacity-40 border border-gray-700 border-opacity-50 hover:border-purple-400 hover:border-opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div class="text-2xl flex-shrink-0">{{ page.icon }}</div>
              <div class="flex-grow min-w-0">
                <div class="text-white font-medium group-hover:text-purple-300 transition-colors duration-300 truncate">
                  {{ page.name }}
                </div>
                <div class="text-gray-400 text-sm truncate">{{ page.description }}</div>
              </div>
              <div
                class="text-purple-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0">
                →
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Fun fact section -->
      <div class="mt-12 text-center max-w-md">
        <p class="text-gray-400 text-sm">
          <span class="text-purple-400 font-semibold">Fun fact:</span>
          The first 404 error was at CERN in 1992 🌐
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFoundPage",
  data() {
    return {
      showPages: false,
      // pages: [
      //   { name: "Client Accounts", path: "/clients", icon: "👥", description: "Manage your clients" },
      //   { name: "Equipments", path: "/equipments", icon: "⚙️", description: "Equipment inventory" },
      //   { name: "Equipment Details", path: "/equipment-details", icon: "🔧", description: "Detailed equipment info" },
      //   { name: "Reports", path: "/report", icon: "📊", description: "Analytics and reports" },
      //   { name: "Profile", path: "/profile", icon: "👤", description: "Your profile settings" },
      //   { name: "Settings", path: "/setting", icon: "⚙️", description: "App configuration" },
      //   { name: "Login", path: "/auth/login", icon: "🔐", description: "Sign in to your account" },
      //   { name: "Forgot Password", path: "/auth/forgot-password", icon: "🔑", description: "Reset your password" },
      //   { name: "Verify Email", path: "/auth/verify-email", icon: "✉️", description: "Email verification" },
      //   { name: "Reset Password", path: "/auth/reset-password", icon: "🔄", description: "Create new password" }
      // ]
    }
  }
};
</script>