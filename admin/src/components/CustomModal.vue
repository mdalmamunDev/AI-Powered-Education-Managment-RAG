<template>
  <div v-if="flag" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="relative bg-2 rounded-3xl shadow-lg w-full p-6" :class="`max-w-${w}`">
      <div v-if="showHeader" class="flex items-center justify-between mb-2 pb-3 border-b border-gray-400">
        <span class="text-lg">{{ title }}</span>
        <button class="text-3xl hover:opacity-60" @click="$emit('close')">
          &times;
        </button>
      </div>
      <div class="overflow-y-auto max-h-[80vh]">
        <slot>
          <!-- Default slot content goes here -->
        </slot>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "CustomModal",
  props: {
    flag: Boolean,
    title: String,
    showHeader: {
      type: Boolean,
      default: true,
    },
    w: {
      type: String,
      default: "lg",
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
