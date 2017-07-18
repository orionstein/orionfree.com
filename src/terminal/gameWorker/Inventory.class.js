import assoc from 'ramda/src/assoc'
import pipe from 'ramda/src/pipe'
import path from 'ramda/src/path'
import head from 'ramda/src/head'
import has from 'ramda/src/has'
import nth from 'ramda/src/nth'
import defaultTo from 'ramda/src/defaultTo'

import data from './GameData.json'

export default class Inventory {
  constructor() {
    this.items = []
    this.addItem = this.addItem.bind(this)
    this.getLocation = this.getLocation.bind(this)
    this.move = this.move.bind(this)
    this.getLocationDesc = this.getLocationDesc.bind(this)
  }
  getItem(itemId, gameState) {}
  addItem(itemId) {}
  list() {
    return `You have: ${this.items.join(', ')}`
  }
  dropItem() {}
}
