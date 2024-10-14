import { virtualData } from "./data";
import { setSourceData, setVirtualWrapperRef } from "./operation";
import { toRefs } from "vue";

const useVritualList = ({
  virtualWrapper, // 是否设置默认值，不需要
}) => {
  const init = () => {
    // 初始化数据, 默认初始化20条数据
    setSourceData(1, 20);
    // 获取虚拟列表的容器
    setVirtualWrapperRef(virtualWrapper);
  };

  const setRequestAnimation = (callback) => {
    let startTime = new Date().getTime();
    requestAnimationFrame(function cb() {
      const endTime = new Date().getTime();
      callback();
      if (endTime - startTime >= 1000 / 30) {
        startTime = endTime;
        cb();
      }
    });
  };

  // 滚动时的函数
  const scrollFn = (e) => {
    const { scrollTop } = e.target;
    setRequestAnimation(() => {
      const hds = virtualData.visiableViewElementHeight;
      hds.forEach((hd, index) => {
        if (
          scrollTop >= Math.min.apply(null, hd.height) &&
          scrollTop < Math.max.apply(null, hd.height)
        ) {
          // 在范围内话，就直接更新起始值
          virtualData.startIndex = index;
        }
      });
    });
  };

  // 初始化函数
  init();

  return {
    ...toRefs(virtualData),
    scrollFn,
  };
};

export default useVritualList;
