'use strict'
const r = require('ramda')

const binCmds = ['help', 'git', 'requesttoken', 'contact']
const binErrCmds = ['rm']

//Check for any override commands
const matchBinCmd = r.anyPass(r.map(r.startsWith)(binCmds))
const matchBinErrCmd = r.anyPass(r.map(r.startsWith)(binErrCmds))

module.exports.main = (event, context, callback) => {
  //Parse the command and token from the event
  const cmd = r.pathOr('', ['body', 'command'])(event)
  const token = r.pathOr('', ['body', 'token'])(event)

  let updatedCmd, cwd, type
  if (matchBinErrCmd(cmd)) {
    updatedCmd = `./${cmd}`
    cwd = '/var/task/bin'
    type = 'error'
  } else if (matchBinCmd(cmd)) {
    updatedCmd = `./${cmd}`
    cwd = '/var/task/bin'
    type = 'result'
  } else {
    updatedCmd = cmd
    cwd = '/var/task/term'
    type = 'result'
  }
  //Log command to cloudfront
  console.log('command', cmd)
  var exec = require('child_process').exec
  exec(
    updatedCmd,
    {
      cwd: cwd,
      env: {
        token: token,
      },
    },
    function callback(error, stdout, stderr) {
      if (error) {
        //Replace breaks with br tags, for display purposes
        const out = stderr.replace(/(?:\r\n|\r|\n)/g, '<br />')
        const result = {
          result: out,
          pwd: '/var/task/term',
          type: 'error',
          command: cmd,
        }
        context.succeed(result)
      } else {
        const out = stdout.replace(/(?:\r\n|\r|\n)/g, '<br />')
        const result = {
          result: out,
          pwd: `/var/task/term`,
          env: {
            token: token,
          },
          type: type,
          command: cmd,
        }
        context.succeed(result)
      }
    }
  )
}
//TODO: remove this
module.exports.test = (event, context, callback) => {
  const cmd = r.pathOr('', ['body', 'command'])(event)

  const result = {
    result: 'test',
    pwd: '/',
    type: 'result',
    command: cmd,
  }
  context.succeed(result)
}
