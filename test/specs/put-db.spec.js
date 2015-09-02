var assert    = require('assert');
var sinon     = require('sinon');
var getDBName = require('../helpers/get-db-name');
var cleanDB   = require('../helpers/clean-db');
var createDB  = require('../../lib/create-db');
var addToDB   = require('../../lib/put-db');

//bind a context so we can pass this to catches
var console = (window.console || {});
console.error = !!console.error ? console.error.bind(console) : function(){};

describe('addToDB', function (){

  describe('The arguments', function (){

    it('Should reject if no DB is passed', function (done){

      var spy = sinon.spy();

      addToDB()
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'addToDB promise was rejected');
          done();
        })
        .catch(console.error);
    });

    it('Should reject if an invalid db is passed', function (done){

      var spy = sinon.spy();

      addToDB({db: true})
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
          return addToDB(db);
        })
        .catch(spy)
        .then(function(){
          assert(spy.callCount, 'addToDB promise was rejected');
          cleanDB(dataBase);
          done();
        })
        .catch(console.error);
    });

    it('Should reject if an invalid object store name is passed', function (done){

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
          assert(spy.callCount, 'addToDB promise was rejected');
          cleanDB(dataBase);
          done();
        })
        .catch(console.error);
    });

    it('Should reject if no object is passed', function (done){

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
          assert(spy.callCount, 'addToDB promise was rejected');
          cleanDB(dataBase);
          done();
        })
        .catch(console.error);
    });

  });

  describe('Adding objects', function (){

    it('Should add an object to the database', function (done){

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
            assert.equal(e.target.result.prop, 'test');
            cleanDB(dataBase);
            done();
          };
      })
      .catch(console.error);
    });

  });

  describe('Adding collections', function (){
    it('Should add a collection the database', function (done){

      var dataBase;
      var dbName = getDBName();

      createDB({
        name: dbName, version: 1, objects: [{
          name: 'obj1'
        }]
      })
      .then(function(db){
        dataBase = db;
        return [db, addToDB(db, 'obj1', [{ id: 1, prop: 'test' }, { id: 2, prop: 'test2'}])];
      })
      //Getting things out of the db like ths is gross
      .spread(function(db){
        //get the first object out of the database
        db.transaction(['obj1'])
          .objectStore('obj1')
          .get(1)
          .onsuccess = function(e){
            assert.equal(e.target.result.prop, 'test', 'The first object pulled from the DB is as expected');
            //get the second object out of the database
            db.transaction(['obj1'])
              .objectStore('obj1')
              .get(2)
              .onsuccess = function(e){
                assert.equal(e.target.result.prop, 'test2');
                done();
                cleanDB(db);
              };
          };
      })
      .catch(console.error);
    });
  });

});
