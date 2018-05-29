// Import client startup through a single index entry point
import './routes.js'
import { EXPLORER_VERSION } from '../both/index.js'

// Developer note
console.log('block-explorer - ',EXPLORER_VERSION)
console.log('We\'re hiring! https://angel.co/theqrl/jobs')
console.log('Found a security bug? security@theqrl.org')
console.log('Found a problem? https://github.com/theQRL/block-explorer/issues')

// Convert bytes to hex
export function bytesToHex(byteArray) {
  return Array.from(byteArray, (byte) => {
    return ('00' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

// Returns an address ready to send to gRPC API
export function addressForAPI(address) {
  return Buffer.from(address.substring(1), 'hex')
}

// Convert bytes to string
export function bytesToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

// Represent n number of bytes as human readable size
export function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals || 3
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  // eslint-disable-next-line
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

let disconnectTimer = null

// disconnect after 5 mins in background
const disconnectTime = 5 * 60 * 1000
// for testing:
// const disconnectTime = 5000
const disconnectVoids = []

export function removeDisconnectTimeout() {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
  }
}

function createDisconnectTimeout() {
  removeDisconnectTimeout()
  disconnectTimer = setTimeout(() => {
    Meteor.disconnect()
    console.log('disconnected due to idle state')
    $('.rv-vanilla-modal-overlay-fi').addClass('is-shown')
    $('.rv-vanilla-modal-overlay-fi').show()
    $('.rv-vanilla-modal-fi').addClass('rv-vanilla-modal-is-open')
    $('#target-modal').show()
  }, disconnectTime)
}

export function disconnectIfHidden() {
  removeDisconnectTimeout()
  if (document.hidden) {
    createDisconnectTimeout()
  } else {
    // we *could* automatically reconnect if the tab becomes visible again...
    // Meteor.reconnect()
  }
}

disconnectIfHidden()

document.addEventListener('visibilitychange', disconnectIfHidden)

if (Meteor.isCordova) {
  document.addEventListener('resume', () => { Meteor.reconnect() })
  document.addEventListener('pause', () => { createDisconnectTimeout() })
}

