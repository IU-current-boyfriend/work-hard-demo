import { virtualData, endIndex } from "./virtualData";
import { getData } from "./utils";
import { ITEM_HEIGHT } from "./config";

export const setSourceData = (index, count) => {
  // setSourceData目的是什么？目的在原有的基础上增加新的数据
  virtualData.dataSource = [
    ...virtualData.dataSource,
    ...getData(index, count),
  ];
};

export const setCurrentData = (startIndex) => {
  // setCurrentData目的是什么？目的是根据当前startIndex和endIndex中切割数据
  virtualData.currentData = virtualData.dataSource.slice(
    startIndex !== undefined ? startIndex : virtualData.startIndex,
    endIndex.value
  );
};

export const updateStartIndex = (scrollTop) => {
  // startIndex = scrollTop / itemHeight;
  virtualData.startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
};
