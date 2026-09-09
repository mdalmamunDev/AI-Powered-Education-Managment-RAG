<template>
  <data-table title="All Semesters" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.semesterName }}</td>
      <td class="my-td text-gray-300">{{ item.academicYear }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.startDate) }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.endDate) }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Semester Name</label>
        <input v-model="formData.semesterName" type="text" required class="my-input" placeholder="e.g. Fall">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Academic Year</label>
        <input v-model="formData.academicYear" type="text" required class="my-input" placeholder="e.g. 2026-2027">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Start Date</label>
        <input v-model="formData.startDate" type="date" required class="my-input">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">End Date</label>
        <input v-model="formData.endDate" type="date" required class="my-input">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "SemesterPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Semester Name", "Academic Year", "Start Date", "End Date"],
      filterOrderOptions: [
        { label: "Semester Name", value: "semesterName" },
        { label: "Academic Year", value: "academicYear" },
        { label: "Start Date", value: "startDate" },
        { label: "End Date", value: "endDate" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      defFormData: { semesterName: "", academicYear: "", startDate: "", endDate: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>