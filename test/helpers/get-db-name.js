var uuid = require('node-uuid');
module.exports = function getDBName(){
  return uuid.v1();
};
