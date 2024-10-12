import { MAX_VIEW_COUNT, ITEM_HEIGHT } from "./config";
import { computed, reactive, watch } from "vue";
import { setCurrentData, setSourceData } from "./virtualDataOpreation";

const virtualData = reactive({
  dataSource: [],
  currentData: [],
  startIndex: 0,
  paddingSet: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

// 计算属性来控制endIndex
const endIndex = computed(() => {
  // 获取当前的结束索引
  const currentEIdx = virtualData.startIndex + MAX_VIEW_COUNT;
  // 判断是否大于总数据量的长度
  const eIdx = virtualData.dataSource[currentEIdx]
    ? currentEIdx
    : virtualData.dataSource.length - 1;
  return eIdx;
});

// 其实可以用watch来监听的
watch(
  () => virtualData.startIndex,
  (newStartIndex) => {
    // 1. 更新currentData
    setCurrentData(newStartIndex);

    // 2. 如果endIndex大于总量，需要更新数据
    endIndex.value >= virtualData.dataSource.length - 1 &&
      setSourceData(endIndex.value, virtualData.dataSource.length * 2);

    // 3. 更新paddingSet
    updatePaddingSet();

    function updatePaddingSet() {
      // 如果startIndex发生改变的话，我们就重新计算paddingTop，paddingBottom
      const pdTop = newStartIndex * ITEM_HEIGHT;

      // 比如说可视区域可容纳8个，endIndex就是8
      // 那么paddingBottom的计算方式就等于 => 20 - 8 => 12 * 101 => 1212
      // pdBottom的计算还是需要好好看看
      const pdBottom =
        (virtualData.dataSource.length - endIndex.value) * ITEM_HEIGHT;
      // 更新paddingSet
      virtualData.paddingSet.paddingTop = pdTop;
      virtualData.paddingSet.paddingBottom = pdBottom;
    }
  }
);

export { virtualData, endIndex };
