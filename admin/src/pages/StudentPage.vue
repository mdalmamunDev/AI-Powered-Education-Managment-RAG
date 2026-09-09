<template>
  <data-table title="All Students" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <span class="font-medium">{{ item.firstName }} {{ item.lastName }}</span>
      </td>
      <td class="my-td text-gray-300">{{ item.email }}</td>
      <td class="my-td text-gray-300">{{ item.phone || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.department?.departmentName || 'N/A' }}</td>
      <td class="my-td" v-html="printStatus(item.status)"></td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">First Name</label>
          <input v-model="formData.firstName" type="text" required class="my-input" placeholder="First name">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Last Name</label>
          <input v-model="formData.lastName" type="text" required class="my-input" placeholder="Last name">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Email</label>
        <input v-model="formData.email" type="email" required class="my-input" placeholder="student@edu.com">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Phone</label>
          <input v-model="formData.phone" type="text" class="my-input" placeholder="Phone">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Date of Birth</label>
          <input v-model="formData.dateOfBirth" type="date" class="my-input">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Address</label>
        <input v-model="formData.address" type="text" class="my-input" placeholder="Address">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Status</label>
          <select v-model="formData.status" class="my-input py-4">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Department</label>
          <select v-model="formData.departmentId" class="my-input py-4">
            <option disabled value="">Select department</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.departmentName }}</option>
          </select>
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "StudentPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Name", "Email", "Phone", "Department", "Status"],
      filterOrderOptions: [
        { label: "Name", value: "firstName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Department", value: "departmentId" },
        { label: "Status", value: "status" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      departments: [],
      defFormData: {
        firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
        address: "", status: "ACTIVE", departmentId: "",
      },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({
      customUrl: 'departments?limit=200',
      method: 'get',
      callback: (data) => { this.departments = data || []; }
    });
  },
};
</script>