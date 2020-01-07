/**
 * Playback params
 */
import { Util } from '../util/util'

export class PlaybackParams {
  constructor (o) {
    this.accessToken = null
    this.tokenRefreshIntervalInMilliseconds = null
    this.contentUri = null
    this.offsetInMilliseconds = null
    this.autoPlay = null
    Object.assign(this, o)
    if (this.contentUri) {
      this.contentUri = JSON.parse(Util.base64Decode(this.contentUri))
    }
  }
}
