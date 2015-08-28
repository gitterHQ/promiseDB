module.exports = function cleanDB(){
  var dbs = Array.prototype.slice.apply(arguments);
  dbs.forEach(function (db){
    db.close();
    indexedDB.deleteDatabase(db.name);
  });
};
