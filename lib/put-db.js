var Q = require('q');
module.exports = function addToDB(db, storeName, obj){
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

    var objStore = db.transaction([storeName], 'readwrite').objectStore(storeName);
    var request  = objStore.put(obj);

    request.onsuccess = function (e){
      resolve(e.target.result);
    };

    request.onerror = function (e){
      reject(e.target.error);
    };

  });
};
