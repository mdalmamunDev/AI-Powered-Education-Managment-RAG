<template>
  <data-table title="Attendance Records" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.attendanceDate) }}</td>
      <td class="my-td" v-html="printStatus(item.status)"></td>
      <td class="my-td text-gray-300">{{ item.remarks || '—' }}</td>
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
          <label class="my-label">Attendance Date</label>
          <input v-model="formData.attendanceDate" type="date" required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Status</label>
          <select v-model="formData.status" required class="my-input py-4">
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EXCUSED">Excused</option>
          </select>
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Remarks</label>
        <input v-model="formData.remarks" type="text" class="my-input" placeholder="Optional remarks">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "AttendancePage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Course", "Date", "Status", "Remarks"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Course", value: "courseId" },
        { label: "Date", value: "attendanceDate" },
        { label: "Status", value: "status" },
        { label: "Remarks", value: "remarks" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [], courses: [],
      defFormData: { studentId: "", courseId: "", attendanceDate: "", status: "PRESENT", remarks: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
  },
};
</script>