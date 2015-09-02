var assert        = require('assert');
var sinon         = require('sinon');
var getDBName     = require('../helpers/get-db-name');
var cleanDB       = require('../helpers/clean-db');
var createDB      = require('../../lib/create-db');
var addToDB       = require('../../lib/put-db');
var getCollection = require('../../lib/get-collection-db');

//bind a context so we can pass this to catches
var console   = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

describe('getCollection()', function (done){

  describe('The arguments', function (){

    it('Should reject if no DB is passed', function (done){

      var spy = sinon.spy();

      getCollection()
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollection promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if an invalid DB is passed', function (done){

      var spy = sinon.spy();

      getCollection(true)
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollection promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no storeName is passed', function (done){

      var dataBase;
      var spy = sinon.spy();
      var dbName = getDBName();

      createDB({ name: dbName, version: 1 })
      .then( function (db){
        assert(db, 'Got a database back');
        dataBase = db;
        return getCollection(db);
      })
      .catch(spy)
      .then(function(){
        assert(spy.callCount, 'getCollection promise was rejected');
        cleanDB(dataBase);
        done();
      })
      .catch(console.error);
    });

  });

  describe('Getting a collection', function (){

    it('Should retrieve all members of a given collection', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
        .then( function (db){
          assert(db,'Returned db okay');
          return [db, addToDB(db, 'obj1', [
            { prop: 'it1' },
            { prop: 'it2' },
            { prop: 'it3' },
            { prop: 'it4' }
          ])];
        })
        .spread(function (db){
          return [db, getCollection(db, 'obj1')];
        })
        .spread( function (db, collection){
          assert(collection, 'got collection back okay');
          assert.equal(collection.length, 4, 'got all of the collection');
          assert.equal(collection[0].prop , 'it1', 'got first collection item okay');
          assert.equal(collection[1].prop , 'it2', 'got second collection item okay');
          assert.equal(collection[2].prop , 'it3', 'got third collection item okay');
          assert.equal(collection[3].prop , 'it4', 'got fourth collection item okay');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Getting a collection on an index', function (){
    it('Should get collections by index', function (done){

      var dbName = getDBName();

      createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
        .then( function (db){
          assert(db,'Returned db okay');
          return [db, addToDB(db, 'obj1', [
            { prop: 'it1' },
            { prop: 'it1' },
            { prop2: 'it2' },
            { prop2: 'it2' }
          ])];
        })
        .spread(function (db){
          return [db, getCollection(db, 'obj1', 'prop')];
        })
        .spread( function (db, collection){
          assert(collection, 'got collection back okay');
          assert.equal(collection.length, 2, 'got all of the collection');
          assert.equal(collection[0].prop , 'it1', 'got first collection item okay');
          assert.equal(collection[1].prop , 'it1', 'got first collection item okay');
          done();
        })
        .catch(console.error);
    });
  });

});
