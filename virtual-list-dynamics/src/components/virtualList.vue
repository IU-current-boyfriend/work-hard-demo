<template>
  <div class="virtual-container">
    <div class="virtual-content" @scroll="(e) => scrollFn(e)">
      <div
        class="virtual-list-wrapper"
        id="virtual-list-wrapper"
        :style="{
          paddingTop: `${paddingSet.paddingTop}px`,
          paddingBottom: `${paddingSet.paddingBottom}px`,
        }"
      >
        <div
          class="virtual-item"
          v-for="(item, index) of visiableViewData"
          :key="index"
          :style="{ height: `${item.height}px` }"
        >
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUpdate, onBeforeMount } from "vue";
import useVirtualList from "@/hooks/useVirtualList";

const { scrollFn, visiableViewData, paddingSet } = useVirtualList({
  virtualWrapper: "virtual-list-wrapper",
});

onBeforeMount(() => {
  // console.log("before mount...");
});

onBeforeUpdate(() => {
  // console.log("before update...");
});
</script>

<style scoped>
.virtual-container {
  height: 100%;
}
.virtual-content {
  height: 100%;
  overflow-y: auto;
}
.virtual-list-wrapper {
  height: 100%;
}
.virtual-item {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  border-bottom: 1px solid #333;
}
</style>
