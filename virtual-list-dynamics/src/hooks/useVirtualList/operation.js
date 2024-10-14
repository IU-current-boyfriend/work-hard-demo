import { virtualData } from "./data";
import { getData } from "./utils";
import { ref, nextTick, watch, toRaw } from "vue";

const setSourceData = (init, count) => {
  virtualData.dataSource = [
    // 这个地方不知道在哪里多包裹一层响应式对象，之后看一下
    ...toRaw(virtualData.dataSource),
    ...getData(init, count),
  ];
};

const setVisiableViewData = () => {
  virtualData.visiableViewData = virtualData.dataSource.slice(
    virtualData.startIndex,
    virtualData.endIndex
  );
};

const sexViewMaxCount = () => {
  // 容器的高度
  const viewHeight = virtualData.virtualWrapper.offsetHeight;
  setMaxCount(viewHeight, undefined, (maxCount) => {
    virtualData.maxCount = maxCount + 1;
  });
  setViewEndIndex();
  setVisiableViewData();
  setVisiableViewElementHeight();
  watchingStartIndex();
};

const setVisiableViewElementHeight = () => {
  virtualData.visiableViewElementHeight = virtualData.dataSource
    // .slice(virtualData.startIndex, virtualData.endIndex)
    .reduce((r, c) => {
      r.push(c);
      return r;
    }, []);

  // [0, 115] => 0 -> i === 1 => [0, r.height]
  // [116, 115 + 110 => 260] => 1 => [r.height + 1, c.height + r.height]
  // [260, 260 + 110 => 370] => 2
  // ...
  // [] => i === a.length => []
  const result = [];
  virtualData.visiableViewElementHeight.reduce((r, c, i, a) => {
    let temp = null;
    if (i === 1) {
      temp = {
        height: [r.height + 1, c.height + r.height],
        title: c.title,
      };
      result.push(
        {
          height: [0, r.height],
          title: r.title,
        },
        temp
      );
    } else {
      temp = {
        height: [r.height[1] + 1, c.height + r.height[1]],
        title: c.title,
      };
      result.push(temp);
    }
    return temp;
  });

  virtualData.visiableViewElementHeight = result;
};

const setViewEndIndex = () => {
  const cIdx = virtualData.startIndex + virtualData.maxCount;

  virtualData.endIndex = virtualData.dataSource[cIdx]
    ? cIdx
    : virtualData.dataSource.length - 1;
};

const setMaxCount = (viewHeight, source = virtualData.dataSource, callback) => {
  let hd = 0;
  let count = 0;
  let maxCount = 0;
  source.forEach((item, index) => {
    if (item.height) {
      try {
        if (hd >= viewHeight) {
          throw Error();
        } else {
          hd += item.height;
          count++;
        }
      } catch (e) {
        maxCount = count;
      }
    }
  });
  callback && callback(maxCount);
};

const setVirtualWrapperRef = (refName) => {
  nextTick(() => {
    // 现在还是虚拟节点阶段，不通过nextTick的话，获取不到阶段元素
    virtualData.virtualWrapper = document.getElementById(refName);
    sexViewMaxCount();
  });
};

const updateSourceData = () => {
  virtualData.endIndex >= virtualData.dataSource.length - 1 &&
    setSourceData(virtualData.startIndex, virtualData.dataSource.length * 2);
};

const setPaddingSet = () => {
  // startIndex等于0的时候，paddingTop为0
  const hd = virtualData.visiableViewElementHeight[virtualData.startIndex - 1];
  const len = virtualData.visiableViewElementHeight.length;
  if (virtualData.startIndex === 0) virtualData.paddingSet.paddingTop = 0;
  if (hd) {
    const pdTop = hd.height[1];
    const pdBottom = virtualData.visiableViewElementHeight[len - 1].height[1];
    virtualData.paddingSet.paddingTop = pdTop;
    virtualData.paddingSet.paddingBottom = pdBottom;
  }
};

const watchingStartIndex = () => {
  watch(
    () => virtualData.startIndex,
    (newStartIndex, oldStartIndex) => {
      setViewEndIndex();
      setVisiableViewData();
      updateSourceData();
      setPaddingSet();
      setVisiableViewElementHeight();
    },
    {
      immediate: true,
    }
  );
};

export { setSourceData, setVirtualWrapperRef };
