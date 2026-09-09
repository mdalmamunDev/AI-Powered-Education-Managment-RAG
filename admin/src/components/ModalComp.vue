<template>
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="relative bg-2 rounded-3xl shadow-lg w-full max-w-lg p-6">
      <div class="mb-4">
        <h3 class="font-semibold text-lg text-center">{{ title }}</h3>
        <button class="text-3xl hover:text-gray-300 absolute top-2 right-4" @click="closeModal()">
          &times;
        </button>
      </div>
      <form @submit.prevent="submitForm()" class="overflow-y-auto hide-scrollbar max-h-[80vh]">
        <slot name="modal">

        </slot>
        <!-- Submit Button -->
        <action-button class="mt-5">Submit</action-button>
      </form>
    </div>
  </div>
</template>

<script>

export default {
  name: "ModalComp",
  props: {
    title: String,
    showHeader: {
      type: Boolean,
      default: true,
    },
    showCancelBtn: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      //
    };
  },
  methods: {
    //
  },
};
</script>
