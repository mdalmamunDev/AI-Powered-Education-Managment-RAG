<template>
  <div id="app">
    <!-- <SpeedInsights></SpeedInsights> -->
    <router-view />
    <!-- This renders matched component -->
  </div>
</template>

<script>
// import { SpeedInsights } from '@vercel/speed-insights/vue';
export default {
  name: "App",
  components: {
    // SpeedInsights,
  },
};
</script>

<style>
</style>
