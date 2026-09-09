<template>
  <data-table title="All Schedules" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ item.classroom ? `${item.classroom.building} - ${item.classroom.roomNumber}` : 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ humanize(item.dayOfWeek) }}</td>
      <td class="my-td text-gray-300">{{ getTime(item.startTime) }}</td>
      <td class="my-td text-gray-300">{{ getTime(item.endTime) }}</td>
      <td class="my-td text-gray-300">{{ item.semester }}</td>
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
          <label class="my-label">Classroom</label>
          <select v-model="formData.classroomId" required class="my-input py-4">
            <option disabled value="">Select classroom</option>
            <option v-for="r in classrooms" :key="r.id" :value="r.id">{{ r.building }} - {{ r.roomNumber }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Day of Week</label>
          <select v-model="formData.dayOfWeek" required class="my-input py-4">
            <option v-for="d in days" :key="d" :value="d">{{ humanize(d) }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Start Time</label>
          <input type="time" :value="toInputTime(formData.startTime)" @input="formData.startTime = $event.target.value"
            required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">End Time</label>
          <input type="time" :value="toInputTime(formData.endTime)" @input="formData.endTime = $event.target.value"
            required class="my-input">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Semester</label>
        <input v-model="formData.semester" type="text" required class="my-input" placeholder="e.g. Fall 2025">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "SchedulePage",
  components: { DataTable },
  data() {
    return {
      headers: ["Course", "Classroom", "Day", "Start Time", "End Time", "Semester"],
      filterOrderOptions: [
        { label: "Course", value: "courseId" },
        { label: "Classroom", value: "classroomId" },
        { label: "Day", value: "dayOfWeek" },
        { label: "Start Time", value: "startTime" },
        { label: "End Time", value: "endTime" },
        { label: "Semester", value: "semester" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      courses: [],
      classrooms: [],
      days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      defFormData: { courseId: "", classroomId: "", dayOfWeek: "MONDAY", startTime: "", endTime: "", semester: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
    this.httpReq({ customUrl: 'classrooms?limit=200', method: 'get', callback: (data) => { this.classrooms = data || []; } });
  },
  methods: {
    toInputTime(value) {
      if (!value) return "";
      const m = String(value).match(/(\d{1,2}):(\d{2})/);
      return m ? `${m[1].padStart(2, '0')}:${m[2]}` : "";
    },
    // Backend expects ISO datetime strings for @db.Time fields
    transformSubmit(data) {
      const toIso = (t) => (t ? `1970-01-01T${t}:00.000Z` : t);
      if (data.startTime) data.startTime = toIso(data.startTime);
      if (data.endTime) data.endTime = toIso(data.endTime);
      return data;
    },
  },
};
</script>