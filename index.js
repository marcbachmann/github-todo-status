var _ = require('lodash')
var glob = require('glob')
var analyze = require('./todos')
var generate = require('./html')
var deploy = require('./s3')
var GitHubApi = require('github')

module.exports = check

var defaults = {
  cwd: process.cwd(),
  files: '**/**@(\.js|\.coffee)',
  ignore: ['node_modules/**/*', '**/*.min.js'],
  s3: {
    key: undefined,
    secret: undefined,
    bucket: undefined,
    path: '/commits/{{sha}}/{{random}}'
  },
  github: {
    token: undefined,
    user: undefined,
    repo: undefined,
    sha: undefined,
    success_description: 'Good job. There are no todos',
    error_description: 'There are {{amount}} todos',
    context: 'todos',
    target_url: undefined
  }
}

function check (originalConfig, cb) {
  var config = _.defaultsDeep({}, originalConfig, defaults)
  assertParams(config, 'config.', ['files', 's3', 'github'])
  assertParams(config.s3, 'config.s3.', ['key', 'secret', 'bucket', 'path'])
  assertParams(config.github, 'config.github.', ['token', 'user', 'repo', 'sha'])

  var files = glob.sync(config.files, {ignore: config.ignore, cwd: config.cwd})
  var random = Date.now()
  var sha = config.github.sha
  var template = function (s) { return s.replace(/{{sha}}/g, sha).replace(/{{random}}/g, random) }

  // Url used in html & status notification, defaults to s3 url
  var defaultUrl = `https://${config.s3.bucket}.s3.amazonaws.com${config.s3.path}`
  var targetUrl = template(config.github.target_url || defaultUrl)

  analyze(files, function (err, todos) {
    if (err) return console.error('Error analyzing the files:', err)

    generate({
      todos: todos,
      sha: sha,
      user: config.github.user,
      repo: config.github.repo
    }, function (err, html) {
      if (err) return console.error('Error rendering the todos:', err)

      deploy({
        path: template(config.s3.path),
        html: html,
        s3: config.s3
      }, function (err) {
        if (err) return console.error('Error pushing the html to s3:', err)

        status({
          sha: sha,
          state: !!todos.length? 'error': 'success',
          github: config.github,
          targetUrl: targetUrl,
          description: getStatusDescription(config, todos)
        }, cb)
      })
    })
  })
}

function status (opts, cb) {
  var github = new GitHubApi({version: '3.0.0', protocol: 'https'})
  github.authenticate({type: 'token', token: opts.github.token})
  github.statuses.create({
    user: opts.github.user,
    repo: opts.github.repo,
    sha: opts.sha,
    state: opts.state,
    description: opts.description,
    context: opts.github.context,
    target_url: opts.targetUrl
  }, cb)
}

function assertParams (obj, prefix, params) {
  _.each(params, function (param) {
    if (!obj[param]) throw new Error(`The option '${prefix}${param}' is required.`)
  })
}

function getStatusDescription (config, todos) {
  if (todos.length === 0) return config.github.success_description
  return config.github.error_description.replace('{{amount}}', todos.length)
}
