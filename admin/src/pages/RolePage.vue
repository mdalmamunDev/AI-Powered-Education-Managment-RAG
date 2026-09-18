<template>
  <data-table title="All Roles" :headers="headers" :def-form-data="defFormData" :action-edit="false"
    :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'desc'"
    search-placeholder="Search roles here">
    <template #default="{ item }">
      <td class="my-td-1st">
        <span class="font-medium">{{ printEnum(item.title) }}</span>
        <span class="block text-xs text-gray-300">{{ item.title }}</span>
      </td>
      <td class="my-td">
        <span class="bg-4 text-accent px-3 py-1 rounded-full text-xs font-semibold">
          {{ item.permissionCount || 0 }} granted
        </span>
      </td>
      <td class="my-td">
        <span v-if="item.userCount" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {{ item.userCount }} user{{ item.userCount === 1 ? '' : 's' }}
        </span>
        <span v-else class="text-gray-300">Unassigned</span>
      </td>
      <td class="my-td text-gray-300">{{ getDate(item.createdAt) }}</td>
    </template>

    <template #modal>
      <div class="p-1 mb-3">
        <label class="my-label">Role Title</label>
        <input v-model="formData.title" type="text" required maxlength="100" class="my-input"
          placeholder="e.g. librarian">
        <p class="text-xs text-gray-300 mt-2">
          A short, unique title. Once created, tick the permissions this role may
          use on the RBAC page.
        </p>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "RolePage",
  components: { DataTable },
  data() {
    return {
      headers: ["Role", "Permissions", "Users", "Date Created"],
      filterOrderOptions: [
        { label: "Role", value: "title" },
        { label: "Date Created", value: "createdAt" },
        { label: "Date Updated", value: "updatedAt" },
      ],
      defFormData: { title: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'desc';
  },
};
</script>