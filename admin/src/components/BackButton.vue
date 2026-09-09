<template>
  <img class="cursor-pointer" @click="$router.back()" src="/icons/back.svg" alt="Back">
</template>

<script>


export default {
  name: "BackButton",
};
</script>