var test              = require('tape');
var sinon             = require('sinon');
var getDBName         = require('../helpers/get-db-name');
var cleanDB           = require('../helpers/clean-db');
var createDB          = require('../../lib/create-db');
var addToDB           = require('../../lib/put-db');
var getCollectionFrom = require('../../lib/get-collection-from-db');

//bind a context so we can pass this to catches
var console   = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

test('getCollectionFrom()', function (t){

  test('Should reject if no DB is passed', function (t){

    var spy = sinon.spy();

    getCollectionFrom()
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollectionFrom promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Should reject if an invalid DB is passed', function (t){

    var spy = sinon.spy();

    getCollectionFrom(true)
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollectionFrom promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Should reject if no storeName is passed', function (t){

    var spy = sinon.spy();
    var dbName = getDBName();

    createDB({ name: dbName, versionn: 1})
      .then( function (db){
         return getCollectionFrom(db);
      })
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollectionFrom promise was rejected');
        t.end();
      })
      .catch(console.error);

  });

  test('Should reject if no limit is passed', function (t){

    var spy = sinon.spy();
    var dbName = getDBName();

    createDB({ name: dbName, version: 1})
      .then( function (db){
         return getCollectionFrom(db, 'obj1');
      })
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollectionFrom promise was rejected');
        t.end();
      })
      .catch(console.error);

  });

  test('Should retrieve all members of a given collection after the limit', function (t){

    var dbName = getDBName();

    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
      .then( function (db){
        t.ok(db,'Returned db okay');
        return [db, addToDB(db, 'obj1', [
          { prop: 'test1' },
          { prop: 'test2' },
          { prop: 'test3' },
          { prop: 'test4' }
        ])];
      })
      .spread(function (db){
        console.log('added');
        return [db, getCollectionFrom(db, 'obj1', 3)];
      })
      .spread( function (db, collection){
        t.ok(collection, 'got collection back okay');
        t.equal(collection.length, 2, 'got all of the collection');
        t.equal(collection[0].prop , 'test3', 'got first collection item okay');
        t.equal(collection[1].prop , 'test4', 'got second collection item okay');
        cleanDB(db);
        t.end();
      })
      .catch(console.error);
  });

  test('Should retrieve all members of a given collection before the limit if a reverse direction is passed', function (t){

    var dbName = getDBName();

    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
      .then( function (db){
        t.ok(db,'Returned db okay');
        return [db, addToDB(db, 'obj1', [
          { prop: 'test1' },
          { prop: 'test2' },
          { prop: 'test3' },
          { prop: 'test4' }
        ])];
      })
      .spread(function (db){
        console.log('added');
        return [db, getCollectionFrom(db, 'obj1', 2, null, 'prev')];
      })
      .spread( function (db, collection){
        t.ok(collection, 'got collection back okay');
        t.equal(collection.length, 2, 'got all of the collection');
        t.equal(collection[0].prop , 'test2', 'got first collection item okay');
        t.equal(collection[1].prop , 'test1', 'got second collection item okay');
        cleanDB(db);
        t.end();
      })
      .catch(console.error);
  });


  test('Should retrieve all members of a given collection before the limit if a bound type is passed', function (t){

    var dbName = getDBName();

    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
      .then( function (db){
        t.ok(db,'Returned db okay');
        return [db, addToDB(db, 'obj1', [
          { prop: 'test1' },
          { prop: 'test2' },
          { prop: 'test3' },
          { prop: 'test4' }
        ])];
      })
      .spread(function (db){
        console.log('added');
        return [db, getCollectionFrom(db, 'obj1', 3, null, 'prev', 'lowerBound')];
      })
      .spread( function (db, collection){
        t.ok(collection, 'got collection back okay');
        t.equal(collection.length, 2, 'got all of the collection');
        t.equal(collection[0].prop , 'test4', 'got first collection item okay');
        t.equal(collection[1].prop , 'test3', 'got second collection item okay');
        cleanDB(db);
        t.end();
      })
      .catch(console.error);
  });

  t.end();
});
