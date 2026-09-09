<template>
  <div class="mb-8 flex items-center gap-2 mb-4">
    <back-button />
    <h2 class="text-3xl font-semibold">Enter verification code</h2>
  </div>

  <form @submit.prevent="handleSubmit">
    <div class="w-full">
      <label class="my-label font-normal">Please check your email. We have sent a code to your email</label>
      <div class="grid grid-cols-6 gap-4 mx-8 my-4 justify-center">
        <input v-for="(c, i) in code" :key="i" type="text" inputmode="numeric" maxlength="1"
          autocomplete="one-time-code"
          class="my-input w-[50px] h-[50px] xl:h-[70px] xl:w-[70px] text-center text-3xl text-gray-300"
          v-model="code[i]" @input="handleInput($event, i)" @paste="handlePaste" @keydown="handleKeydown($event, i)"
          :ref="'code' + i" />
      </div>
      <div class="flex justify-between">
        <span class="text-[#6A6A6A]">Didn’t receive code?</span>
        <button type="button" @click="resendOtp" class="font-thin hover:text-blue-300">Resend</button>
      </div>
    </div>

    <action-button class="mt-14">VERIFY</action-button>
  </form>
</template>

<script>
import ActionButton from '@/components/ActionButton.vue';

export default {
  name: "VerifyEmailPage",
  components: { ActionButton },
  data() {
    return {
      email: "", // Should be set from previous step or route param
      code: Array(6).fill(""),
      loading: false,
      error: "",
    };
  },
  methods: {
    handleInput(e, idx) {
      this.error = ""; // Clear any previous error
      const val = e.target.value.replace(/[^0-9]/g, "");
      if (!val) {
        this.code[idx] = "";
        return;
      }
      // If user pastes or types multiple digits, fill forward
      if (val.length > 1) {
        val.split('').forEach((char, i2) => {
          if (idx + i2 < 6) this.code[idx + i2] = char;
        });
        this.$nextTick(() => {
          const lastIdx = Math.min(idx + val.length - 1, 5);
          const lastInput = this.$refs[`code${lastIdx}`];
          if (lastInput && lastInput[0]) lastInput[0].focus();
        });
        return;
      }
      this.code[idx] = val;
      if (idx < 5) {
        this.$nextTick(() => {
          const nextInput = this.$refs[`code${idx + 1}`];
          if (nextInput && nextInput[0]) nextInput[0].focus();
        });
      }
    },
    handlePaste(e) {
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      if (!paste) return;
      const chars = paste.replace(/[^0-9]/g, '').split('').slice(0, 6);
      chars.forEach((char, i) => {
        this.code[i] = char;
      });
      this.$nextTick(() => {
        const lastIdx = chars.length - 1;
        if (lastIdx >= 0 && this.$refs[`code${lastIdx}`] && this.$refs[`code${lastIdx}`][0]) {
          this.$refs[`code${lastIdx}`][0].focus();
        }
      });
      e.preventDefault();
    },
    handleKeydown(e, idx) {
      if (e.key === 'Backspace') {
        if (this.code[idx]) {
          this.code[idx] = "";
        } else if (idx > 0) {
          this.$nextTick(() => {
            const prevInput = this.$refs[`code${idx - 1}`];
            if (prevInput && prevInput[0]) prevInput[0].focus();
          });
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        this.$nextTick(() => {
          const prevInput = this.$refs[`code${idx - 1}`];
          if (prevInput && prevInput[0]) prevInput[0].focus();
        });
      } else if (e.key === 'ArrowRight' && idx < 5) {
        this.$nextTick(() => {
          const nextInput = this.$refs[`code${idx + 1}`];
          if (nextInput && nextInput[0]) nextInput[0].focus();
        });
      }
    },
    handleSubmit() {
      if (this.code.some(c => !c)) {
        this.error = "Please enter the full 6-digit code.";
        return;
      }


      const resetPasswordToken = localStorage.getItem('resetPasswordToken');
      if (!resetPasswordToken) {
        this.showToast('Reset token error', 'error');
        return;
      }

      this.loading = true;
      const codeStr = this.code.join("");
      this.httpReq({
        token: resetPasswordToken,
        data: {
          email: this.email,
          otp: codeStr,
        },
        callback: ({ token }) => {
          this.loading = false;
          if (token) {
            localStorage.setItem('resetToken', token);
            this.$router.push('/auth/reset-password');
          } else {
            this.error = "Verification failed.";
          }
        },
        errorCallback: ({ message }) => {
          this.loading = false;
          this.error = message || "An error occurred.";
        }
      });

      // this.$router.push('reset-password')
    },
    resendOtp() {
      const resetPasswordToken = localStorage.getItem('resetPasswordToken');
      if (!resetPasswordToken) {
        this.showToast('Reset token error', 'error');
        return;
      }

      this.httpReq({
        customUrl: 'auth/resend-otp',
        token: resetPasswordToken,
        data: { email: this.email },
        callback: ({resetPasswordToken}) => {
          localStorage.setItem('resetPasswordToken', resetPasswordToken);
          // this.showToast('OTP resent successfully', 'success');
        },
      });
    }
  },
  mounted() {
    // Try to get email from query param
    const emailFromQuery = this.$route.query.email;
    if (emailFromQuery) {
      this.email = emailFromQuery;
    }
  },
};
</script>

<style>
.loader {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
