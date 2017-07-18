import ReactDOM from 'react-dom'
import Terminal from './terminal/Terminal.js'
import Portfolio from './portfolio/Portfolio.js'
import registerServiceWorker from './registerServiceWorker'
import './index.scss'

//Setup terminal section
const termElement = document.getElementById('termPlugin')
if (termElement) {
  ReactDOM.render(Terminal, termElement)
}

//Setup portfolio module
const portElement = document.getElementById('portPlugin')
if (portElement) {
  ReactDOM.render(Portfolio, portElement)
}

registerServiceWorker()
