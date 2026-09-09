<template>
  <!-- <div v-if="dataList?.pagination" class="flex justify-end">
    <a-pagination
    :current="parseInt(dataList.pagination.currentPage)"
    :total="parseInt(dataList.pagination.totalCount)"
    :pageSize="parseInt(dataList.pagination.itemsPerPage)"
    show-quick-jumper
    show-size-changer
    @change="onChange"
    @showSizeChange="onShowSizeChange"
  />
  </div> -->
  <div v-if="true" class="flex justify-center mt-5">
    <a-pagination :current="5" :total="100" :pageSize="10" show-quick-jumper show-size-changer @change="{ }"
      @showSizeChange="{ }" />
  </div>
</template>

<script>
export default {
  name: 'PaginationComp',
  data() {
    return {
      // current1: 1,
    };
  },
  methods: {
    onChange(page) {
      this.filters.page = page;
      this.fetchData();
    },
    onShowSizeChange(current, size) {
      this.filters.page = current;
      this.filters.limit = size;
      this.fetchData();
    },
  }
};
</script>

<!-- Pagination styling lives in public/styles/main.css (theme-aware tokens) -->