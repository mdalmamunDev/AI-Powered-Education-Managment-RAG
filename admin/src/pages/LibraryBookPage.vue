<template>
  <data-table title="All Library Books" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.title }}</td>
      <td class="my-td text-gray-300">{{ item.author }}</td>
      <td class="my-td text-gray-300">{{ item.isbn }}</td>
      <td class="my-td text-gray-300">{{ item.category || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.copiesAvailable }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Title</label>
          <input v-model="formData.title" type="text" required class="my-input" placeholder="Book title">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Author</label>
          <input v-model="formData.author" type="text" required class="my-input" placeholder="Author name">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">ISBN</label>
          <input v-model="formData.isbn" type="text" required class="my-input" placeholder="e.g. 978-3-16-148410-0">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Publisher</label>
          <input v-model="formData.publisher" type="text" class="my-input" placeholder="Publisher">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Publication Year</label>
          <input v-model.number="formData.publicationYear" type="number" min="0" class="my-input" placeholder="e.g. 2020">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Category</label>
          <input v-model="formData.category" type="text" class="my-input" placeholder="e.g. Computer Science">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Available Copies</label>
          <input v-model.number="formData.copiesAvailable" type="number" min="0" required class="my-input">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "LibraryBookPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Title", "Author", "ISBN", "Category", "Available Copies"],
      filterOrderOptions: [
        { label: "Title", value: "title" },
        { label: "Author", value: "author" },
        { label: "ISBN", value: "isbn" },
        { label: "Category", value: "category" },
        { label: "Available Copies", value: "copiesAvailable" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      defFormData: { isbn: "", title: "", author: "", publisher: "", publicationYear: null, category: "", copiesAvailable: 0 },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>