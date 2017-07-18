import { Component } from 'react'
import { div } from 'react-hyperscript-helpers'
import './Terminal.scss'
import { Scrollbars } from 'react-custom-scrollbars'
import { hyper, hyperNoParams } from '../helpers/decorators'
import $ from 'jquery'

const hScroll = hyper(Scrollbars)

@hyperNoParams
class TerminalMain extends Component {
  componentDidMount() {
    const _this = this
    require.ensure(
      ['./Terminal.elm'],
      function(require) {
        const termElm = require('./Terminal.elm')

        const elmElement = document.getElementById('termHost')
        const app = termElm.Main.embed(elmElement)
        app.ports.sendCmd.subscribe(cmd => {
          setTimeout(() => {
            //After each command, scroll to bottom of terminal
            const scrollMain = $('.termScroll')
            const scrollEls = scrollMain.children()
            const scrollEl = scrollEls[0]
            const height = scrollEl.scrollHeight
            $(scrollEl).scrollTop(height)
          }, 100)
          if (cmd === 'exit' || cmd === 'quit') {
            if (!!_this.worker && !!_this.worker.terminate) {
              _this.worker.terminate()
            }
          }
          if (cmd === 'game') {
            if (!!window.Worker) {
              //Load worker when started
              require.ensure(['./gameWorker/TermGame.worker.js'], require => {
                const GameWorker = require('./gameWorker/TermGame.worker.js')

                //Start new worker process
                const worker = (_this.worker = new GameWorker())
                app.ports.gameResult.send('You wake up slowly.')

                //When a message comes through from Elm app, send it through to worker
                app.ports.sendGameCmd.subscribe(cmd => {
                  worker.postMessage(cmd)
                })

                //When the worker responds, pass it back through Elm
                worker.onmessage = res => {
                  app.ports.gameResult.send(res.data)
                }
              })
            } else {
              app.ports.gameResult.send('NoWorker')
            }
          }
        })
      },
      'elmC'
    )
  }
  componentWillUpdate() {
    return false
  }
  render() {
    return div(
      '.elm-term-host',
      {
        id: 'termHost',
      },
      []
    )
  }
}

@hyperNoParams
class Terminal extends Component {
  render() {
    return div('.terminal', [
      hScroll(
        '.termScroll',
        {
          autoHeight: true,
          autoHeightMin: 45,
          autoHeightMax: 200,
          //Need to do this to add class to scrollbar
          renderTrackVertical: props => div('.track-vertical', { ...props }),
        },
        [TerminalMain]
      ),
    ])
  }
}

export default Terminal
