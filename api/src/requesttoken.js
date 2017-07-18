var fs = require('fs')
var path = require('path')
var bluebird = require('bluebird')
var jwt = require('jsonwebtoken')
var cert = fs.readFileSync(path.join(__dirname, '../shared/key.pem'))

const token = jwt.sign(
  {
    id: Date.now() + Math.random(),
  },
  cert,
  {
    algorithm: 'HS512',
  }
)

process.stdout.write(token)
