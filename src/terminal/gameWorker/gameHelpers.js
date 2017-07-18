import map from 'ramda/src/map'

export const basicAction = (action, gameState) => {
  switch (action.command) {
    case 'look':
      return gameState.loc.getLocationDesc()
    case 'dance':
      return 'You dance a merry jig to a song only you can hear'
    default:
      return 'You did something'
  }
}

export const findObject = ({ item, usingItem }, gameState) => {}
