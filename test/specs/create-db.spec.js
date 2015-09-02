var assert    = require('assert');
var sinon     = require('sinon');
var createDB  = require('../../lib/create-db');
var getDBName = require('../helpers/get-db-name');
var cleanDB   = require('../helpers/clean-db');

//bind a context so we can pass this to catches
var console = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

describe('createDB', function (){

  describe('The arguments', function (){

    it('Should reject if no configuration object is passed', function (done){

      var spy = sinon.spy();

      createDB()
        .catch(spy)
        .then(function(){
          assert(spy.calledOnce, 'createDB promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no name is passed', function (done){

      var spy = sinon.spy();

      createDB({})
        .catch(spy)
        .then(function(){
          assert(spy.calledOnce, 'createDB promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no version is passed', function (done){

      var spy = sinon.spy();

      createDB({ name: getDBName() })
        .catch(spy)
        .then(function(){
          assert(spy.calledOnce, 'createDB promise was rejected');
          done();
        })
        .catch(console.error);
    });

  });

  describe('Database resolution', function (){

    it('Should resolve with a valid indexDB instance', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1})
        .then( function (db){
          assert(db, 'DB is truthy');
          assert(db instanceof IDBDatabase, 'returned DB is an instanceof IDBDatabase');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

    it('Should resolve with the same db if called twice', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1})
        .then(function(db){
          return [db, createDB({ name: dbName, version: 1})];
        })
        .spread(function(db1, db2){
          assert(db1, 'first DB returned okay');
          assert(db2, 'second DB returned okay');
          assert.equal(db1.name, db2.name, 'both returned DBs are the same');
          cleanDB(db1, db2);
          done();
        })
        .catch(console.error);
    });

    it('Should resolve with different db\'s if called twice with different params', function (done){

      var dbName  = getDBName();
      var dbName2 = getDBName();

      createDB({ name: dbName, version: 1})
        .then(function(db){
          return [db, createDB({ name: dbName2, version: 1})];
        })
        .spread(function(db1, db2){
          assert(db1, 'first DB returned okay');
          assert(db2, 'second DB returned okay');
          assert.notEqual(db1.name, db2.name, 'both DBs returned are different');
          cleanDB(db1, db2);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Creating object stores', function (){

    it('Should create object stores when passed within the configuration', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1, objects: [{ name: 'test'}] })
        .then(function(db){
          assert(db, 'DB returned okay');
          var resultObj = db.objectStoreNames.contains('test');
          var resultLength = db.objectStoreNames.length;
          assert.equal(resultLength, 1, 'only one object store created');
          assert(resultObj, 'returned DB has the correct object stores');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

    it('Should not throw errors when creating the same object stores on different versions', function (done){

      var dbName = getDBName();
      var spy    = sinon.spy();

      createDB({ name: dbName, version: 1, objects: [ { name: 'test' } ]})
        .then(function(db){
          db.close();
          return [db, createDB({ name: dbName, version: 2, objects: [ { name: 'test' } ]})];
        })
        .catch(spy)
        .spread(function(db1, db2){
          assert(db1, 'got old db back okay');
          assert(db2, 'got new db back okay');
          assert.equal(spy.callCount, 0, 'error was not thrown');
          cleanDB(db1, db2);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Creating indexes', function (){

    it('Should create indexes on the DB if specified', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1, objects: [{ name: 'obj', indexes: [ {name: 'id', unique: true} ] }] })
        .then(function(db){
          assert(db, 'got the db okay');
          var objStore = db.transaction(['obj'], 'readwrite').objectStore('obj');
          var hasIndex = objStore.indexNames.contains('id');
          assert(hasIndex, 'created index successfully');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });
  });

});
