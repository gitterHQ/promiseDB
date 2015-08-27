module.exports = function (){
  var ta = webkitIndexedDB.webkitGetDatabaseNames();
  ta.onsuccess = function (e){
    console.log(e.target.result);
    Array.prototype.slice.apply(e.target.result).forEach(function(name){
      console.log(name);
      indexedDB.deleteDatabase(name);
    });
  };
  ta.onerror = function (e){
    console.log('err', e);
  };
};
