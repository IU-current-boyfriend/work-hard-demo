<template>
  <div
    class="virtual-container"
    :style="{
      width,
      height: `${height}px`,
    }"
    @scroll="virtualScrollHandleFn"
  >
    <div
      class="virtual-content"
      :style="{
        width,
        height: `${itemHeight * itemSize}px`,
      }"
    >
      <div
        class="virtual-item"
        v-for="(item, index) of fillVirtual"
        :key="index"
        :style="{
          width: item.width,
          height: item.height,
          top: item.top,
        }"
      >
        {{ index }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const { height, width, itemHeight, itemSize } = defineProps({
  height: Number,
  width: String,
  itemHeight: Number,
  itemSize: Number,
});

// 记录滚动的距离
const offsetDistance = ref(0);

// 上缓冲区 + 可视区域 + 下缓冲区填充元素的容器
const fillVirtual = ref([]);

const virtualScrollHandleFn = (e) => {
  const { scrollTop } = e.target;
  // 记录更新滚动的距离
  offsetDistance.value = scrollTop;
};

const updateScrollView = (offset) => {
  // 计算可视区域的起始索引值: 滚掉的高度偏移量 / 固定元素的高度 ？
  const startIndex = Math.floor(offset / itemHeight);

  // 计算上缓冲区起始索引值
  const finialStartIndex = Math.max(0, startIndex - 2);

  // 可视区域可以存放的最大元素数量
  const numVisible = Math.ceil(height / itemHeight);

  // 计算下缓冲区的结束索引值
  // endIndex缓存区 itemSize - 1有区别 itemSize的区别很大
  const endIndex = Math.min(itemSize, startIndex + numVisible + 2);

  console.log("itemSize: =>", itemSize - 1, startIndex + numVisible + 2);

  const newFillVirtual = [];

  // 循环添加元素
  for (let i = finialStartIndex; i < endIndex; i++) {
    newFillVirtual.push({
      width: "100%",
      height: `${itemHeight}px`,
      // 计算每个item元素的top值
      top: `${itemHeight * i}px`,
    });
  }
  fillVirtual.value = newFillVirtual;
};

watch(
  () => offsetDistance.value,
  (newValue) => {
    updateScrollView(newValue);
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
.virtual-container {
  position: relative;
  margin: 100px auto;
  border: 1px solid #333;
  overflow: auto;
}
.virtual-item {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background-color: pink;
  border-bottom: 1px solid #000;
  box-sizing: border-box;
}

.virtual-item:last-child {
  border-bottom: none;
}
</style>
