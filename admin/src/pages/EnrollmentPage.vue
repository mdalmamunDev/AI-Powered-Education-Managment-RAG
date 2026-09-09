<template>
  <data-table title="All Enrollments" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.course?.courseCode }} - {{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.enrollmentDate) }}</td>
      <td class="my-td" v-html="printStatus(item.status)"></td>
      <td class="my-td text-gray-300">{{ item.finalGrade ?? 'N/A' }}</td>
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
        <label class="my-label">Course</label>
        <select v-model="formData.courseId" required class="my-input py-4">
          <option disabled value="">Select course</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.courseCode }} - {{ c.courseName }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Status</label>
          <select v-model="formData.status" class="my-input py-4">
            <option value="ENROLLED">Enrolled</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Final Grade</label>
          <input v-model="formData.finalGrade" type="number" step="0.01" class="my-input" placeholder="e.g. 88.5">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "EnrollmentPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Course", "Enrollment Date", "Status", "Final Grade"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Course", value: "courseId" },
        { label: "Enrollment Date", value: "enrollmentDate" },
        { label: "Status", value: "status" },
        { label: "Final Grade", value: "finalGrade" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [], courses: [],
      defFormData: { studentId: "", courseId: "", status: "ENROLLED", finalGrade: null },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
  },
};
</script>