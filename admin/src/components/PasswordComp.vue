<template>
  <div class="">
    <label class="my-label">{{ label }}</label>
    <div class="relative">
      <input :type="showPassword ? 'text' : 'password'" class="my-input" :placeholder="placeholder" :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)" />
      <button type="button" @click="togglePassword"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:opacity-70">
        <i v-if="showPassword" class="fas fa-eye-slash"></i>
        <i v-else class="fas fa-eye"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PasswordComp",
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Password'
    },
    placeholder: {
      type: String,
      default: 'Enter your password'
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false,
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>