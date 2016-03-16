var _ = require('lodash')
var knox = require('knox')

module.exports = function deployHtml (opts, cb) {
  var client = knox.createClient(opts.s3)
  var headers = {'Content-Type': 'text/html', 'x-amz-acl': 'public-read'}
  client.putBuffer(new Buffer(opts.html, 'utf8'), opts.path, headers, function (err, res) {
    if (err) return cb(err)
    if (res.statusCode < 300) return cb()

    cb = _.once(cb)
    var chunks = []
    res.on('error', cb)
    res.on('data', function (c) { chunks.push(c) })
    res.on('end', function (c) {
      var body = Buffer.concat(chunks).toString()
      var error = new Error(`Failed to upload to s3. Got error code ${res.statusCode}.\nBody: ${body}`)
      cb(error)
    })
  })
}
