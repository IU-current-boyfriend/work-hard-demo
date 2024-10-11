<template>
  <div class="upload-container">
    <input type="file" @change="handleUploadMethod" multiple />
    <!-- 根据rates循环产生进度条 -->
    <div class="process-list">
      <div
        class="process-container"
        v-for="(item, index) of rates.data"
        :key="index"
      >
        <div
          class="process"
          :style="{ width: `${item.rate}%`, backgroundColor: `${item.style}` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { uploadApi } from "@/api/modules";
import { useUploadHook } from "@/hooks";
import { reactive } from "vue";

const rates = reactive({
  data: [],
});

const handleUpload = useUploadHook({
  api: uploadApi,
  url: "/upload",
  mode: "sliceUpload",
  concurrent: [3, 5, 4, 2, 3],
  chunkSize: 1024 * 1024 * 1, // 1MB 默认
  styles: ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#303133"],
});

const handleUploadMethod = (e) => {
  const res = handleUpload(e);

  rates.data = res;

  console.log("rates: =>", rates);
};
</script>

<style scoped>
.process-list {
  margin-top: 100px;
}

.process-container {
  width: 400px;
  height: 20px;
  border: 1px solid #999;
  margin: 15px 0;
  border-radius: 10px;
  overflow: hidden;
}

.process {
  width: 0;
  display: inline-block;
  height: 20px;
  transition: all 0.2s;
}
</style>
