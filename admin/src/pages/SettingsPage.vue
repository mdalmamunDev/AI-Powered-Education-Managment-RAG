<template>
  <div>
    <h2 class="text-2xl text-center font-bold mb-4 text-gray-800">App Settings</h2>

    <table class="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2 font-medium text-gray-600">Key</th>
          <th class="px-4 py-2 font-medium text-gray-600">Title</th>
          <th class="px-4 py-2 font-medium text-gray-600">Value</th>
          <th class="px-4 py-2 font-medium text-gray-600 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(setting, index) in dataList?.data"
          :key="index"
          class="border-t hover:bg-gray-50 transition"
        >
          <td class="px-4 py-2 text-sm text-gray-800">
            {{ setting.key }}
          </td>
          <td class="px-4 py-2 text-sm text-gray-800">
            <input type="text" v-model="setting.title" class="w-full border rounded px-2 py-1 text-sm text-gray-700">
          </td>
          <td class="px-4 py-2">
            <input v-if="['text', 'number'].includes(setting.type)" :type="setting.type" min="0" step="0.1" v-model="setting.value" class="w-full border rounded px-2 py-1 text-sm text-gray-700" />
            <file-uploader v-if="setting.type === 'file'" @uploaded="(data) => {setting.value = data.path}" accept="image/*">
              <img class="bg-gray-200 cursor-pointer max-w-[100px]" :src="asset(setting.value)" @error="onImageError" />
            </file-uploader>
          </td>
          <td class="px-4 py-2 text-center">
            <a-button @click="updateSetting(setting)" type="primary">
              Set
            </a-button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="message" class="mt-4 text-green-600 text-sm">
      ✅ {{ message }}
    </div>
  </div>
</template>

<script>
import FileUploader from '@/components/FileUploader.vue';


export default {
  name: 'SettingsPage',
  components: {FileUploader},
  data() {
    return {
      settings: [],
      message: '',
    };
  },
  methods: {
    // async fetchSettings() {
    //   try {
    //     const res = await axios.get('/api/settings');
    //     this.settings = res.data;
    //   } catch (err) {
    //     console.error('Failed to fetch settings:', err);
    //   }
    // },
    async updateSetting(setting) {
      this.httpReq({data: setting})
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
</style>
