let TITLE_COUNT = 0;

const getData = (init, count) => {
  // 因为元素的高度是不固定的，所以我随机模拟元素的高度，固定高度在101-201之前
  /**
   * 数据格式为: {
   *  height: [101, 201],
   *  title: 'xxx'
   *
   * }
   */
  return Array(count)
    .fill(undefined)
    .reduce((r, c, i, a) => {
      // 创建随机高度,区间范围[101, 201] (0, 1) => (Max - Min + 1) + Min
      const rdHt = Math.floor(Math.random() * (201 - 101 + 1) + 101);
      r.push({
        height: rdHt,
        title: TITLE_COUNT++,
      });
      return r;
    }, []);
};

export { getData };
