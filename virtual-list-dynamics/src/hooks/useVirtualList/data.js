import { reactive } from "vue";

const virtualData = reactive({
  // 总数据的容器
  dataSource: [],
  // 可视区域的容器
  visiableViewData: [],
  // 记录可视区域每个元素高度的容器
  visiableViewElementHeight: [],
  // 可视区域的起始索引值
  startIndex: 0,
  // 可视区域的结束索引值
  endIndex: 0,
  // 容纳虚拟列表的容器padding集合
  paddingSet: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  // 虚拟列表滚动的容器
  virtualWrapper: null,
  // 最大容纳的数量
  maxCount: 0,
});

export { virtualData };
