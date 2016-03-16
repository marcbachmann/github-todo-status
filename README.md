# Adds a github status check for inline todos

The module automatically creates a html page and uploads it to s3.

```bash
# on master branch
github-todo-status push-base \
    --base=master \
    --s3.key=key \
    --s3.secret=secret \
    --s3.bucket=bucket

# on pr branch
github-todo-status check \
    --base=master \
    --s3.key=key \
    --s3.secret=secret \
    --s3.bucket=bucket \
    --github.token=token \
    --github.user=user \
    --github.repo=repo \
    --github.sha=sha
```


TODO:
- Filter for files in the current pull request and group them
- Write tests
