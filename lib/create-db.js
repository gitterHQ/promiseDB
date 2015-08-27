var Q = require('q');

var dbs = {};
module.exports = function(data){
  return Q.Promise(function(resolve, reject){

    //Check configuration
    if(!data)         reject(new Error('A configuration object must be passed to createDB'));
    if(!data.name)    reject(new Error('A name parameter must be passed to createDB'));
    if(!data.version) reject(new Error('A version parameter must be passed to createDB'));

    //defaults
    data.objects = (data.objects || []);

    //return from cache if we already have a DB
    var cacheKey = data.name + data.version;
    if(dbs[cacheKey]) { resolve(dbs[cacheKey]); return;}

    //Open the DB
    var transaction = indexedDB.open(data.name, data.version);

    //deal with any DB ch, ch, ch, chaaaanges!
    transaction.onupgradeneeded = function(e){
      var db = e.target.result;
      //loop through the configuration
      data.objects.forEach(function(obj){
        //If we don't have pre-existing object stores then make them
        if(!db.objectStoreNames.contains(obj.name)){

          //create the store
          var objStore = db.createObjectStore(obj.name, {
            keyPath:       (obj.keyPath || 'id') ,
            autoIncrement: (obj.autoIncrement || true)
          });

          //create all the indexes
          obj.indexes = (obj.indexes || []);
          obj.indexes.forEach( function (index){
            objStore.createIndex(index.name, index.name, { unique: index.unique });
          });

        }
      });
    };

    //If successful cache the result and resolve
    transaction.onsuccess = function(e){
      var db = dbs[cacheKey] = e.target.result;
      //if we update the version we need to close the old connection
      db.onversionchange = function(){ db.close(); };
      resolve(dbs[cacheKey]);
    };

    //reject any errors
    transaction.onerror = function(e){
      reject(e.target.error);
    };

  });
};
