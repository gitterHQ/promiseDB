module.exports = {
  createDB:          require('./lib/create-db'),
  deleteDB:          require('./lib/delete-db.js'),
  get:               require('./lib/get-db'),
  put:               require('./lib/put-db'),
  getCollection:     require('./lib/get-collection-db.js'),
  getCollectionFrom: require('./lib/get-collection-from-db')
};
