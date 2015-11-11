var assert            = require('assert');
var sinon             = require('sinon');
var getDBName         = require('../helpers/get-db-name');
var cleanDB           = require('../helpers/clean-db');
var createDB          = require('../../lib/create-db');
var addToDB           = require('../../lib/put-db');
var getCollectionFrom = require('../../lib/get-collection-from-db');

//bind a context so we can pass this to catches
var console   = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

describe('getCollectionFrom()', function (done){

  describe('The arguments', function (){

    it('Should reject if no DB is passed', function (done){

      var spy = sinon.spy();

      getCollectionFrom()
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollectionFrom promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if an invalid DB is passed', function (done){

      var spy = sinon.spy();

      getCollectionFrom(true)
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollectionFrom promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no storeName is passed', function (done){

      var spy = sinon.spy();
      var dbName = getDBName();

      createDB({ name: dbName, versionn: 1})
        .then( function (db){
           return getCollectionFrom(db);
        })
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollectionFrom promise was rejected');
          done();
        })
        .catch(console.error);

    });

    it('Should reject if no limit is passed', function (done){

      var spy = sinon.spy();
      var dbName = getDBName();

      createDB({ name: dbName, version: 1})
        .then( function (db){
           return getCollectionFrom(db, 'obj1');
        })
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'getCollectionFrom promise was rejected');
          done();
        })
        .catch(console.error);

    });

  });


  describe('Get after', function (){

    it('Should retrieve all members of a given collection after the limit', function (done){

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
          return [db, getCollectionFrom(db, 'obj1', 3)];
        })
        .spread( function (db, collection){
          assert(collection, 'got collection back okay');
          assert.equal(collection.length, 2, 'got all of the collection');
          assert.equal(collection[0].prop , 'it3', 'got first collection item okay');
          assert.equal(collection[1].prop , 'it4', 'got second collection item okay');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Get before', function (){

    it('Should retrieve all members of a given collection before the limit if a reverse direction is passed', function (done){

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
          return [db, getCollectionFrom(db, 'obj1', 2, null, 'prev')];
        })
        .spread( function (db, collection){
          assert(collection, 'got collection back okay');
          assert.equal(collection.length, 2, 'got all of the collection');
          assert.equal(collection[0].prop , 'it2', 'got first collection item okay');
          assert.equal(collection[1].prop , 'it1', 'got second collection item okay');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Using bounds', function (){

    it('Should retrieve all members of a given collection before the limit if a bound type is passed', function (done){

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
          return [db, getCollectionFrom(db, 'obj1', 3, null, 'prev', 'lowerBound')];
        })
        .spread( function (db, collection){
          assert(collection, 'got collection back okay');
          assert.equal(collection.length, 2, 'got all of the collection');
          assert.equal(collection[0].prop , 'it4', 'got first collection item okay');
          assert.equal(collection[1].prop , 'it3', 'got second collection item okay');
          cleanDB(db);
          done();
        })
        .catch(console.error);
    });

  });

});
