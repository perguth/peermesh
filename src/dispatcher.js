var algorithm = 'aes-256-ctr'
var crypto = require('crypto')
var detect = require('feature/detect')
var EventEmitter = require('events').EventEmitter
var FileReadStream = require('namedfilestream/read')
var FileWriteStream = require('./mod-namedfilestream/write')
var inherits = require('inherits')
var ui = require('./ui')()

module.exports = Dispatcher

inherits(Dispatcher, EventEmitter)
function Dispatcher (opts) {
  if (!(this instanceof Dispatcher)) return new Dispatcher(opts)

  var urlElem = document.getElementById('url')
  var mesh

  this.on('noHash', x => {
    this.emit('initMesh')
  })

  this.on('hash', hash => {
    let parts = hash.split(':', 2)
    this.emit('initMesh', ...parts)
    urlElem.value = window.location.href.toString()
  })

  this.on('initMesh', (namespace, password) => {
    let opts = {namespace, password} || null
    mesh = require('./mesh')(opts)
    console.log('mesh initialized:', mesh)
    ;['connect', 'disconnect'].forEach(event => {
      mesh.on(event, peer => this.emit(event, peer))
    })
    this.emit('updateURL', mesh.namespace, mesh.password)
  })

  this.on('startNewMesh', x => {
    window.location.href = urlElem.value.split('#', 1)[0]
  })

  this.on('updateURL', (namespace, password) => {
    let url = window.location.href.toString()
    if (url.indexOf('#') === -1) {
      url += '#' + namespace + ':' + password
      window.location.hash = '#' + namespace + ':' + password
    }
    window.setTimeout(x => urlElem.value = url, 100)
  })

  this.on('disconnect', peer => {
    console.log('peer disconnected:', peer)
    this.emit('updateSendButton')
  })

  this.on('updateSendButton', x => {
    let peers = mesh.wrtc.peers.length
    if (peers <= 0) ui.emit('noMorePeers', peers)
    else ui.emit('peersAvailable', peers)
  })

  this.on('connect', peer => {
    console.log('peer connected:', peer)
    this.emit('updateSendButton')
    this.emit('acceptFiles', peer)
  })

  this.on('acceptFiles', peer => {
    let writeStream = new FileWriteStream()
    let decrypt = crypto.createDecipher(algorithm, mesh.password)
    writeStream.on('header', meta =>
      this.emit('handleDownload', meta, peer, writeStream, decrypt))
    peer.pipe(decrypt).pipe(writeStream).on('file', file => {
      console.log('file received:', file)
      this.emit('attachFileURL', file)
    })
  })

  this.on('handleDownload', (meta, peer, writeStream, decrypt) => {
    console.log('incoming file size:', meta.size)
    let shasum = crypto.createHash('sha1').update(meta.name)
    let fileID = shasum.digest('hex')
    ui.emit('addFileButton', meta.name, fileID)
    writeStream.on('progress', progress => {
      this.emit('endWriteStream',
        writeStream, peer, decrypt, meta.size, progress, fileID)
      ui.emit('updateProgress', meta.name, fileID, meta.size, progress)
    })
  })

  this.on('endWriteStream',
    (writeStream, peer, decrypt, overall, progress, fileID) => {
      if (overall <= progress) {
        writeStream.end()
        decrypt.end()
        ui.emit('fileReceived', fileID)
        this.emit('acceptFiles', peer)
      }
    })

  this.on('attachFileURL', file => {
    let shasum = crypto.createHash('sha1')
    shasum.update(file.name)
    let fileID = shasum.digest('hex')
    let fileLink = detect('URL').createObjectURL(file)
    ui.emit('attachFileURL', fileID, fileLink, file.name)
  })

  this.on('fileAdded', input => {
    let file = new FileReadStream(input, {fields: ['name', 'size', 'type']})
    mesh.wrtc.peers.forEach((peer, key) => this.emit('sendFile', file, peer))
  })

  this.on('sendFile', (file, peer) => {
    console.log('sending file to peer:', peer)
    ui.emit('sendFile')
    let encrypt = crypto.createCipher(algorithm, mesh.password)
    file.pipe(encrypt).pipe(peer, {end: false})
    file.on('end', x => this.emit('updateSendButton'))
  })
}
