var test      = require('tape');
var sinon     = require('sinon');
var getDBName = require('./helpers/get-db-name');
var cleanDB   = require('./helpers/clean-db');
var createDB  = require('../lib/create-db');
var addToDB   = require('../lib/put-db');

console.error = console.error.bind(console);


test('addToDB', function (t){

  test('Will reject if no DB is passed', function (t){
    var spy = sinon.spy();
    addToDB()
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'addToDB promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if an invalid db is passed', function (t){
    var spy = sinon.spy();
    addToDB({db: true})
      .catch(spy)
      .then(function (){
        t.assert(spy.callCount, 'addToDB promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if no object store is passed', function (t){
    var dataBase;
    var spy    = sinon.spy();
    var dbName = getDBName();
    createDB({ name: dbName, version: 1 })
      .then(function(db){
        t.ok(db, 'db created successfully');
        dataBase = db;
        return addToDB(db);
      })
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'addToDB promise was rejected');
        cleanDB(dataBase);
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if an invalid object store name is passed', function (t){
    var dataBase;
    var dbName = getDBName();
    var spy    = sinon.spy();
    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1' }] })
      .then(function(db){
        dataBase = db;
        return addToDB(db, 'obj2');
      })
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'addToDB promise was rejected');
        cleanDB(dataBase);
        t.end();
      })
      .catch(console.error);
  });

  test('Will reject if no object is passed', function (t){
    var dataBase;
    var dbName = getDBName();
    var spy    = sinon.spy();
    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1' }] })
      .then(function(db){
        dataBase = db;
        return addToDB(db, 'obj1');
      })
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'addToDB promise was rejected');
        cleanDB(dataBase);
        t.end();
      })
      .catch(console.error);
  });

  test('Should add an object to the database', function (t){
    var dataBase;
    var dbName = getDBName();
    createDB({
      name: dbName, version: 1, objects: [{
        name: 'obj1'
      }]
    })
    .then(function(db){
      dataBase = db;
      return [db, addToDB(db, 'obj1', { prop: 'test' })];
    })
    .spread(function(db, index){
      db.transaction(['obj1'])
        .objectStore('obj1')
        .get(index)
        .onsuccess = function(e){
          t.equal(e.target.result.prop, 'test');
          cleanDB(dataBase);
          t.end();
        };
    })
    .catch(console.error);
  });

  t.end();
});
