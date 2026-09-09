<template>
  <data-table title="All Grades" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ item.score }}</td>
      <td class="my-td text-gray-300">{{ item.gradeLetter || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.assessmentType }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.dateRecorded) }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
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
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.courseName }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Score</label>
          <input v-model="formData.score" type="number" step="0.01" required class="my-input" placeholder="e.g. 88">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Grade Letter</label>
          <input v-model="formData.gradeLetter" type="text" class="my-input" placeholder="e.g. B+">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Assessment Type</label>
          <select v-model="formData.assessmentType" required class="my-input py-4">
            <option value="MIDTERM">Midterm</option>
            <option value="FINAL">Final</option>
            <option value="QUIZ">Quiz</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Date Recorded</label>
          <input v-model="formData.dateRecorded" type="date" class="my-input">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "GradePage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Course", "Score", "Grade", "Assessment", "Recorded"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Course", value: "courseId" },
        { label: "Score", value: "score" },
        { label: "Grade", value: "gradeLetter" },
        { label: "Assessment", value: "assessmentType" },
        { label: "Recorded", value: "dateRecorded" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [], courses: [],
      defFormData: { studentId: "", courseId: "", score: null, gradeLetter: "", assessmentType: "MIDTERM", dateRecorded: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
  },
};
</script>