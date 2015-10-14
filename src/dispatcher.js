var inherits = require( 'inherits')
var EventEmitter = require( 'events').EventEmitter
var FileReadStream = require( 'namedfilestream/read')
var FileWriteStream = require( './mod-namedfilestream/write')
var detect = require( 'feature/detect')
var crypto = require( 'crypto')
var algorithm = 'aes-256-ctr'

module.exports = Dispatcher

inherits( Dispatcher, EventEmitter)
function Dispatcher (opts){
  if (! (this instanceof Dispatcher)) return new Dispatcher( opts)
  
  var urlElem = document.getElementById( 'url')
  var uploadbtn = document.getElementById( 'uploadLink')
  var downloadbtn = document.getElementById( 'downloadLink')
  var mesh

  this.on( 'noHash', x=>{
    this.emit( 'initMesh') })

  this.on( 'hash', hash =>{
    let parts = hash.split(':', 2)
    this.emit( 'initMesh', ...parts)
    urlElem.value = window.location.href.toString() })

  this.on( 'initMesh', (namespace, password) =>{
    let opts = {namespace, password} || null
    mesh = require( './mesh')( opts)
    console.log( 'mesh initialized:', mesh)
    ;['connect', 'disconnect'].forEach( event =>{
      mesh.on( event, peer => this.emit( event, peer)) })
    this.emit( 'updateURL', mesh.namespace, mesh.password) })

  this.on( 'startNewMesh', x=>{
    window.location.href = urlElem.value.split( '#', 1)[ 0] })

  this.on( 'updateURL', (namespace, password) =>{
    let url = window.location.href.toString()
    if (url.indexOf( '#') === -1){
      url += '#' + namespace + ':' + password
      window.location.hash = '#' + namespace + ':' + password }
    setTimeout( x=> urlElem.value = url, 100) })

  this.on( 'disconnect', peer =>{
    console.log( 'peer disconnected:', peer)
    this.emit( 'updateSendButton') })

  this.on( 'updateSendButton', x=>{
    let peers = mesh.wrtc.peers.length
    if (peers <= 0){
      uploadbtn.style[ 'cursor'] = 'default'
      uploadbtn.style[ 'opacity'] = '.6'
      uploadbtn.onclick = x=> null
      uploadbtn.text = 'reinitializing' }
    else {
      uploadbtn.style[ 'cursor'] = 'pointer'
      uploadbtn.style[ 'opacity'] = '1'
      uploadbtn.onclick = x=> document.getElementById('send').click()
      uploadbtn.text = 'send a file to ' + peers + ' peer'
        + ((peers > 1)?'s':'') } })

  this.on( 'connect', peer =>{
    console.log( 'peer connected:', peer)
    this.emit( 'updateSendButton')
    this.emit( 'acceptFiles', peer) })

  this.on( 'acceptFiles', peer =>{
    let writeStream = new FileWriteStream()
    this.emit( 'endWriteStream', writeStream, peer)
    var decrypt = crypto.createDecipher(algorithm, mesh.password)
    peer.pipe(  decrypt).pipe( writeStream).on( 'file', file =>{
      console.log( 'file received:', file)
      this.emit( 'attachFileURL', file) }) })

  this.on( 'endWriteStream', (writeStream, peer) =>{
    writeStream.on( 'header', meta =>{
      console.log( 'incoming file size:', meta.size)
      writeStream.on( 'progress', size =>{
        console.log( 'already received:', size)
        if (meta.size <= size) {
          writeStream.end()
          this.emit( 'acceptFiles', peer) } }) }) })

  this.on( 'attachFileURL', file =>{
    let fileLink = detect( 'URL').createObjectURL( file)
      downloadbtn.innerHTML = file.name
      downloadbtn.style[ 'cursor'] = 'pointer'
      downloadbtn.style[ 'opacity'] = '1'
      downloadbtn.href = fileLink })

  this.on( 'fileAdded', input =>{
    let file = new FileReadStream( input, {fields: ['name', 'size', 'type']})
    mesh.wrtc.peers.forEach( (peer, key) => this.emit( 'sendFile', file, peer)) })

  this.on( 'sendFile', (file, peer) =>{
    console.log( 'sending file to peer:', peer)
    let encrypt = crypto.createCipher(algorithm, mesh.password)
    file.pipe( encrypt).pipe( peer, {end: false})
    file.on( 'end', x=>
      console.log( 'sadly this also ends the peer stream :-(') ) }) }
