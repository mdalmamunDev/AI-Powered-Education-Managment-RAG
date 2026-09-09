<template>
  <data-table title="All Departments" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <span class="font-medium">{{ item.departmentName }}</span>
      </td>
      <td class="my-td text-gray-300">{{ item.headOfDepartment || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.location || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.phone || 'N/A' }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Department Name</label>
        <input v-model="formData.departmentName" type="text" required class="my-input" placeholder="e.g. Computer Science">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Head of Department</label>
        <input v-model="formData.headOfDepartment" type="text" class="my-input" placeholder="e.g. Dr. Jane Doe">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Location</label>
        <input v-model="formData.location" type="text" class="my-input" placeholder="e.g. Building A">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Phone</label>
        <input v-model="formData.phone" type="text" class="my-input" placeholder="e.g. 555-0100">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "DepartmentPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Department Name", "Head of Department", "Location", "Phone"],
      filterOrderOptions: [
        { label: "Dept. Name", value: "departmentName" },
        { label: "Head of Dept.", value: "headOfDepartment" },
        { label: "Location", value: "location" },
				{ value: 'createdAt', label: 'Date Created' },
      ],
      defFormData: { departmentName: "", headOfDepartment: "", location: "", phone: "" },
    };
  },
  mounted() {
		this.filters.sortOrder = 'asc';
  },
};
</script>