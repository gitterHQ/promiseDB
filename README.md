Proxy DB
------------------

A promise based wrapper utility for indexedDB.

Usage:
-------------------

1, Create a database instance

```js
var promiseDB = require('promise-db');

promiseDB
  .createDB({ name: 'database-name', version: 1 })
  .then(function(db){ /* Here lies a fully valid indexed-db instace */ });
```


2, Add an object to the database

```js
var promiseDB = require('promise-db');

promiseDB
  //the objects key in dbConfig represents the objects stores you wish to create in indexed-db
  .createDB({ name: 'database-name', version: 1, objects: [ {name: 'store'} ] })
  .then(function(db){
    return promiseDB.put(db, 'store', { testObj: 'some-value-goes-here' });
  });
```
