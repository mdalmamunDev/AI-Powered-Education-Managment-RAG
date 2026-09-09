<template>
  <data-table title="All Classrooms" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.building }}</td>
      <td class="my-td text-gray-300">{{ item.roomNumber }}</td>
      <td class="my-td text-gray-300">{{ item.capacity }}</td>
      <td class="my-td text-gray-300">{{ item.equipment || 'N/A' }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Building</label>
          <input v-model="formData.building" type="text" required class="my-input" placeholder="e.g. Building A">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Room Number</label>
          <input v-model="formData.roomNumber" type="text" required class="my-input" placeholder="e.g. 101">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Capacity</label>
          <input v-model.number="formData.capacity" type="number" min="1" required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Equipment</label>
          <input v-model="formData.equipment" type="text" class="my-input" placeholder="e.g. Projector, Whiteboard">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "ClassroomPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Building", "Room Number", "Capacity", "Equipment"],
      filterOrderOptions: [
        { label: "Building", value: "building" },
        { label: "Room Number", value: "roomNumber" },
        { label: "Capacity", value: "capacity" },
        { label: "Equipment", value: "equipment" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      defFormData: { building: "", roomNumber: "", capacity: null, equipment: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>