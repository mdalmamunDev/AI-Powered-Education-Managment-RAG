<template>
  <data-table title="All Advisements" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.teacher?.firstName }} {{ item.teacher?.lastName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.meetingDate) }}</td>
      <td class="my-td text-gray-300">{{ printStr(item.topic, 40) || 'N/A' }}</td>
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
          <label class="my-label">Teacher (Advisor)</label>
          <select v-model="formData.teacherId" required class="my-input py-4">
            <option disabled value="">Select teacher</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.firstName }} {{ t.lastName }}</option>
          </select>
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Meeting Date</label>
        <input type="date" :value="toInputDate(formData.meetingDate)" @input="formData.meetingDate = $event.target.value"
          required class="my-input">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Topic</label>
        <input v-model="formData.topic" type="text" class="my-input" placeholder="e.g. Course selection for next semester">
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Notes</label>
        <textarea v-model="formData.notes" class="my-input" rows="3" placeholder="Meeting notes"></textarea>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "AdvisementPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Teacher", "Meeting Date", "Topic"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Teacher", value: "teacherId" },
        { label: "Meeting Date", value: "meetingDate" },
        { label: "Topic", value: "topic" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [],
      teachers: [],
      defFormData: { studentId: "", teacherId: "", meetingDate: "", topic: "", notes: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
    this.httpReq({ customUrl: 'teachers?limit=200', method: 'get', callback: (data) => { this.teachers = data || []; } });
  },
  methods: {
    toInputDate(value) {
      if (!value) return "";
      return String(value).slice(0, 10);
    },
    transformSubmit(data) {
      if (data.meetingDate) data.meetingDate = this.toInputDate(data.meetingDate);
      return data;
    },
  },
};
</script>