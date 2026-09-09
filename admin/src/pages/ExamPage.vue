<template>
  <data-table title="All Exams" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ humanize(item.examType) }}</td>
      <td class="my-td text-gray-300">{{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.examDate) }}</td>
      <td class="my-td text-gray-300">{{ getTime(item.duration) }}</td>
      <td class="my-td text-gray-300">{{ item.location || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.totalMarks }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Course</label>
          <select v-model="formData.courseId" required class="my-input py-4">
            <option disabled value="">Select course</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.courseName }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Exam Type</label>
          <select v-model="formData.examType" required class="my-input py-4">
            <option value="MIDTERM">Midterm</option>
            <option value="FINAL">Final</option>
            <option value="QUIZ">Quiz</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Exam Date</label>
          <input type="date" :value="toInputDate(formData.examDate)" @input="formData.examDate = $event.target.value"
            required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Duration</label>
          <input type="time" :value="toInputTime(formData.duration)" @input="formData.duration = $event.target.value"
            required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Total Marks</label>
          <input v-model.number="formData.totalMarks" type="number" min="1" required class="my-input">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Location</label>
        <input v-model="formData.location" type="text" class="my-input" placeholder="e.g. Hall A">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "ExamPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Exam Type", "Course", "Exam Date", "Duration", "Location", "Total Marks"],
      filterOrderOptions: [
        { label: "Exam Type", value: "examType" },
        { label: "Course", value: "courseId" },
        { label: "Exam Date", value: "examDate" },
        { label: "Duration", value: "duration" },
        { label: "Location", value: "location" },
        { label: "Total Marks", value: "totalMarks" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      courses: [],
      defFormData: { courseId: "", examType: "MIDTERM", examDate: "", duration: "", location: "", totalMarks: null },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
  },
  methods: {
    toInputDate(value) {
      if (!value) return "";
      return String(value).slice(0, 10);
    },
    toInputTime(value) {
      if (!value) return "";
      const m = String(value).match(/(\d{1,2}):(\d{2})/);
      return m ? `${m[1].padStart(2, '0')}:${m[2]}` : "";
    },
    // Backend expects ISO datetime strings for examDate (@db.DateTime) and duration (@db.Time)
    transformSubmit(data) {
      if (data.examDate) data.examDate = this.toInputDate(data.examDate);
      if (data.duration) data.duration = `1970-01-01T${data.duration}:00.000Z`;
      return data;
    },
  },
};
</script>