var _ = require('lodash')

module.exports = function generateHtml (opts, cb) {
  var repoUrl = `https://github.com/${opts.user}/${opts.repo}`
  var treeUrl = `${repoUrl}/tree/${opts.sha}`
  var todos = opts.todos
  var html = `
  <html>
    <head>
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/semantic.min.css">
      <style>
        .ui.main.text.container {
          padding: 5em 0;
        }

        h1.ui.center.aligned.icon.header a {
          color: black;
          line-height: 3em;
          cursor: pointer;
        }

        .header a:focus {
          outline: none;
        }

        .header a:focus .github {
          color: #444;
          background: #F0F0F0;
        }

        .ui.top.attached.label {
          background: #F8F8F8;
          min-height: 32px;
        }

        .todo-action {
          float: right;
        }

        .segment.code {
          background: #FDFDFD;
          padding: 0;
        }

        pre {
          margin: 0;
        }

        .line {
          display: block;
          transition: all 0.3s ease;
        }

        .line-number {
          display: inline-block;
          width: 52px;
          border-right: 1px solid #EEEEEE;
          padding: 0 12px 0 12px;
          margin: 0 12px 0 0;
          background: rgba(255,255,255,0.6);
        }

        .highlight {
          background: #FFEFB4;
          color: #814444;
        }

        .highlight .line-number {
          color: #444;
          font-weight: 600;
        }

        .highlight:hover, .highlight:focus  {
          background: #FFE480;
          color: #793535;
          outline: none;
        }
      </style>
    </head>
    <body>
      <div class="ui main text container">
        ${htmlForHeader(treeUrl, todos)}
        ${htmlForTodos(repoUrl, treeUrl, todos)}
      </div>
    </body>
  </html>
  `

  cb(null, html)
}

function htmlForHeader (treeUrl, todos) {
  if (!todos.length) {
    return `
      <h1 class="ui center aligned icon header">
        <a href="${treeUrl}">
          <i class="circular thumbs up icon"></i>Hooray!! There are no new todos
        </a>
      </h1>
    `
  } else {
    return `
      <h1 class="ui center aligned icon header">
        <a href="${treeUrl}">
          <i class="circular github icon"></i>Todos
        </a>
      </h1>
    `
  }
}

function htmlForTodos (repoUrl, treeUrl, todos) {
  if (!todos.length) return ''
  return todos.map(_.partial(htmlForTodo, repoUrl, treeUrl)).join('')
}

function htmlForTodo (repoUrl, treeUrl, todo) {
  var lineUrl = `${treeUrl}/${todo.file}#L${todo.line}`
  return `
    <div class="html ui top attached segment">
      <div class="ui top attached label">
        ${todo.file}:${todo.line}

        <a tabindex = "-1" href="${lineUrl}" class="todo-action" title="Open file on github">
          <i class="linkify link icon"></i>
        </a>

        <a tabindex = "-1" href="${repoUrl}/issues/new?title=${todo.text}" class="todo-action" title="Create an issue">
          <i class="bug link icon"></i>
        </a>
      </div>
    </div>
    <div class="ui bottom attached segment code">
      <pre><code class="language-${todo.ext}">${htmlForTodoContent(todo, lineUrl)}</code></pre>
    </div>
  `
}

function htmlForTodoContent (todo, lineUrl) {
  var line = todo.context.line
  var content = todo.context.partial.map(function (lineContent, i) {
    lineContent = _.escape(lineContent)
    var lineNumber = `<span class="line-number">${i + 1 + todo.context.begin }</span>`
    if (i == line) return `<a href="${lineUrl}" class="line highlight">${lineNumber}${lineContent}</a>`
    else return '<span class="line">' + lineNumber + lineContent + '</span>'
  })

  return content.join('').replace(/^\s+\n|\n\s$/g, '')
}

