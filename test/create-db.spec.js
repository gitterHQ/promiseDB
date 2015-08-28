var test      = require('tape');
var sinon     = require('sinon');
var createDB  = require('../lib/create-db');
var getDBName = require('./helpers/get-db-name');

//bind a context so we can pass this to catches
console.error = console.error.bind(console);

test('createDB', function (t){

  test('Will reject if no configuration object is passed', function (t){
    var spy = sinon.spy();
    createDB()
      .catch(spy)
      .then(function(){
        t.assert(spy.calledOnce, 'createDB promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if no name is passed', function (t){
    var spy = sinon.spy();
    createDB({})
      .catch(spy)
      .then(function(){
        t.assert(spy.calledOnce, 'createDB promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if no version is passed', function (t){
    var spy = sinon.spy();
    createDB({ name: getDBName() })
      .catch(spy)
      .then(function(){
        t.assert(spy.calledOnce, 'createDB promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Will resolve with a valid indexDB instance', function (t){
    var dbName = getDBName();
    createDB({ name: dbName, version: 1})
      .then( function (db){
        t.ok(db, 'DB is truthy');
        t.assert(db instanceof IDBDatabase, 'returned DB is an instanceof IDBDatabase');
        indexedDB.deleteDatabase(dbName);
        t.end();
      })
      .catch(console.error);
  });

  test('Will resolve with the same db if called twice', function (t){
    var dbName = getDBName();
    createDB({ name: dbName, version: 1})
      .then(function(db){
        return [db, createDB({ name: dbName, version: 1})];
      })
      .spread(function(db1, db2){
        t.ok(db1, 'first DB returned okay');
        t.ok(db2, 'second DB returned okay');
        t.equal(db1.name, db2.name, 'both returned DBs are the same');
        indexedDB.deleteDatabase(dbName);
        t.end();
      })
      .catch(console.error);
  });

  test('Will resolve with different db\'s if called twice with different params', function (t){
    var dbName  = getDBName();
    var dbName2 = getDBName();
    createDB({ name: dbName, version: 1})
      .then(function(db){
        return [db, createDB({ name: dbName2, version: 1})];
      })
      .spread(function(db1, db2){
        t.ok(db1, 'first DB returned okay');
        t.ok(db2, 'second DB returned okay');
        t.notEqual(db1.name, db2.name, 'both DBs returned are different');
        indexedDB.deleteDatabase(dbName);
        indexedDB.deleteDatabase(dbName2);
        t.end();
      })
      .catch(console.error);
  });

  test('Should create object stores when passed within the configuration', function (t){
    var dbName = getDBName();
    createDB({ name: dbName, version: 1, objects: [{ name: 'test'}] })
      .then(function(db){
        t.ok(db, 'DB returned okay');
        var resultObj = db.objectStoreNames.contains('test');
        var resultLength = db.objectStoreNames.length;
        t.equal(resultLength, 1, 'only one object store created');
        t.ok(resultObj, 'returned DB has the correct object stores');
        indexedDB.deleteDatabase(dbName);
        t.end();
      })
      .catch(console.error);
  });

  test('Should not throw errors when creating the same object stores on different versions', function (t){
    var dbName = getDBName();
    var spy    = sinon.spy();
    createDB({ name: dbName, version: 1, objects: [ { name: 'test' } ]})
      .then(function(db){
        return [db, createDB({ name: dbName, version: 2, objects: [ { name: 'test' } ]})];
      })
      .catch(spy)
      .spread(function(db1, db2){
        t.ok(db1, 'got old db back okay');
        t.ok(db2, 'got new db back okay');
        t.equal(spy.callCount, 0, 'error was not thrown');
        indexedDB.deleteDatabase(dbName);
        t.end();
      })
      .catch(console.error);
  });

  test('Should create indexes on the DB if specified', function (t){
    var dbName = getDBName();
    createDB({ name: dbName, version: 1, objects: [{ name: 'obj', indexes: [ {name: 'id', unique: true} ] }] })
      .then(function(db){
        t.ok(db, 'got the db okay');
        var objStore = db.transaction(['obj'], 'readwrite').objectStore('obj');
        var hasIndex = objStore.indexNames.contains('id');
        t.assert(hasIndex, 'created index successfully');
        indexedDB.deleteDatabase(dbName);
        t.end();
      })
      .catch(console.error);
  });

  t.end();
});
