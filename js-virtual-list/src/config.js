export const ITEM_HEIGHT = 101; // 元素固定的高度
// 屏幕可容纳的最多元素个数
export const MAX_ITEM_COUNT =
  Math.ceil(
    document.querySelector("#J_scrollWrapper").offsetHeight / ITEM_HEIGHT
  ) + 1;
export const TIME_PER_FPS = 1000 / 30;
