import assoc from 'ramda/src/assoc'
import pipe from 'ramda/src/pipe'
import path from 'ramda/src/path'
import data from './GameData.json'
import parser from './GameParser.pegjs'
import { basicAction } from './gameHelpers'
import Locations from './Locations.class'

//Main worker for adventure game
//WIP, this won't work in shell very well yet, although parser is mostly complete

const gameState = {
  loc: new Locations(),
}

const resolveCommand = cmd => {
  cmd = cmd.toLowerCase()
  try {
    const parsedCmd = parser.parse(cmd)
    console.log(parsedCmd)
    switch (parsedCmd.type) {
      case 'basic':
        return basicAction(parsedCmd, gameState)
      case 'movement':
        return gameState.loc.move(parsedCmd)
      default:
        return `Sorry, I didn't understand that.`
    }
  } catch (e) {
    return `Sorry, I didn't understand that.`
  }
}

onmessage = function(e) {
  const result = resolveCommand(e.data)
  postMessage(result)
}
