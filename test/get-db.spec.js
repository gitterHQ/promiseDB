var test      = require('tape');
var sinon     = require('sinon');
var getDBName = require('./helpers/get-db-name');
var cleanDB   = require('./helpers/clean-db');
var createDB  = require('../lib/create-db');
var addToDB   = require('../lib/put-db');
var getFromDB = require('../lib/get-db');

//bind a context so we can pass this to catches
var console = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

test('Will reject if no DB is passed', function (t){

  var spy = sinon.spy();

  getFromDB()
    .catch(spy)
    .then(function(){
      t.assert(spy.callCount, 'getFromDB promise was rejected');
      t.end();
    })
    .catch(console.error);
});


test('Will reject if an invalid db is passed', function (t){

  var spy = sinon.spy();

  getFromDB({db: true})
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
      return getFromDB(db);
    })
    .catch(spy)
    .then(function(){
      t.assert(spy.callCount, 'getFromDB promise was rejected');
      cleanDB(dataBase);
      t.end();
    })
    .catch(console.error);
});

test('Will reject if no key is passed', function (t){

  var dataBase;
  var spy    = sinon.spy();
  var dbName = getDBName();

  createDB({ name: dbName, version: 1 })
    .then(function(db){
      t.ok(db, 'db created successfully');
      dataBase = db;
      return getFromDB(db, 'obj1');
    })
    .catch(spy)
    .then(function(){
      t.assert(spy.callCount, 'getFromDB promise was rejected');
      cleanDB(dataBase);
      t.end();
    })
    .catch(console.error);
});

test('Should retrieve an object by its primary key', function (t){

  var dbName = getDBName();

  createDB({ name: dbName, version: 1, objects: [{ name: 'obj1' }] })
    .then(function(db){
      return [db, addToDB(db, 'obj1', { prop: 'test'} )];
    })
    .spread(function (db, index){
      return [db, getFromDB(db, 'obj1', index)];
    })
    .spread(function(db, obj){
      t.ok(obj, 'an object has been returned from getFromDB');
      t.equal(obj.prop, 'test', 'the correct object has been returned from getFromDB');
      cleanDB(db);
      t.end();
    })
    .catch(console.error);
});

test('Should throw an error if there is no object', function (t){

  var database;
  var dbName = getDBName();
  var spy    = sinon.spy();

  createDB({ name: dbName, version: 1, objects: [{ name: 'obj1' }] })
    .then(function (db){
      dataBase = db;
      return getFromDB(db, 'obj1', 1);
    })
    .catch(spy)
    .then(function(db, obj){
      t.assert(spy.callCount, 'getFromDB threw an error when no object could be retrieved');
      cleanDB(dataBase);
      t.end();
    })
    .catch(console.error);
});

test('Should retrieve an object by index', function (t){

  var dbName = getDBName();

  createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
    .then(function (db){
      return [db, addToDB(db, 'obj1', { prop: 'test' })];
    })
    .spread(function(db){
      return [db, getFromDB(db, 'obj1', 'test', 'prop')];
    })
    .spread(function(db, obj){
      t.ok(obj, 'an object has been returned');
      t.equal(obj.prop, 'test', 'the correct object has been returned');
      cleanDB(db);
      t.end();
    })
    .catch(console.error);
});
