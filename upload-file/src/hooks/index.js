/***
 * useUploadHook针对于文件上传
 * 目前：支持并发、默认模式分片上传
 * 后期：支持暂停、继续上传的功能
 */
import { reactive, ref, toRefs } from "vue";

/**
 *
 * @param 默认配置项，默认模式分片上传、并发数量3,3、分片的大小
 * @returns 返回响应式的上传进度，对应选中的文件顺序、文件选中的函数
 */
const useUploadHook = ({
  api = () => ({}),
  url = "/upload",
  mode = "sliceUpload",
  concurrent = [3, 3],
  chunkSize = 1024 * 1024 * 1, // 1MB => 1024kb 1kb => 1024byte
  styles = ["#409EFF", "#67C23A", "#E6A23C"],
}) => {
  // 校验文件的格式
  const _fileFormateValidate = (e) => {
    // 可以限制文件大小、文件名称等
    const selectFiles = e.target.files;
    const selectFilesLen = selectFiles.length;
    if (selectFilesLen <= 0) throw TypeError("至少选中一个文件吧...");
    return [selectFiles, selectFilesLen];
  };

  // 分包映射
  const _createSliceMap = (files) => {
    // 需要返回的chunk映射
    const fileChunkMap = new Map();
    // 用户配置的分片大小
    const CHUNK_SIZE = chunkSize;
    // 循环处理分包的逻辑
    Array.from(files).forEach((file) => {
      // 创建chunks数组
      const chunks = [];
      // 分包的总量
      const totalChunkCount = Math.ceil(file.size / CHUNK_SIZE);

      // 进行分包
      for (let i = 0; i < totalChunkCount; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        // console.log("chunk: => ", chunk);
        // const fileRead = new FileReader();
        // fileRead.readAsDataURL(chunk);

        // fileRead.addEventListener(
        //   "load",
        //   () => {
        //     console.log("result: =>", fileRead.result);
        //   },
        //   false
        // );

        chunks.push(chunk);
      }

      // 保存映射
      fileChunkMap.set(file, chunks);
    });
    return fileChunkMap;
  };

  // 创建formData映射
  const _createSliceFormData = (filesMap) => {
    filesMap.forEach((chunks, file) => {
      const newChunks = chunks.map((chunk, index) => {
        const formData = new FormData();
        formData.append("index", index);
        formData.append("chunk", chunk);
        return formData;
      });
      // 重新构建映射,添加formData数据
      filesMap.set(file, newChunks);
    });
    return filesMap;
  };

  // 根据创建任务队列
  /**
   *
   * @param {*} fdFileMap
   * @return 数据格式
   */
  const _createFileTaskQueue = (fdFileMap, rates) => {
    const taskMap = new Map();

    fdFileMap.forEach((chunks, file) => {
      const queue = [];
      chunks.forEach((chunk) => {
        // 创建任务
        const taskFn = () => {
          return new Promise((resolve, reject) => {
            api(url, chunk, {
              onUploadProgress(e) {
                // 找到对应的文件对象
                const index = Array.from(fdFileMap.keys()).findIndex(
                  (f) => f === file
                );
                // 文件的总大小
                const totalFileSize = file.size;
                // 分包下载的字节数
                const loadBytes = e.bytes;
                if (rates[index]) {
                  // 更新已经下载的字节数
                  rates[index].value._loadedBytes += loadBytes;
                  // 获取已经下载的字节数
                  const currentLoadedByte = rates[index].value._loadedBytes;
                  // 更新下载进度
                  rates[index].value.rate =
                    (currentLoadedByte / totalFileSize).toFixed(2) * 100;
                } else {
                  console.log("有些异常...");
                }
              },
            })
              .then(resolve)
              .catch(reject);
          });
        };
        queue.push(taskFn);
      });

      taskMap.set(file, queue);
    });

    return taskMap;
  };

  // 创建需要返回的rates对象
  const _createRates = (files) => {
    const rates = {};
    // 响应式数据
    Array.from(files).forEach((file, index) => {
      rates[index] = ref({
        rate: 0,
        _loadedBytes: 0,
        style: styles[index],
      });
    });
    return rates;
  };

  const _processNextFn = (tasks, num) => {
    // 没有对num进行严格把控，可能是num，可以在初始化的时候对num进行把控

    // 定义活跃的并发数量
    let activeRequest = 0;
    // 需要并发的任务队列
    const requestQueue = [...tasks];

    const _processNext = () => {
      // 如果任务队列清空了，执行完毕
      if (requestQueue.length === 0) return Promise.resolve();
      // 如果还有可执行请求的数量
      if (activeRequest < num) {
        // 增加活跃数量
        activeRequest++;
        // 获取任务
        const task = requestQueue.shift();
        // 执行任务
        task().then(() => {
          activeRequest--;
        });
        // 执行下一次并发任务
        return _processNext();
      } else {
        // 没有空闲的名额，只能推到下一次tick中
        return new Promise((resolve) => {
          setTimeout(() => resolve(_processNext()), 0);
        });
      }
      return _processNext();
    };

    return _processNext();
  };

  // 并发任务函数
  const _concurrentTaskQueue = (taskQueue, concurrent) => {
    // 并发最小不能低于0，最大不能超过5
    if (
      Math.min.apply(null, concurrent) <= 0 ||
      Math.max.apply(null, concurrent) > 6
    ) {
      throw TypeError("并发的数量区间在(0, 5]之间...");
    }

    for (let i = 0; i < taskQueue.size; i++) {
      const concurrentNum = concurrent[i];
      taskQueue.forEach((tasks) => {
        // 这个地方并发，拿不到值，可以通过promise或者回调函数给外界，最好是回调函数合适
        // 暂时没有处理
        _processNextFn(tasks, concurrentNum);
      });
    }
  };

  const setUploadFileFn = (e) => {
    /**
     *  数据格式：
     *  Map: {
     *    0: file => [chunks, chunks] chunks => formData => index chunk
          1: file => [chunks, chunks]
     *  }
     *
     *
     */

    const [selectFiles] = _fileFormateValidate(e);

    const rates = _createRates(selectFiles);

    const fileChunkMap = _createSliceMap(selectFiles);

    console.log(
      "fileChunkMap: =>  bug 选中多个文件，进度条宽度会超出100%, 后期加入indexDB数据库试试"
    );

    const fileFormDataMap = _createSliceFormData(fileChunkMap);

    const requestTaskQueueMap = _createFileTaskQueue(fileFormDataMap, rates);

    _concurrentTaskQueue(requestTaskQueueMap, concurrent);

    return rates;
  };

  return setUploadFileFn;
};

export { useUploadHook };
