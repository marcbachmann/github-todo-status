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

        .segment.code {
          background: #FEFEFE;
        }

        .ui.top.attached.label {
          background: #F8F8F8;
          min-height: 32px;
        }

        .todo-action {
          float: right;
        }

        .highlight {
          background: yellow
        }
      </style>
    </head>
    <body>
      <div class="ui main text container">
        <h1 class="ui header">
          <a href="${treeUrl}">
            <i class="github icon"></i>
          </a>
          &nbsp;Todos
        </h1>
        ${htmlForTodos(repoUrl, treeUrl, todos)}
      </div>
    </body>
  </html>
  `

  cb(null, html)
}

function htmlForTodos (repoUrl, treeUrl, todos) {
  return todos.map(_.partial(htmlForTodo, repoUrl, treeUrl))
}

function htmlForTodo (repoUrl, treeUrl, todo) {
  return `
    <div class="html ui top attached segment">
      <div class="ui top attached label">
        ${todo.file}:${todo.line}

        <a href="${treeUrl}/${todo.file}#L${todo.line}" class="todo-action" title="Open file on github">
          <i class="linkify link icon"></i>
        </a>

        <a href="${repoUrl}/issues/new?title=${todo.text}" class="todo-action" title="Create an issue">
          <i class="bug link icon"></i>
        </a>
      </div>
    </div>
    <div class="ui bottom attached segment code">
      <pre><code class="language-${todo.ext}">${htmlForTodoContent(todo)}</code></pre>
    </div>
  `
}

function htmlForTodoContent (todo) {
  var line = todo.context.line
  var content = todo.context.partial.map(_.escape)
  content[line] = '<span class="highlight">' + content[line] + '</span>'
  return content.join('\n').trim()
}

