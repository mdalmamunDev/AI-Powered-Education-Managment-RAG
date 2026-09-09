<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-6 p-6">
      <FileUploader v-if="!noEdit" :accept="'image/*'" @uploaded="(data) => { formData.profileImage = data?.path }">
        <img :src="showImg(formData?.profileImage)" @error="onImageError" alt="Avatar"
          class="w-20 h-20 rounded-full object-cover" />
      </FileUploader>
      <img v-else :src="showImg(formData?.profileImage)" @error="onImageError" alt="Avatar"
        class="w-20 h-20 rounded-full object-cover" />
      <div>
        <h2 class="text-2xl font-bold">{{ auth?.name }}</h2>
        <span class="text-sm text-gray-300 capitalize">{{ auth?.role }}</span>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="updateProfile">
      <div class="w-full">
        <label class="text-sm font-semibold">Name</label>
        <div class="relative w-full mt-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa-solid fa-id-badge"></i>
          </div>
          <input v-model="formData.name" required :readonly="noEdit"
            class="w-full bg-1 rounded-xl p-4 pl-10 pr-6 focus:outline-none"
            :class="noEdit ? '' : 'focus:ring-2 focus:ring-purple-300'" />
        </div>
      </div>
      <div class="w-full">
        <label class="text-sm font-semibold">Email</label>
        <div class="relative w-full mt-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa-solid fa-envelope"></i>
          </div>
          <input :value="auth?.email" required readonly
            class="w-full bg-1 rounded-xl p-4 pl-10 pr-6 focus:outline-none" />
        </div>
      </div>
      <div class="w-full">
        <label class="text-sm font-semibold">Phone</label>
        <div class="relative w-full mt-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa fa-phone"></i>
          </div>
          <input v-model="formData.phone" required :readonly="noEdit"
            class="w-full bg-1 rounded-xl p-4 pl-10 pr-6 focus:outline-none"
            :class="noEdit ? '' : 'focus:ring-2 focus:ring-purple-300'" />
        </div>
      </div>
      <div class="w-full">
        <label class="text-sm font-semibold">Address</label>
        <div class="relative w-full mt-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <input type="text" v-model="formData.address" required :readonly="noEdit"
            class="w-full bg-1 rounded-xl p-4 pl-10 pr-6 focus:outline-none"
            :class="noEdit ? '' : 'focus:ring-2 focus:ring-purple-300'" />
        </div>
      </div>

      <action-button type="submit" class="w-full py-4">
        {{ noEdit ? 'Edit' : 'Update' }} profile
      </action-button>
    </form>
  </div>
</template>

<script>
import ActionButton from '@/components/ActionButton.vue';
import FileUploader from '@/components/FileUploader.vue';

export default {
  name: "ProfilePage",
  components: { FileUploader, ActionButton },
  data: () => {
    return {
      noEdit: true,
    }
  },
  mounted() {
    this.httpReq({
      method: 'get', callback: ({ id, name, phone, profileImage, dateOfBirth, address }) => {
        this.$store.commit('setFormData', { id, name, phone, profileImage, dateOfBirth, address });
      }
    });
  },
  methods: {
    updateProfile() {
      if (this.noEdit) {
        this.noEdit = false;
        return;
      }
      this.noEdit = true;

      this.httpReq({
        method: 'patch', callback: (data) => {
          this.$store.commit('setAuth', data);
        }
      })
    },
  },
};
</script>
