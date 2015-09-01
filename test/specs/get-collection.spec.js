var test          = require('tape');
var sinon         = require('sinon');
var getDBName     = require('../helpers/get-db-name');
var cleanDB       = require('../helpers/clean-db');
var createDB      = require('../../lib/create-db');
var addToDB       = require('../../lib/put-db');
var getCollection = require('../../lib/get-collection-db');

//bind a context so we can pass this to catches
var console   = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

test('getCollection()', function (t){

  test('Should reject if no DB is passed', function (t){

    var spy = sinon.spy();

    getCollection()
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollection promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Should reject if an invalid DB is passed', function (t){

    var spy = sinon.spy();

    getCollection(true)
      .catch(spy)
      .then(function(){
        t.assert(spy.callCount, 'getCollection promise was rejected');
        t.end();
      })
      .catch(console.error);
  });

  test('Should reject if no storeName is passed', function (t){

    var dataBase;
    var spy = sinon.spy();
    var dbName = getDBName();

    createDB({ name: dbName, version: 1 })
    .then( function (db){
      t.ok(db, 'Got a database back');
      dataBase = db;
      return getCollection(db);
    })
    .catch(spy)
    .then(function(){
      t.assert(spy.callCount, 'getCollection promise was rejected');
      cleanDB(dataBase);
      t.end();
    })
    .catch(console.error);
  });

  test('Should retrieve all members of a given collection', function (t){

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
        return [db, getCollection(db, 'obj1')];
      })
      .spread( function (db, collection){
        t.ok(collection, 'got collection back okay');
        t.equal(collection.length, 4, 'got all of the collection');
        t.equal(collection[0].prop , 'test1', 'got first collection item okay');
        t.equal(collection[1].prop , 'test2', 'got second collection item okay');
        t.equal(collection[2].prop , 'test3', 'got third collection item okay');
        t.equal(collection[3].prop , 'test4', 'got fourth collection item okay');
        cleanDB(db);
        t.end();
      })
      .catch(console.error);
  });


  test('Should get collections by index', function (t){

    var dbName = getDBName();

    createDB({ name: dbName, version: 1, objects: [{ name: 'obj1', indexes: [{ name: 'prop' }] }] })
      .then( function (db){
        t.ok(db,'Returned db okay');
        return [db, addToDB(db, 'obj1', [
          { prop: 'test1' },
          { prop: 'test1' },
          { prop2: 'test2' },
          { prop2: 'test2' }
        ])];
      })
      .spread(function (db){
        return [db, getCollection(db, 'obj1', 'prop')];
      })
      .spread( function (db, collection){
        t.ok(collection, 'got collection back okay');
        t.equal(collection.length, 2, 'got all of the collection');
        t.equal(collection[0].prop , 'test1', 'got first collection item okay');
        t.equal(collection[1].prop , 'test1', 'got first collection item okay');
        t.end();
      })
      .catch(console.error);
  });

  t.end();
});
