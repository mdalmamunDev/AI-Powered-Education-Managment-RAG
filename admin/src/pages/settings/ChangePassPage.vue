<template>
  <div class="max-w-xl mx-auto">
    <h3 class="hidden sm:block text-2xl font-semibold text-center">Reset Password</h3>

    <form class="space-y-6 mt-12" @submit.prevent="httpReq">
      <!-- Current Password -->
      <password-comp v-model="formData.currentPassword" label="Current Password" class="mb-3" />
      <!-- New Password -->
      <password-comp v-model="formData.password" label="New Password" class="mb-3" />
      <!-- Confirm Password -->
      <password-comp v-model="formData.confirmPassword" label="Confirm Password" class="mb-3" />

      <action-button type="submit" class="w-full py-4">
        Update Password
      </action-button>
    </form>
  </div>
</template>


<script>
import ActionButton from '@/components/ActionButton.vue';
import PasswordComp from '@/components/PasswordComp.vue';

export default {
  name: "ChangePassPage",
  components: { ActionButton, PasswordComp},
  data() {
    return {
      showPassword: false
    };
  },
  mounted() {
    this.$store.commit('setFormData', {});
  },
};
</script>
