<template>
  <data-table title="All Office Hours" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.teacher?.firstName }} {{ item.teacher?.lastName }}</td>
      <td class="my-td text-gray-300">{{ humanize(item.dayOfWeek) }}</td>
      <td class="my-td text-gray-300">{{ getTime(item.startTime) }}</td>
      <td class="my-td text-gray-300">{{ getTime(item.endTime) }}</td>
      <td class="my-td text-gray-300">{{ item.location || 'N/A' }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Teacher</label>
        <select v-model="formData.teacherId" required class="my-input py-4">
          <option disabled value="">Select teacher</option>
          <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.firstName }} {{ t.lastName }}</option>
        </select>
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
        <label class="my-label">Location</label>
        <input v-model="formData.location" type="text" class="my-input" placeholder="e.g. Room 204, Building B">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "OfficeHourPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Teacher", "Day", "Start Time", "End Time", "Location"],
      filterOrderOptions: [
        { label: "Teacher", value: "teacherId" },
        { label: "Day", value: "dayOfWeek" },
        { label: "Start Time", value: "startTime" },
        { label: "End Time", value: "endTime" },
        { label: "Location", value: "location" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      teachers: [],
      days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      defFormData: { teacherId: "", dayOfWeek: "MONDAY", startTime: "", endTime: "", location: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'teachers?limit=200', method: 'get', callback: (data) => { this.teachers = data || []; } });
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