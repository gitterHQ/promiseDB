var Q = require('q');

module.exports = function getCollection(db, storeName, indexName, indexValue){
  return Q.Promise(function(resolve, reject){

    if(!(db instanceof IDBDatabase))
      return reject(new Error('A valid DB must be passed to getCollection'));

    if(!storeName)
      return reject(new Error('A valid storeName must be passed to getCollection'));

    var results = [];
    var objectStore = db.transaction([storeName], 'readwrite').objectStore(storeName);

    //If we have an index name then we get via the index
    var transaction = !!indexName ?
      objectStore.index(indexName).openCursor() :
      objectStore.openCursor();

    transaction.onsuccess = function (e){
      var cursor = e.target.result;
      //exit if we have all the data
      if(!cursor) return resolve(results);


      if(indexValue) {
        if(cursor.value[indexName] === indexValue){
          results.push(cursor.value);
        }
      }
      else {
        results.push(cursor.value);
      }

      cursor.continue();
    };

    transaction.onerror = function (e){
      reject(e.target.error);
    };

  });
};
