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
      uploadbtn.className =
        uploadbtn.className.replace( 'process', 'receive' )
      uploadbtn.className =
        uploadbtn.className.replace( 'green', 'magenta')
      uploadbtn.text = 'reinitializing' }
    else {
      uploadbtn.style[ 'cursor'] = 'pointer'
      uploadbtn.style[ 'opacity'] = '1'
      uploadbtn.onclick = x=> document.getElementById('send').click()
      uploadbtn.className =
        uploadbtn.className.replace( 'receive', 'process')
      uploadbtn.className =
        uploadbtn.className.replace( 'magenta', 'green')
      uploadbtn.text = 'send to ' + peers + ' peer'
        + ((peers > 1)?'s':'') } })

  this.on( 'connect', peer =>{
    console.log( 'peer connected:', peer)
    this.emit( 'updateSendButton')
    this.emit( 'acceptFiles', peer) })

  this.on( 'acceptFiles', peer =>{
    let writeStream = new FileWriteStream()
    let decrypt = crypto.createDecipher(algorithm, mesh.password)
    writeStream.on( 'header', meta =>{
      console.log( 'incoming file size:', meta.size)
      writeStream.on( 'progress', progress =>{
        this.emit( 'endWriteStream',
          writeStream, peer, decrypt, meta.size, progress) }) })
    peer.pipe(  decrypt).pipe( writeStream).on( 'file', file =>{
      console.log( 'file received:', file)
      this.emit( 'attachFileURL', file) }) })

  this.on( 'endWriteStream', (writeStream, peer, decrypt, overall, progress) =>{
    console.log( 'already received:', progress)
    if (overall <= progress) {
      writeStream.end()
      decrypt.end()
      this.emit( 'acceptFiles', peer) } })

  this.on( 'attachFileURL', file =>{
    let fileLink = detect( 'URL').createObjectURL( file)
      let filesAread = document.getElementById('files')
      filesAread.innerHTML =
        `<a id=downloadLink class='button browse red' style=cursor:pointer;width:100%;height:62px;line-height:62px;margin-bottom:13px;text-transform:none;opacity:1; target=_blank href=${fileLink} download="${file.name}">${file.name}</a>${filesAread.innerHTML}` })

  this.on( 'fileAdded', input =>{
    let file = new FileReadStream( input, {fields: ['name', 'size', 'type']})
    mesh.wrtc.peers.forEach( (peer, key) => this.emit( 'sendFile', file, peer)) })

  this.on( 'sendFile', (file, peer) =>{
    console.log( 'sending file to peer:', peer)
    let encrypt = crypto.createCipher(algorithm, mesh.password)
    file.pipe( encrypt).pipe( peer, {end: false})
    file.on( 'end', x=>
      console.log( 'sadly this also ends the peer stream :-(') ) }) }
