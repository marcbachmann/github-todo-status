#!/usr/bin/env node
var conf = require('rc')('github_todo_status')
var todos = require('./')

if (~conf._.indexOf('push-base')) {
  todos.pushBase(conf, function (err, res) {
    if (err) throw err
    console.log('Successfully pushed the base')
  })
} else if (~conf._.indexOf('check')) {
  todos.check(conf, function (err, res) {
    if (err) throw err
    console.log(res.target_url)
  })
} else {
  console.log(`
    Usage: github-todo-status [command] [arguments]

    Where [command] is one of:
      check:      Checks todos, updates github status
      push-base:  Update a base file with todos which
                    will be excluded in the report

    And where [arguments] is a combination of:

      --cwd
      --files                   Files to include in the report, use a glob pattern
      --ignore                  Files to exclude in the report, use a glob pattern
      --base                    Name of file which should be excluded in report
      --basePrefix              Path or the base file
      --s3.key
      --s3.secret
      --s3.bucket
      --s3.path
      --github.token
      --github.user
      --github.repo
      --github.sha              Commit hash of which the status gets updated
      --github.success_description
      --github.error_description
      --github.context
      --github.target_url
  `)

  process.exit(1)
}
