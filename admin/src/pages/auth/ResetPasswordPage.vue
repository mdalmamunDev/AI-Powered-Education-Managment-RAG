  <template>
    <div class="mb-8 flex items-center gap-2 mb-4">
      <back-button />
      <h2 class="text-3xl font-semibold">Set a new password</h2>
    </div>

    <form @submit.prevent="handleSubmit">
      <password-comp v-model="password" label="New Password" placeholder="Enter your new password"
        class="mb-3" />
      <password-comp v-model="confirmPassword" label="Confirm New Password" placeholder="Confirm your password"
        class="mb-3" />
      <action-button class="mt-14">RESET PASSWORD</action-button>
    </form>
  </template>

<script>
import ActionButton from '@/components/ActionButton.vue';
import PasswordComp from '@/components/PasswordComp.vue';

export default {
  name: "ResetPasswordPage",
  components: { PasswordComp, ActionButton },
  data() {
    return {
      password: "",
      confirmPassword: "",
      loading: false,
      error: "",
    };
  },
  methods: {
    handleSubmit() {
      this.error = "";
      if (!this.password || !this.confirmPassword) {
        this.error = "Please fill in both password fields.";
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match.";
        return;
      }
      if (this.password.length < 8) {
        this.error = "Password must be at least 8 characters long.";
        return;
      }
      this.loading = true;
      this.httpReq({
        data: {
          password: this.password,
          confirmPassword: this.confirmPassword,
        },
        token: localStorage.getItem('resetToken'),
        callback: () => {
          this.loading = false;
          localStorage.removeItem('resetToken');
          this.$router.push('/auth/login');
        },
        errorCallback: ({ message }) => {
          this.loading = false;
          this.error = message || "An error occurred.";
        }
      });
    },
  },
};
</script>

<style></style>
