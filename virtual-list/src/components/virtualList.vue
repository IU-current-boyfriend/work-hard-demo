<template>
  <div class="virtual-list-container">
    <!-- 滚动的盒子 -->
    <div class="virtual-scroll-content" @scroll="(e) => handleScrollFn(e)">
      <!-- 保存虚拟列表的容器 -->
      <div
        class="virtual-list-wrapper"
        :style="{
          paddingTop: `${paddingSet.paddingTop}px`,
          paddingBottom: `${paddingSet.paddingBottom}px`,
        }"
      >
        <div
          class="virtual-list-item"
          v-for="(item, index) of currentData"
          :key="index"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVirtualHook from "../hooks/useVritualHook";
/**
 * virtualListData: 可视区域展示的虚拟列表数据
 * handleScrollFn: 滚动区域绑定的滚动事件处理函数
 */
const { currentData, paddingSet, handleScrollFn } = useVirtualHook();
</script>

<style scoped>
.virtual-list-container {
  height: 100%;
}
.virtual-scroll-content {
  height: 100%;
  overflow-y: auto;
}
.virtual-list-item {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  border-bottom: 1px solid #000;
}
</style>
