import { TIME_PER_FPS } from "./config";

export function getData(init, count) {
  const arr = [];

  for (let i = init; i <= count; i++) {
    arr.push(i);
  }

  return arr;
}

export function setAnimationFrame(callback) {
  let beginTime = Date.now();

  requestAnimationFrame(function cb() {
    const endTime = Date.now();
    callback();

    // 执行的动画间隔 > 33.3333ms
    if (endTime - beginTime >= TIME_PER_FPS) {
      beginTime = endTime;
      // 重新执行一次动画
      requestAnimationFrame(cb);
    }
  });
}
