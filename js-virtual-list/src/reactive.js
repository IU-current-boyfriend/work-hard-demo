import { ITEM_HEIGHT, MAX_ITEM_COUNT } from "./config";
import { update, updatePaddingSet } from "./render";
import { getData } from "./utils";

const $state = {};

const data = {
  // 数据总量
  dataSource: [],
  // 可视区域展示的数据总量
  currentData: [],
  // 起始索引值 => 可视区域数据总量的开始游标
  startIndex: 0,
  // 结束索引值 => 可视区域数据总量的结束游标
  endIndex: 0,
  // 上下缓冲区边距
  paddingSet: {
    // 向下滑动，增加上边距，将固定个数的内容推到可视区域内
    paddingTop: 0,
    // 向上滑动，减少下边距，讲固定个数的内容推到可视区域内
    paddingBottom: 0,
  },
};

export function reactive(list) {
  Object.defineProperties($state, {
    dataSource: {
      get() {
        return data.dataSource;
      },
      set(newValue) {
        // 更新数据总量
        data.dataSource = newValue;
        // 更新可视区域的数据总量
        setCurrentData();
      },
    },
    currentData: {
      get() {
        return data.currentData;
      },
      set(newValue) {
        data.currentData = newValue;
        // 可视区域数据总量发生变化，则更新视图
        update($state.currentData, list);
      },
    },
    startIndex: {
      get() {
        return data.startIndex;
      },
      set(newValue) {
        if ($state.startIndex !== newValue) {
          data.startIndex = newValue;
          // 更新可视区域数据总量
          setCurrentData();
          // 判断数据是否到底，如果到底的话，再去获取数据
          // endIndex其实没有设置具体的值，endIndex相当于一个computed计算属性
          $state.endIndex >= $state.dataSource.length - 1 &&
            setDataSource(
              $state.dataSource.length + 1,
              $state.dataSource.length * 2
            );
          // 设置padding值
          setPaddingSet();
        }
      },
    },
    endIndex: {
      get() {
        return setEndIndex();
      },
    },
    paddingSet: {
      get() {
        return data.paddingSet;
      },
      set(newValue) {
        data.paddingSet = newValue;
        // 更新视图的pending值
        updatePaddingSet($state.paddingSet, list);
      },
    },
  });

  return $state;
}

function setEndIndex() {
  // [0, 8) => [startIndex, endIndex]
  // 两屏优化白屏
  // const endIndex = $state.startIndex + MAX_ITEM_COUNT * 2;
  const endIndex = $state.startIndex + MAX_ITEM_COUNT;

  return $state.dataSource[endIndex] ? endIndex : $state.dataSource.length - 1;
}

export function setDataSource(init, count) {
  $state.dataSource = [...$state.dataSource, ...getData(init, count)];
}

export function setCurrentData() {
  // 两屏优化白屏
  // const startIndex = resetStartIndex();
  $state.currentData = $state.dataSource.slice(
    $state.startIndex,
    $state.endIndex
  );
}

export function setPaddingSet() {
  // const startIndex = resetStartIndex();
  $state.paddingSet = {
    // 101
    paddingTop: $state.startIndex * ITEM_HEIGHT,
    // paddingBottom给数据总量没有展示出来的内容预留位置 20 - 8 = 12 * 101 = > 1212 - 101 = 1111
    paddingBottom: ($state.dataSource.length - $state.endIndex) * ITEM_HEIGHT,
  };
}

export function resetStartIndex() {
  return $state.startIndex <= MAX_ITEM_COUNT
    ? 0
    : $state.startIndex - MAX_ITEM_COUNT;
}
