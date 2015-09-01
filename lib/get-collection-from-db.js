var Q = require('q');

module.exports = function getCollectionFrom(db, storeName, limit, indexName, direction, boundType){

  //default the direction if we don't have it
  direction = (direction || 'next');

  return Q.Promise(function(resolve, reject){

    if(!(db instanceof IDBDatabase))
      return reject(new Error('Only a valid database instance can be passed to getCollectionFrom'));

    if(!storeName)
      return reject(new Error('A valid storeName must be passed to getCollectionFrom'));

    if(!limit)
      return reject(new Error('A valid limit must be passed to getCollectionFrom'));

    var results     = [];
    var objectStore = db.transaction([storeName], 'readwrite').objectStore(storeName);

    //figure out where to start within the collection
    var bound;
    if(!boundType){
      bound       = (direction === 'prev') ?
        IDBKeyRange.upperBound(limit) :
        IDBKeyRange.lowerBound(limit) ;
    }
    else {
      bound = IDBKeyRange[boundType](limit);
    }

    //If we have an index name then we get via the index
    var transaction = !!indexName ?
      objectStore.index(indexName).openCursor(bound, direction) :
      objectStore.openCursor(bound, direction);

    transaction.onsuccess = function (e){
      var cursor = e.target.result;
      //exit if we have all the data
      if(!cursor) return resolve(results);

      results.push(cursor.value);
      cursor.continue();
    };

    transaction.onerror = function (e){
      reject(e.target.error);
    };


  });
};
