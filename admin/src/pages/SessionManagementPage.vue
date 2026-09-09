<template>
  <data-table title=" Assign Assignment List" :headers="headers" :show-add-btn="false" :show-action="false"
  :show-search="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st ps-8">{{ item.title }}</td>
      <td class="my-td">{{ getDate(item.date) }}</td>
      <td class="my-td"> {{ getTime(item.date) }}</td>
      <td class="my-td">
        <user-with-email :user="item.athlete" />
      </td>
      <td class="my-td">
        <user-with-email :user="item.coach" />
      </td>
      <td class="my-td" v-html="printStatus(item.status)"></td>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';
import UserWithEmail from '@/components/UserWithEmail.vue';

export default {
  name: "SessionManagementPage",
  components: { DataTable, UserWithEmail },
  data() {
    return {
      headers: ["Title", "Date", "Time", "Athlete", "Coach", "Status"],
      filterOrderOptions: [
        { label: "Title", value: "title" },
        { label: "Date", value: "date" },
        { label: "Athlete", value: "athleteId" },
        { label: "Coach", value: "coachId" },
        { label: "Status", value: "status" },
        { value: 'createdAt', label: 'Date Created' },
      ],
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>