<template>
  <data-table title="All Teachers" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <span class="font-medium">{{ item.firstName }} {{ item.lastName }}</span>
      </td>
      <td class="my-td text-gray-300">{{ item.email }}</td>
      <td class="my-td text-gray-300">{{ item.phone || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.department?.departmentName || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.hireDate) }}</td>
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
        <input v-model="formData.email" type="email" required class="my-input" placeholder="teacher@edu.com">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Phone</label>
          <input v-model="formData.phone" type="text" class="my-input" placeholder="Phone">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Hire Date</label>
          <input v-model="formData.hireDate" type="date" class="my-input">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Specialization</label>
          <input v-model="formData.specialization" type="text" class="my-input" placeholder="e.g. Algorithms">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Office Location</label>
          <input v-model="formData.officeLocation" type="text" class="my-input" placeholder="e.g. Room 204">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Department</label>
        <select v-model="formData.departmentId" required class="my-input py-4">
          <option disabled value="">Select department</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.departmentName }}</option>
        </select>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "TeacherPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Name", "Email", "Phone", "Department", "Hire Date"],
      filterOrderOptions: [
        { label: "Name", value: "firstName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Department", value: "departmentId" },
        { label: "Hire Date", value: "hireDate" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      departments: [],
      defFormData: {
        firstName: "", lastName: "", email: "", phone: "", hireDate: "",
        specialization: "", officeLocation: "", departmentId: "",
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