export function getData(index, count) {
  return Array(count)
    .fill(undefined)
    .reduce((p) => {
      p.push(index++);
      return p;
    }, []);
}
