<template>
  <data-table title="All Athlete’s List" :headers="headers" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <div class="flex items-center space-x-3">
          <img class="w-8 h-8 object-cover rounded-full" :src="showImg(item.profileImage)" alt="">
          <span class="">{{ item.name }}</span>
        </div>
      </td>
      <td class="my-td text-gray-300">{{ item.email }}</td>
      <td class="my-td">
        <AssignUser :user="item.coachId" label="Add Coach" fetch-url="user/all?role=coach&limit=20"
          :submit-url="`user/athlete/${item._id}`" field="coachId" />
      </td>
      <td class="my-td">
        <AssignUser :user="item.parentId" label="Add Parent" fetch-url="user/all?role=parent&limit=20"
          :submit-url="`user/athlete/${item._id}`" field="parentId" />
      </td>
      <td class="my-td text-[10px]">
        <!-- Sports List -->
        <div v-if="item.sportAndExperience?.length">
          <div v-for="(s, index) in item.sportAndExperience" :key="index" class="whitespace-nowrap">
            {{ s?.sportId?.name || 'N/A' }}
            <span class="text-light text-[9px]">
              ({{ s?.experienceLevel ? printEnum(s.experienceLevel) : 'N/A' }})
            </span>
          </div>
        </div>

        <!-- Fallback -->
        <div v-else>
          N/A
        </div>
      </td>
      <td class="my-td">{{ item.score || '0' }}</td>
      <td class="my-td" v-html="printStatus(item.status)"></td>
    </template>

    <template #modal>
      <!-- Profile Picture -->
      <FileUploader v-model="formData.profileImage" class="flex justify-center mb-6">
        <div class="relative">
          <img class="w-32 h-32 object-cover rounded-full" :src="showImg(formData.profileImage)" alt="">
          <button
            class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
            <i class="fa fa-edit text-sm"></i>
          </button>
        </div>
      </FileUploader>

      <!-- Name -->
      <div class="p-1 mb-3">
        <label class="my-label">Name</label>
        <input v-model="formData.name" type="text" class="my-input" placeholder="Enter name">
      </div>
      <!-- Email -->
      <div class="p-1 mb-3">
        <label class="my-label">Email</label>
        <input v-model="formData.email" type="email" class="my-input" placeholder="Enter email">
      </div>
      <!-- Password -->
      <PasswordComp v-model="formData.password" placeholder="Set a password" class="p-1 mb-3" />
      <!-- Address -->
      <div class="p-1 mb-3">
        <label class="my-label">Address</label>
        <input v-model="formData.address" type="text" class="my-input" placeholder="Enter address">
      </div>
      <!-- Mobile Number -->
      <div class="p-1 mb-3">
        <label class="my-label">Mobile Number</label>
        <input v-model="formData.phone" required type="text" class="my-input" placeholder="Enter mobile number">
      </div>
      <!-- Gender -->
      <div class="p-1 mb-3">
        <label for="gender" class="my-label">Gender</label>
        <select id="gender" v-model="formData.gender" required class="my-input py-4">
          <option disabled value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="p-1 mb-3">
        <label class="my-label">Status</label>
        <select v-model="formData.status" required class="my-input py-4">
          <option disabled value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </template>
  </data-table>
</template>

<script>
import AssignUser from '@/components/AssignUser.vue';
import DataTable from '@/components/DataTable.vue';
import PasswordComp from '@/components/PasswordComp.vue';
import FileUploader from '@/components/FileUploader.vue';

export default {
  name: "AthletePage",
  components: { DataTable, PasswordComp, AssignUser, FileUploader },
  data() {
    return {
      headers: ["Name", "E-mail", "Coach", "Parent", "Sports", "Score", "Status"],
      filterOrderOptions: [
        { label: "Name", value: "name" },
        { label: "E-mail", value: "email" },
        { label: "Score", value: "score" },
        { label: "Status", value: "status" },
        { value: 'createdAt', label: 'Date Created' },
      ],
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>