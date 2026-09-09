<template>
  <div class="w-full">
    <div v-if="!resData" class="w-full min-h-[70vh] flex flex-col items-center justify-center">
      <span class="w-full flex justify-center items-center">
        <div role="status">
          <img src="/icons/loader.svg" class="w-24 h-24" alt="">
          <span class="sr-only">Loading...</span>
        </div>
      </span>
    </div>
    <div v-else-if="!resData.data?.length && notingToShow" class="w-full min-h-24 flex flex-col items-center justify-center">
      <slot name="empty">
        <h3 class="w-full flex justify-center items-center">
          Nothing to show
        </h3>
      </slot>
    </div>

    <slot class="w-full" v-else>
      <!--  -->
    </slot>


    <div v-show="resData?.pagination?.currentPage < resData?.pagination?.totalPages"
      class="w-full h-48 flex items-center justify-center">
      <span class="flex justify-center items-center" ref="loading">
        <div role="status">
          <img src="/icons/loader.svg" class="w-24 h-24" alt="">
          <span class="sr-only">Loading...</span>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationCustomComp',
  data() {
    return {
      // current1: 1,
    };
  },
  props: {
    customUrl: String,
    resData: Object,
    notingToShow: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.setupObserver();
  },
  methods: {
    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.fetchData({
              customUrl: this.customUrl,
              page: this.resData?.pagination?.currentPage + 1,
              callback: (dd, { data }) => {
                data.data?.unshift(...this.resData.data || {})
                this.$emit('setData', data);
              }
            }); // Fetch more courses when visible

          }
        });
      });

      observer.observe(this.$refs.loading); // Observe the loading element
    },
  }
};
</script>
