<template>
  <div class="cursor-pointer overflow-hidden" @click="triggerFileInput">
    <slot></slot>
    <input ref="fileInput" type="file" :accept="accept" style="display:none" @change="handleFileChange" />
    <!-- No direct mutation, bind to prop and emit update -->
    <input class="hidden" :value="modelValue" type="text" @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    accept: {
      type: String,
      default: '*/*'
    },
    modelValue: {
      type: String,
      default: ''
    },
    urlSuffix: String,
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.$emit('beforeUpload');

      const formObj = new FormData();
      formObj.append('file', file);

      this.httpReq({
        customUrl: 'upload',
        urlSuffix: this.urlSuffix,
        data: formObj,
        callback: (data) => {
          this.$emit('uploaded', data); // keep uploaded event
          this.$emit('update:modelValue', data.path || ''); // also update v-model
        }
      });

      event.target.value = '';
    }
  }
};
</script>
