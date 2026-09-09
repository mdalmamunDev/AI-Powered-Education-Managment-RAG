  <template>
    <div class="mb-8 flex items-center gap-2 mb-4">
      <back-button />
      <h2 class="text-3xl font-semibold">Forgot password</h2>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Email Field -->
      <div>
        <label for="email" class="my-label font-normal">Enter your email address</label>
        <input type="email" id="email" v-model="formData.email" class="my-input" placeholder="Enter your email" required />
      </div>

      <action-button class="mt-14">GET OTP</action-button>
    </form>
  </template>

<script>
import ActionButton from '@/components/ActionButton.vue';

export default {
  name: "ForgotPasswordPage",
  data() {
    return {
      loading: false,
    };
  },
  components: { ActionButton },
  mounted() {
    this.$store.commit('setFormData', {});
  },
  methods: {
    handleSubmit() {
      this.loading = true;
      this.httpReq({
        callback: ({ resetPasswordToken }) => {
          localStorage.setItem('resetPasswordToken', resetPasswordToken);
          this.loading = false;
          this.$router.push({ path: '/auth/verify-email', query: { email: this.formData.email } });
        },
        errorCallback: () => {
          this.loading = false;
        }
      });

      // this.$router.push('verify-email')
    },
  },
};
</script>
