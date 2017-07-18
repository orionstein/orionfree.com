const fs = require('fs')
const path = require('path')
const bluebird = require('bluebird')
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))
const cert = fs.readFileSync(path.join(__dirname, '/key.pem'))

module.exports = function(auth) {
  return jwt.verifyAsync(auth, cert)
}
