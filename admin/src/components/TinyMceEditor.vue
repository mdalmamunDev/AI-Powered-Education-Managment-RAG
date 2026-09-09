<template>
  <div>
    <!-- EDIT MODE -->
    <div v-show="isEdit">
      <editor
        v-model="aboutUsContent"
        :api-key="apiKey"
        :init="editorInit"
      />

      <div class="flex justify-end mt-4">
        <button @click="saveContent" class="btn-g px-5 py-2 rounded">
          <i class="fas fa-check mr-1"></i>
          Save
        </button>
      </div>
    </div>

    <!-- PREVIEW MODE -->
    <div v-show="!isEdit" class="p-4 bg-1">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          {{ $route?.meta?.title }}
        </h2>

        <button @click="isEdit = true" class="btn-g px-5 py-2 rounded">
          <i class="fas fa-edit mr-1"></i>
          Edit
        </button>
      </div>

      <!-- Loading -->
      <div v-if="!aboutUsContent" class="text-center py-4">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
      </div>

      <div v-html="aboutUsContent" class="prose no-tailwind"></div>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'

export default {
  name: 'EditorPage',

  components: { Editor },

  data() {
    return {
      aboutUsContent: '',
      isEdit: false,
      apiKey: process.env.VUE_APP_TINY_MC_KEY,

      editorInit: {
        height: 500,
        menubar: true,

        plugins: [
          'advlist autolink lists link charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],

        toolbar: `
          undo redo | formatselect |
          bold italic backcolor |
          alignleft aligncenter alignright alignjustify |
          bullist numlist outdent indent |
          removeformat | help
        `,

        skin: 'oxide-dark',
        content_css: 'dark',

        content_style: `
          body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 14px;
            background-color: #1e1e1e;
            color: #fff;
            padding: 15px;
          }
        `,

        language: 'zh_CN',
        language_url: '../tinymce/langs/zh_CN.js',

        branding: false
      }
    }
  },

  mounted() {
    this.httpReq({
      method: 'get',
      callback: (setting) => {
        this.aboutUsContent = setting.value || ''
      }
    })
  },

  methods: {
    saveContent() {
      this.httpReq({
        data: {
          value: this.aboutUsContent
        },
        callback: () => {
          this.isEdit = false
        }
      })
    }
  }
}
</script>

<style scoped>
.prose {
  color: inherit;
}
</style>