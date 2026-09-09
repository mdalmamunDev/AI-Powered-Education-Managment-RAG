<template>
  <data-table title="All Guardians" :headers="headers" :def-form-data="defFormData" :action-info="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">
        <span class="font-medium">{{ item.firstName }} {{ item.lastName }}</span>
      </td>
      <td class="my-td text-gray-300">{{ item.relationship }}</td>
      <td class="my-td text-gray-300">{{ item.email || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.phone || 'N/A' }}</td>
      <td class="my-td text-gray-300">{{ item.occupation || 'N/A' }}</td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">First Name</label>
          <input v-model="formData.firstName" type="text" required class="my-input" placeholder="First name">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Last Name</label>
          <input v-model="formData.lastName" type="text" required class="my-input" placeholder="Last name">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Relationship</label>
          <select v-model="formData.relationship" required class="my-input py-4">
            <option disabled value="">Select</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Guardian">Guardian</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Occupation</label>
          <input v-model="formData.occupation" type="text" class="my-input" placeholder="Occupation">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Email</label>
          <input v-model="formData.email" type="email" class="my-input" placeholder="guardian@example.com">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Phone</label>
          <input v-model="formData.phone" type="text" class="my-input" placeholder="Phone">
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "GuardianPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Name", "Relationship", "Email", "Phone", "Occupation"],
      filterOrderOptions: [
        { label: "Name", value: "firstName" },
        { label: "Relationship", value: "relationship" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Occupation", value: "occupation" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      defFormData: { firstName: "", lastName: "", relationship: "", email: "", phone: "", occupation: "" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>