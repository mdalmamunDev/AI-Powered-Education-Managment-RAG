<template>
  <data-table title="Student-Guardian Links" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.guardian?.firstName }} {{ item.guardian?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.guardian?.relationship || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.createdAt) }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Student</label>
        <select v-model="formData.studentId" required class="my-input py-4">
          <option disabled value="">Select student</option>
          <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
        </select>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Guardian</label>
        <select v-model="formData.guardianId" required class="my-input py-4">
          <option disabled value="">Select guardian</option>
          <option v-for="g in guardians" :key="g.id" :value="g.id">{{ g.firstName }} {{ g.lastName }} ({{ g.relationship }})</option>
        </select>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "StudentGuardianPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Guardian", "Relationship", "Linked On"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Guardian", value: "guardianId" },
        { label: "Relationship", value: "relationship" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [],
      guardians: [],
      defFormData: { studentId: "", guardianId: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
    this.httpReq({ customUrl: 'guardians?limit=200', method: 'get', callback: (data) => { this.guardians = data || []; } });
  },
};
</script>