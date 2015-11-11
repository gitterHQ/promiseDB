var Q = require('q');

/**
 * get an object from your indexed-db store
 *
 * @param  db
 * @param  {String} the store name you wish to retrieve the object from
 * @param  {String} the key by which you wish to get the object by
 * @param  {String} the index name (within the object store) you wish to query
 * @return {Promise}
 */
module.exports = function getFromIndexedDB(db, storeName, key, index){
  return Q.Promise(function(resolve, reject){
    if(!(db instanceof IDBDatabase))
       return reject(new Error('A valid IDBDatabase must be passed to getFromDB'));

    if(!storeName)
      return reject(new Error('A store name must be passed to getFromDB'));

    if(!key)
      return reject(new Error('A valid key must be passed to getFromDB'));

    if(!index)
      return getByPrimaryKey(db, storeName, key).then(resolve).catch(reject);
    else
      return getByIndex(db, storeName, key, index).then(resolve).catch(reject);

  });
};

function getByIndex(db, storeName, key, index){
  return Q.Promise(function(resolve, reject){

    var dbIndex     = db.transaction([storeName], 'readwrite').objectStore(storeName).index(index);
    var transaction = dbIndex.get(key);

    transaction.onsuccess = function(e){
      resolve(e.target.result);
    };

    transaction.onerror = function (e){
      reject(e.target.error);
    };

  });
}

function getByPrimaryKey(db, storeName, key){
  return Q.Promise(function(resolve, reject){

    var objStore    = db.transaction([storeName], 'readwrite').objectStore(storeName);
    var transaction = objStore.get(key);

    transaction.onsuccess = function (e){
      if(e.target.result) return resolve(e.target.result);

      reject(new Error('No object exists in the DB with a primary key of ' + key));
    };

    transaction.onerror = function (e){
      reject(e.target.error);
    };

  });
}
