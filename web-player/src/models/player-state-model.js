/**
 * Player state model
 */
export class PlayerStateModel {
  constructor (state, positionInMilliseconds = parseInt('0', 10)) {
    this.positionInMilliseconds = positionInMilliseconds
    this.state = state
  }
}
