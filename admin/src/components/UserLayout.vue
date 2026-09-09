<template>
  <div class="container mx-auto flex gap-8 mt-8">
    <!-- Sidebar -->
    <div class="w-64 bg-white rounded-xl shadow-lg p-4 flex flex-col justify-between py-10" style="box-shadow: 0 0 10px #5680C0">
      <div class="space-y-2">
        <router-link to="profile" class="w-full flex items-center gap-2 border border-gray-300 px-4 py-2 rounded" :class="isRoute('profile') ? 'bg-1 text-white' : ''">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </router-link>
        <router-link to="reset-pass" class="w-full flex items-center gap-2 border border-gray-300 px-4 py-2 rounded" :class="isRoute('reset-pass') ? 'bg-1 text-white' : ''">
          <i class="fa-solid fa-key"></i>
          <span>Reset Password</span>
        </router-link>
        <router-link to="settings" class="w-full flex items-center gap-2 border border-gray-300 px-4 py-2 rounded" :class="isRoute('settings') ? 'bg-1 text-white' : ''">
          <i class="fas fa-cog"></i>
          <span>App Settings</span>
        </router-link>
      </div>
      <button @click="showAlert" class="w-full flex items-center gap-2 border border-gray-300 px-4 py-2 rounded text-red-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_287_658)">
          <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#EF4000"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.8283 17.6595V18.4188C12.8283 19.0276 12.5249 19.5532 11.9976 19.8576C11.7439 20.004 11.4607 20.0857 11.1672 20.0859C10.8733 20.086 10.5903 20.0042 10.3364 19.8576L6.9606 17.9086C6.43326 17.6041 6.12988 17.0787 6.12988 16.4698V6.513C6.12988 5.59683 6.87515 4.85156 7.79132 4.85156H15.2261C16.1423 4.85156 16.8876 5.59673 16.8876 6.513V8.61183C16.8876 8.91291 16.6432 9.15741 16.3421 9.15741C16.0409 9.15741 15.7967 8.91295 15.7967 8.61183V6.513C15.7967 6.19838 15.5407 5.94244 15.2261 5.94244H8.71129L11.9976 7.84008C12.5247 8.14444 12.8283 8.66995 12.8283 9.27863V16.5686H15.2261C15.5407 16.5686 15.7967 16.3128 15.7967 15.9982V14.1583C15.7967 13.857 16.0408 13.6128 16.3422 13.6128C16.6434 13.6128 16.8877 13.8571 16.8877 14.1583V15.9982C16.8877 16.9144 16.1423 17.6596 15.2262 17.6596H12.8283V17.6595ZM17.8831 11.801L17.2823 12.4017C17.0693 12.6147 17.0694 12.96 17.2823 13.1731C17.3329 13.2238 17.3931 13.264 17.4593 13.2914C17.5254 13.3188 17.5964 13.3328 17.668 13.3327C17.8132 13.3327 17.9512 13.2758 18.0539 13.1731L19.5856 11.6411C19.7986 11.4281 19.7986 11.0829 19.5856 10.87L18.0539 9.33825C17.8409 9.1252 17.4955 9.1253 17.2824 9.3382C17.0694 9.55102 17.0695 9.89648 17.2824 10.1093L17.8831 10.71H13.8585C13.5571 10.71 13.3131 10.9542 13.3131 11.2555C13.3131 11.5569 13.5571 11.801 13.8585 11.801H17.8831Z" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_287_658">
          <rect width="24" height="24" fill="white"/>
          </clipPath>
          </defs>
        </svg>

        <span>Logout</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-white rounded-xl shadow-lg p-8 min-h-[80vh]" style="box-shadow: 0 0 10px #5680C0">
      <div class="p-20 mx-auto">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: "UserLayout",

  methods: {
    showAlert() {
      Swal.fire({
        title: 'Do you want to Logout?',
        text: 'You won’t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cancel',
        cancelButtonText: 'Logout',
      }).then((result) => {
        if (!result.isConfirmed) {
          localStorage.removeItem('token');
          this.$store.commit('setAuth', null);
          this.$router.push('/auth/login');
        }
      });
    }
  }
};
</script>
