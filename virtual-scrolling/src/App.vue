<template>
  <virtualComponent
    :height="500"
    :width="'200px'"
    :itemHeight="200"
    :itemSize="20"
  />
</template>

<script setup>
import virtualComponent from "./components/virtualComponent.vue";
</script>

<style scoped></style>
