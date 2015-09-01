var Q = require('q');

module.exports = function putIntoIndexedDB(db, storeName, obj){
  return Q.Promise(function(resolve, reject){

    //checks
    if(!(db instanceof IDBDatabase))
       return reject(new Error('A valid IDBDatabase must be passed to addToDB'));

    if(!storeName)
      return reject(new Error('A store name must be passed to addToDB'));

    if(!db.objectStoreNames.contains(storeName))
      return reject(new Error('An existing store name must be passed to addToDB'));

    if(!obj)
      return reject(new Error('A valid object must be passed to addToDB'));

    //If we have an object PUT it into the database
    if(obj.length === undefined){
      return addObjToDb(db, storeName, obj).then(resolve).catch(reject);
    }

    //we have a collection with at leaast on item
    if(!!obj.length){
      return addCollectionToDb(db, storeName, obj).then(resolve).catch(reject);
    }

  });
};

function addObjToDb(db, storeName, obj) {
  return Q.Promise(function(resolve, reject){
    var objStore = db.transaction([storeName], 'readwrite').objectStore(storeName);
    var request  = objStore.put(obj);

    request.onsuccess = function (e){
      resolve(e.target.result);
    };

    request.onerror = function (e){
      reject(e.target.error);
    };
  });
}

function addCollectionToDb(db, storeName, collection){
  return Q.Promise(function(resolve, reject){
    //if the collection is empty resolve
    if(!collection.length) return resolve();
    //splice off the object so we can recursively call this
    var obj = collection.splice(0, 1)[0];
    return addObjToDb(db, storeName, obj)
      .then(function(){
        //recursively call this
        return addCollectionToDb(db, storeName, collection);
      })
      //resolve when finished reject any errors
      .then(resolve).catch(reject);
  });
}
