module.exports = function (){
  var ta = webkitIndexedDB.webkitGetDatabaseNames();
  ta.onsuccess = function (e){
    Array.prototype.slice.apply(e.target.result).forEach(function(name){
      indexedDB.deleteDatabase(name);
    });
  };
  ta.onerror = function (e){
    console.log('err', e);
  };
};
