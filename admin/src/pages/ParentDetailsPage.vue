<template>
  <div class="bg-1 pb-10">
    <div class="p-14 w-full max-w-5xl">
      <!-- Header with profile info -->
      <div class="flex items-center space-x-4 mb-6">
        <!-- Profile Picture -->
        <img class="w-14 h-14 object-cover rounded-full" :src="showImg(details?.profileImage)" alt="">

        <!-- Name and Address -->
        <div>
          <h2 class="text-lg font-medium mb-2">{{ details?.name || 'Unknown' }}</h2>
          <p class="text-gray-400 text-sm">{{ details?.address || 'N/A' }}</p>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Email Address -->
        <div>
          <h3 class="text-sm font-medium mb-2">Email Address</h3>
          <div class="flex items-center space-x-2 text-light">
            <i class="fa-regular fa-envelope"></i>
            <span class="text-sm">{{ details?.email || 'N/A' }}</span>
          </div>
        </div>
        <!-- Mobile -->
        <div>
          <h3 class="text-sm font-medium mb-2">Mobile Number</h3>
          <div class="flex items-center space-x-2 text-light">
            <img src="/icons/mobile.svg" alt="">
            <span class="text-sm">{{ details?.phone || 'N/A' }}</span>
          </div>
        </div>
        <!-- Completed Sessions -->
        <div>
          <h3 class="text-sm font-medium mb-2">Gender</h3>
          <div class="flex items-center space-x-2 text-light">
            <i class="fa-solid fa-venus-mars"></i>
            <span class="text-sm">{{ printEnum(details?.gender) }}</span>
          </div>
        </div>
      </div>
    </div>
    <h2 class="text-2xl mb-3 ms-1">Children / Athletes</h2>
    <data-table title="All Coach’s List" :headers="headers" :show-title="false" :show-action="false"
      :fetch-direct="false" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
      <template #default="{ item }">
        <td class="my-td-1st ps-8">{{ item.user?.name || 'N/A' }}</td>
        <td class="my-td">{{ item.user?.email || 'N/A' }}</td>
        <td class="my-td">{{ item.user?.phone || 'N/A' }}</td>
        <td class="my-td">
          <user-with-email :user="item.coach" />
        </td>
        <td class="my-td"> {{ item.score || 0 }}</td>
      </template>
    </data-table>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable.vue';
import UserWithEmail from '@/components/UserWithEmail.vue';
export default {
  name: "ParentDetailsPage",
  components: { DataTable, UserWithEmail },
  data() {
    return {
      headers: ["Name", "Email", "Phone", "Coach", "Score"],
      filterOrderOptions: [
        { label: "Name", value: "name" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Coach", value: "coachId" },
        { label: "Score", value: "score" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      id: null,
      details: {},
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.id = this.$route.params.id;

    this.fetchData({
      customUrl: 'user/u', urlSuffix: this.id,
      callback: (data) => {
        this.details = data;
      }
    })


    this.$store.commit('setFilters', {
      parentId: this.id,
    });
    this
    this.fetchData();
  }
};
</script>