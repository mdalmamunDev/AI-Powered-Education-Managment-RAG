<template>
  <div class="flex items-center gap-4 bg-1 p-4 text-light">
    <button @click="$router.back()" class="text-3xl p-1 hover:text-white">
      <i class="fa fa-angle-left"></i>
    </button>
    <img class="w-20 h-20 rounded-full object-cover" :src="showImg()" alt="">
    <div>
      <h3 class="text-white text-lg">Coach Name</h3>
      <span>Jane Cooper</span>
      <div class="flex items-center gap-2 mt-3">
        <i class="fa-regular fa-envelope"></i>
        <span class="text-sm">robert@gmail.com</span>
      </div>
    </div>
  </div>
  <data-table :show-title="false" :headers="headers" :show-add-btn="false" :action-edit="false" @action-info="(item) => {show = true}" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st">Robert Fox</td>
      <td class="my-td text-gray-300">robertfox@gmail.com</td>
      <td class="my-td">{{ item }}</td>
      <td class="my-td">20</td>
    </template>
  </data-table>


  <custom-modal :flag="show" @close="show = false" title="All Sessions of Robert Fox" w="2xl">
    <div class="py-10 space-y-6">
      <div class="px-20 grid grid-cols-2 gap-y-4">
        <span>Session Title</span>
        <span class="text-light"><span class="me-2">:</span> Sprint Training</span>

        <span>Date</span>
        <span class="text-light"><span class="me-2">:</span> 07-12-2025</span>

        <span>Time</span>
        <span class="text-light"><span class="me-2">:</span> 11 AM</span>
      </div>

      <div class="flex">
        <button class="w-20 text-4xl text-light hover:text-white">
          <i class="fa fa-angle-left"></i>
        </button>
        <div class="grid grid-cols-2 gap-4">
          <img class="w-full h-48 rounded-xl object-cover border border-blue-500" :src="showImg()" alt="">
          <img class="w-full h-48 rounded-xl object-cover border border-blue-500" :src="showImg()" alt="">
        </div>
        <button class="w-20 text-4xl text-light hover:text-white">
          <i class="fa fa-angle-right"></i>
        </button>
      </div>

      <fieldset class="border border-gray-600 rounded-md p-4 mx-16">
        <legend class="px-2 text-sm font-medium text-white">Feedback</legend>
        <p class="text-light text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi labore mollitia doloremque voluptatem minima possimus eos veritatis ut, inventore rerum saepe aut cupiditate placeat voluptate temporibus, atque, asperiores esse eveniet distinctio reiciendis quia iste! Laboriosam nulla explicabo pariatur accusamus rem, obcaecati quidem aut natus expedita iure eligendi fugit corrupti ad vel quod cupiditate aspernatur nesciunt aliquid! Atque exercitationem distinctio eius voluptas, sit nemo deleniti. Nemo, optio ipsa.
        </p>
      </fieldset>
    </div>
  </custom-modal>
</template>

<script>
import CustomModal from '@/components/CustomModal.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: "SessionManagementDetailsPage",
  components: { DataTable, CustomModal },
  data() {
    return {
      headers: ["Name", "E-mail", "Total Private Session", "Total Athlete"],
      filterOrderOptions: [
        { label: "Name", value: "name" },
        { label: "E-mail", value: "email" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      show: false,
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
  },
};
</script>