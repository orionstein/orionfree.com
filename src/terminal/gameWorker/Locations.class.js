import assoc from 'ramda/src/assoc'
import pipe from 'ramda/src/pipe'
import path from 'ramda/src/path'
import head from 'ramda/src/head'
import has from 'ramda/src/has'
import nth from 'ramda/src/nth'
import defaultTo from 'ramda/src/defaultTo'

import data from './GameData.json'

export default class Locations {
  constructor() {
    this.location = 0
    this.locationTree = [head(data.locations)]
    this.setLocation = this.setLocation.bind(this)
    this.getLocation = this.getLocation.bind(this)
    this.move = this.move.bind(this)
    this.getLocationDesc = this.getLocationDesc.bind(this)
  }
  setLocation(l) {
    this.location = l
  }
  getLocation() {
    return pipe(nth(this.location), defaultTo({}))(this.locationTree)
  }
  move(action) {
    const currLoc = this.getLocation()
    const direction = path(['directions', action.direction])(currLoc)
    if (direction) {
      if (direction.door && !direction.open) {
        return `That way is barred.`
      } else {
        this.setLocation(direction.loc)
        return `You head ${action.direction}`
      }
    } else {
      return `You can't go that way.`
    }
  }
  getLocationDesc() {
    console.log(this.locationTree)
    return path([this.location, 'description'])(this.locationTree)
  }
}
