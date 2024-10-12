import {
  setSourceData,
  setCurrentData,
  updateStartIndex,
} from "./virtualDataOpreation";
import { virtualData } from "./virtualData";
import { FPS_VIEW } from "./config";
import { toRefs } from "vue";

const useVirtualHook = () => {
  // 初始化函数
  function init() {
    // 初始化数据
    initData(1, 20);
  }

  function initData(index, count) {
    setSourceData(index, count);
    setCurrentData();
  }

  function setRequestAnimationFrame(callback) {
    let startTime = new Date().getTime();
    requestAnimationFrame(function cb() {
      const endTime = new Date().getTime();
      callback();
      if (endTime - startTime >= FPS_VIEW) {
        startTime = endTime;
        requestAnimationFrame(cb);
      }
    });
  }

  // 创建滚动事件的事件处理函数
  const handleScrollFn = (e) => {
    const { scrollTop } = e.target;

    setRequestAnimationFrame(() => {
      // 更新startIndex的值
      updateStartIndex(scrollTop);
    });
  };

  init();

  return {
    ...toRefs(virtualData),
    handleScrollFn,
  };
};

export default useVirtualHook;
