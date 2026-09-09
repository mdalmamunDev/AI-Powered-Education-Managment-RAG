<template>
  <data-table title="All League’s List" :headers="headers" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st ps-8">{{ item.name || 'N/A' }}</td>
      <td class="my-td text-light">{{ item.description || 'N/A' }}</td>
      <td class="my-td">{{ item.score || 0 }}</td>
    </template>

    <template #modal>
      <!-- Name -->
      <div class="p-1 my-3">
        <label class="my-label">Name</label>
        <input v-model="formData.name" type="text" class="my-input" placeholder="Enter name">
      </div>
      <!-- Description -->
      <div class="p-1 my-3">
        <label class="my-label">Description</label>
        <input v-model="formData.description" type="text" class="my-input" placeholder="Enter a sort description">
      </div>
      <!-- Score -->
      <div class="p-1 my-3">
        <label class="my-label">Score</label>
        <input v-model="formData.score" type="number" min="0" max="1000" class="my-input" placeholder="Enter score">
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "TaskPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Name", "Description", "Score"],
      filterOrderOptions: [
        { label: "Name", value: "name" },
        { label: "Description", value: "description" },
        { label: "Score", value: "score" },
        { value: 'createdAt', label: 'Date Created' },
      ],
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>