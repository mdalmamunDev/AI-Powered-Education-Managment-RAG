<template>
  <data-table title="All Courses" :headers="headers" :def-form-data="defFormData" :modal-w="'3xl'" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <div class="font-medium">{{ item.courseName }}</div>
        <div class="text-xs text-gray-400">{{ item.courseCode }}</div>
      </td>
      <td class="my-td text-gray-300">{{ item.creditHours }}</td>
      <td class="my-td text-gray-300">{{ item.teacher?.firstName }} {{ item.teacher?.lastName || item.teacher?.email }}</td>
      <td class="my-td text-gray-300">{{ item.department?.departmentName || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.semester?.semesterName || 'N/A' }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Course Code</label>
          <input v-model="formData.courseCode" type="text" required class="my-input" placeholder="e.g. CS101">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Course Name</label>
          <input v-model="formData.courseName" type="text" required class="my-input" placeholder="Course name">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Description</label>
        <textarea v-model="formData.description" class="my-input" rows="2" placeholder="Description"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Credit Hours</label>
          <input v-model.number="formData.creditHours" type="number" min="1" required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Max Capacity</label>
          <input v-model.number="formData.maxCapacity" type="number" min="1" required class="my-input">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Teacher</label>
          <select v-model="formData.teacherId" class="my-input py-4">
            <option disabled value="">Select teacher</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.firstName }} {{ t.lastName }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Department</label>
          <select v-model="formData.departmentId" required class="my-input py-4">
            <option disabled value="">Select department</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.departmentName }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Semester</label>
          <select v-model="formData.semesterId" required class="my-input py-4">
            <option disabled value="">Select semester</option>
            <option v-for="s in semesters" :key="s.id" :value="s.id">{{ s.semesterName }} {{ s.academicYear }}</option>
          </select>
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "CoursePage",
  components: { DataTable },
  data() {
    return {
      headers: ["Course", "Credits", "Teacher", "Department", "Semester"],
      filterOrderOptions: [
        { label: "Course", value: "courseName" },
        { label: "Credits", value: "creditHours" },
        { label: "Teacher", value: "teacherId" },
        { label: "Department", value: "departmentId" },
        { label: "Semester", value: "semesterId" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      teachers: [], departments: [], semesters: [],
      defFormData: {
        courseCode: "", courseName: "", description: "", creditHours: null,
        maxCapacity: null, teacherId: "", departmentId: "", semesterId: "",
      },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'teachers?limit=200', method: 'get', callback: (data) => { this.teachers = data || []; } });
    this.httpReq({ customUrl: 'departments?limit=200', method: 'get', callback: (data) => { this.departments = data || []; } });
    this.httpReq({ customUrl: 'semesters?limit=200', method: 'get', callback: (data) => { this.semesters = data || []; } });
  },
};
</script>