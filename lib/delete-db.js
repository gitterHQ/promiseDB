var Q = require('q');

module.exports = function(db){
  return Q.Promise(function(resolve, reject){
    db.close();
    indexedDB.deleteDatabase(db.name);
    resolve();
  });
};
