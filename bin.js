#!/usr/bin/env node
var conf = require('rc')('github_todo_status')
var check = require('./')
check(conf, function (err, res) {
  if (err) throw err
  console.log(res.target_url)
})
