<template>
  <div class="demo">
    <input type="file" @change="selectFileUpload" multiple />
    <div class="one-progress-container">
      <div class="one" :style="{ width: `${fileOneRate}%` }"></div>
    </div>
    <div class="two-progress-container">
      <div class="two" :style="{ width: `${fileTwoRate}%` }"></div>
    </div>
    <div class="three-progress-container">
      <div class="three" :style="{ width: `${fileThreeRate}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { uploadApi } from "@/api/modules";
import { ref } from "vue";
const fileOneRate = ref(0);
const fileTwoRate = ref(0);
const fileThreeRate = ref(0);

const selectFileUpload = (e) => {
  const files = e.target.files;
  const filesLen = files.length;
  let oneSize = 0;
  let twoSize = 0;
  let threeSize = 0;
  if (filesLen <= 0) return window.alert("至少选择一个文件上传吧");

  // 对文件进行分包处理
  const sliceFileChunks = (file) => {
    const { size } = file;
    const chunks = [];
    // 定义分包的大小
    const CHUNK_SIZE = 1024 * 1024 * 1; // 1MB
    // 计算分包的数量
    const totalChunks = Math.ceil(size / CHUNK_SIZE);
    // 然后开始分包
    for (let i = 0; i < totalChunks; i++) {
      const formData = new FormData();
      // [0, 1mb] [1mb, 2mb]
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      // 创建form-data格式
      formData.append("index", i);
      formData.append("chunk", chunk);
      // 保存到数组内部
      chunks.push(formData);
    }

    return chunks;
  };

  // 创建文件的映射
  const createFileMap = () => {
    const fileMap = new Map();
    // [].length 2的32次方
    Array.from(files, (file) => {
      const chunks = sliceFileChunks(file);
      // 保存到fileMap映射当中
      fileMap.set(file, chunks);
      return file;
    });
    return fileMap;
  };

  // 上传文件到服务器
  /**
   *
   * @param fileMap 需要上传的文件映射
   * @param num 浏览器并发请求的次数，可以是多个，[3,5] => 数组的形式，以此对应文件映射的顺序, 最多不能超过5个
   */
  const createTaskQueue = (fileMap) => {
    console.log("fileMa: =>", fileMap);

    const taskQueueMap = new Map([]);

    // 需要按照映射，创建需要的异步任务
    for (const [file, buffer] of fileMap.entries()) {
      const tasks = [];

      buffer.forEach((blob) => {
        const asyncTask = () => {
          return new Promise((resolve, reject) => {
            uploadApi("/upload", blob, {
              onUploadProgress(e) {
                // 当前文件
                const realFile = fileMap.keys().find((item) => item === file);

                const realFileIndex = Array.from(fileMap.keys()).findIndex(
                  (item) => item === file
                );

                switch (realFileIndex) {
                  case 0:
                    oneSize += e.bytes;
                    fileOneRate.value =
                      (oneSize / realFile.size).toFixed(2) * 100;
                    break;
                  case 1:
                    twoSize += e.bytes;
                    fileTwoRate.value =
                      (twoSize / realFile.size).toFixed(2) * 100;
                    break;
                  case 2:
                    threeSize += e.bytes;
                    fileThreeRate.value =
                      (threeSize / realFile.size).toFixed(2) * 100;
                    break;
                }
              },
            })
              .then((res) => {
                resolve(res.data);
              })
              .catch((err) => {
                reject(err);
              });
          });
        };
        tasks.push(asyncTask);
      });
      taskQueueMap.set(file, tasks);
    }
    return taskQueueMap;
  };

  // 获取到文件的映射
  const filesMap = createFileMap();

  // 并发函数
  const concurrentRequestFn = (tasks, num) => {
    // 定义当前并发的数量
    let activeRequestNum = 0;
    // 定义并发的任务队列
    const taskQueue = [...tasks];

    const processNextTask = () => {
      // 如果任务队列中没有任务，则直接返回结果
      if (taskQueue.length <= 0)
        return Promise.resolve("任务已经全部完成。。。");

      // 如果当前并发的数量小于设置的并发数量
      if (activeRequestNum < num) {
        // 激活并发数量+1
        activeRequestNum++;
        // 取出一个任务,从头部取出来
        const task = taskQueue.shift();
        // 执行该任务
        task().then(() => {
          // 释放线程
          activeRequestNum--;
          return Promise.resolve();
        });
        // 任务结束,执行下一个任务
        return processNextTask();
      } else {
        // 将任务推到下一个tick执行
        return new Promise((resolve) => {
          setTimeout(() => resolve(processNextTask()), 0);
        });
      }
    };

    return processNextTask();
  };

  /**
   *
   * @param taskMap 并发的任务队列
   * @param concurrentNums 并发的任务数量
   */
  const concurrentRequest = (taskMap, concurrentNums) => {
    let index = 0;
    // 检测并发的合法值
    if (
      Math.max.apply(null, concurrentNums) > 5 ||
      Math.min.apply(null, concurrentNums) <= 0
    )
      throw TypeError("请传入合法的并发数量");

    taskMap.forEach((tasks) => {
      concurrentRequestFn(tasks, concurrentNums[index++]);
    });
  };

  if (filesMap.size > 0) {
    // 获取任务队列的映射
    const taskMap = createTaskQueue(filesMap);
    // 根据任务队列的映射并发请求
    concurrentRequest(taskMap, [3, 5, 3]);
  } else {
    console.log("转换文件映射出了些问题。。。");
  }
};
</script>

<style scoped>
.one-progress-container,
.two-progress-container,
.three-progress-container {
  width: 300px;
  height: 20px;
  border: 1px solid #000;
  margin: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.one,
.two,
.three {
  width: 100%;
  display: inline-block;
  height: 100%;
  transition: all 0.3s;
}

.one {
  background-color: purple;
}

.two {
  background-color: pink;
}

.three {
  background-color: green;
}
</style>
