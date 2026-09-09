<template>
  <data-table title="All Submissions" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.assignment?.title }}</td>
      <td class="my-td text-gray-300">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.submissionDate) }}</td>
      <td class="my-td text-gray-300">{{ item.score ?? 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.feedback || '—' }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Assignment</label>
          <select v-model="formData.assignmentId" required class="my-input py-4">
            <option disabled value="">Select assignment</option>
            <option v-for="a in assignments" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Student</label>
          <select v-model="formData.studentId" required class="my-input py-4">
            <option disabled value="">Select student</option>
            <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Score</label>
          <input v-model="formData.score" type="number" step="0.01" class="my-input" placeholder="Optional">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">File Path</label>
          <input v-model="formData.filePath" type="text" class="my-input" placeholder="/uploads/hw.pdf">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Feedback</label>
        <textarea v-model="formData.feedback" class="my-input" rows="2" placeholder="Feedback"></textarea>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "SubmissionPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Assignment", "Student", "Submitted", "Score", "Feedback"],
      filterOrderOptions: [
        { label: "Assignment", value: "assignmentId" },
        { label: "Student", value: "studentId" },
        { label: "Submitted", value: "submissionDate" },
        { label: "Score", value: "score" },
        { label: "Feedback", value: "feedback" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      assignments: [], students: [],
      defFormData: { assignmentId: "", studentId: "", score: null, feedback: "", filePath: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'assignments?limit=200', method: 'get', callback: (data) => { this.assignments = data || []; } });
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
  },
};
</script>