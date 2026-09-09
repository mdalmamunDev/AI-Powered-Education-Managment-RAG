<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-2 rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button class="absolute text-2xl top-2 right-2 text-gray-500 hover:text-main" @click="$emit('close')">
        &times;
      </button>
      <slot>
        <!--  -->
      </slot>
      <div class="flex justify-end mt-4">
        <button type="button" class="bg-blue-600 text-white px-4 py-2 rounded" @click="$emit('close')">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DetailsModal",
  props: {
    open: {
      type: Boolean,
      default: false
    },
  }
};
</script>