var assert    = require('assert');
var sinon     = require('sinon');
var getDBName = require('../helpers/get-db-name');
var cleanDB   = require('../helpers/clean-db');
var createDB  = require('../../lib/create-db');
var addToDB   = require('../../lib/put-db');
var getFromDB = require('../../lib/get-db');

//bind a context so we can pass this to catches
var console = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

describe('getFromDB()', function (){

  describe('The arguments', function (){

    it('Should reject if no DB is passed', function (done){

      var spy = sinon.spy();

      getFromDB()
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getFromDB promise was rejected');
          done();
        })
        .catch(console.error);
    });


    it('Should reject if an invalid db is passed', function (done){

      var spy = sinon.spy();

      getFromDB({db: true})
        .catch(spy)
        .then(function (){
          assert(spy.callCount, 'addToDB promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no object store is passed', function (done){

      var dataBase;
      var spy    = sinon.spy();
      var dbName = getDBName();

      createDB({ name: dbName, version: 1 })
        .then(function(db){
          assert(db, 'db created successfully');
          dataBase = db;
          return getFromDB(db);
        })
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getFromDB promise was rejected');
          cleanDB(dataBase);
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no key is passed', function (done){

      var dataBase;
      var spy    = sinon.spy();
      var dbName = getDBName();

      createDB({ name: dbName, version: 1 })
        .then(function(db){
          assert(db, 'db created successfully');
          dataBase = db;
          return getFromDB(db, 'obj1');
        })
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getFromDB promise was rejected');
          cleanDB(dataBase);
          done();
        })
        .catch(console.error);
    });

    it('Should throw an error if there is no object', function (done){

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
            assert(spy.callCount, 'getFromDB threw an error when no object could be retrieved');
            cleanDB(dataBase);
            done();
          })
          .catch(console.error);
      });

  });

  describe('Get by primary key', function (){
    it('Should retrieve an object by its primary key', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1, objects: [{ name: 'obj1' }] })
        .then(function(db){
          return [db, addToDB(db, 'obj1', { prop: 'it'} )];
        })
        .spread(function (db, index){
          return [db, getFromDB(db, 'obj1', index)];
        })
        .spread(function(db, obj){
          assert(obj, 'an object has been returned from getFromDB');
          assert.equal(obj.prop, 'it', 'the correct object has been returned from getFromDB');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });
  });

  describe('Get by index', function (){

    it('Should retrieve an object by index', function (done){

        var dbName = getDBName();

        createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
          .then(function (db){
            return [db, addToDB(db, 'obj1', { prop: 'it' })];
          })
          .spread(function(db){
            return [db, getFromDB(db, 'obj1', 'it', 'prop')];
          })
          .spread(function(db, obj){
            assert(obj, 'an object has been returned');
            assert.equal(obj.prop, 'it', 'the correct object has been returned');
            cleanDB(db);
            done();
          })
          .catch(console.error);
      });

  });

});
