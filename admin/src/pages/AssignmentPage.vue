<template>
  <data-table title="All Assignments" :headers="headers" :def-form-data="defFormData" :modal-w="'3xl'" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.title }}</td>
      <td class="my-td text-gray-300">{{ item.course?.courseName }}</td>
      <td class="my-td text-gray-300">{{ item.teacher?.firstName }} {{ item.teacher?.lastName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.dueDate) }}</td>
      <td class="my-td text-gray-300">{{ item.totalPoints }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Title</label>
        <input v-model="formData.title" type="text" required class="my-input" placeholder="Assignment title">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Course</label>
          <select v-model="formData.courseId" required class="my-input py-4">
            <option disabled value="">Select course</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.courseName }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Teacher</label>
          <select v-model="formData.teacherId" required class="my-input py-4">
            <option disabled value="">Select teacher</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.firstName }} {{ t.lastName }}</option>
          </select>
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Description</label>
        <textarea v-model="formData.description" class="my-input" rows="2" placeholder="Description"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Due Date</label>
          <input v-model="formData.dueDate" type="date" required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Total Points</label>
          <input v-model.number="formData.totalPoints" type="number" min="1" required class="my-input">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "AssignmentPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Title", "Course", "Teacher", "Due Date", "Total Points"],
      filterOrderOptions: [
        { label: "Title", value: "title" },
        { label: "Course", value: "courseId" },
        { label: "Teacher", value: "teacherId" },
        { label: "Due Date", value: "dueDate" },
        { label: "Total Points", value: "totalPoints" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      courses: [], teachers: [],
      defFormData: { title: "", courseId: "", teacherId: "", description: "", dueDate: "", totalPoints: null },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'courses?limit=200', method: 'get', callback: (data) => { this.courses = data || []; } });
    this.httpReq({ customUrl: 'teachers?limit=200', method: 'get', callback: (data) => { this.teachers = data || []; } });
  },
};
</script>