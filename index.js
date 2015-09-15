module.exports = {
  createDB:          require('./lib/create-db'),
  get:               require('./lib/get-db'),
  put:               require('./lib/put-db'),
  getCollection:     require('./lib/get-collection-db.js'),
  getCollectionFrom: require('./lib/get-collection-from-db')
};
