Proxy DB
------------------

A promise based wrapper utility for indexedDB.

Usage:
-------------------

1, Create a database instance

```js
createDB({ name: 'database-name', version: 1 })
  .then(function(db){ /* Here lies a fully valid indexed-db instace */ });
```
