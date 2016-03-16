var knox = require('knox')

module.exports = {
  deploy: deployHtml,
  getBase: getBase,
  pushBase: pushBase
}

function deployHtml (opts, cb) {
  var client = knox.createClient(opts.s3)
  var headers = {'Content-Type': 'text/html', 'x-amz-acl': 'public-read'}
  var content = new Buffer(opts.html, 'utf8')
  client.putBuffer(content, opts.path, headers, handleResponse('Failed to upload to s3.', cb))
}

function getBase (opts, cb) {
  getFile(opts.s3, opts.path, cb)
}

function pushBase (opts, cb) {
  var client = knox.createClient(opts.s3)
  var headers = {'Content-Type': 'application/json', 'x-amz-acl': 'public-read'}
  var content = new Buffer(opts.content, 'utf8')
  client.putBuffer(content, opts.path, headers, handleResponse('Failed to upload to s3.', cb))
}

function getFile (conf, filename, cb) {
  var client = knox.createClient(conf)
  client.getFile(filename, handleResponse('Failed to get file from s3.', cb))
}

function handleResponse (errorMessage, callback) {
  return function (err, res) {
    if (err) return callback(err)
    if (res.statusCode === 404) {
      err = new Error('s3: Remote file not found')
      err.status = 404
      return callback(err)
    }
    var chunks = []
    res.on('error', callback)
    res.on('data', function (chunk) { return chunks.push(chunk) })
    res.on('end', function () {
      var body = Buffer.concat(chunks).toString()
      if (res.statusCode < 300) return callback(null, body)

      var error = new Error(`${errorMessage} Got error code ${res.statusCode}.\nBody: ${body}`)
      error.status = res.statusCode
      return callback(error)
    })
  }
}
