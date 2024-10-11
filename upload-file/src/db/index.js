// console.log(window.indexedDB);

// 获取数据库
const IDBFactory = window.indexedDB;

// 打开数据库, 操作是异步的
const IDBRequest = IDBFactory.open("axios-db", 1);

console.log("IDBRequest: =>", IDBRequest);
