var inherits = require( 'inherits')
var EventEmitter = require( 'events').EventEmitter
var FileReadStream = require( 'namedfilestream/read')
var FileWriteStream = require( 'namedfilestream/write')
var detect = require( 'feature/detect')


inherits( Dispatcher, EventEmitter)
var singleton = (function (){
  var instance
  function init (opts){
    return (instance = new Dispatcher( opts))}
  return { getInstance: function (opts){
    return instance || (instance = init( opts)) } } })()

function Dispatcher (opts){
  var urlElem = document.getElementById( 'url')
  var uploadbtn = document.getElementById( 'uploadLink')
  var downloadbtn = document.getElementById( 'downloadLink')
  var mesh
  var peers = 0

  this.on( 'noHash', x=> this.emit( 'initMesh') )

  this.on( 'hash', hash =>{
    this.emit( 'initMesh', hash)
    urlElem.value = window.location.href.toString() })

  this.on( 'initMesh', namespace =>{
    let opts = {namespace} || null
    mesh = require( './mesh')( opts)
    console.log( 'mesh initialized:', mesh)
    ;['connect', 'disconnect'].forEach( event =>{
      mesh.on( event, peer => this.emit( event, peer)) })
    this.emit( 'updateURL', mesh.namespace) })

  this.on( 'startNewMesh', x=>{
    window.location.href = urlElem.value.split( '#', 1)[ 0] })

  this.on( 'updateURL', hash =>{
    let url = window.location.href.toString()
    if (url.indexOf( '#') === -1){
      url += '#' + hash
      window.location.hash = '#' + hash }
    setTimeout( x=>{ urlElem.value = url }, 100) })

  this.on( 'disconnect', peer =>{
    console.log( 'peer disconnected:', peer)
    this.emit( 'updateSendButton') })

  this.on( 'updateSendButton', x=>{
    let peers = mesh.wrtc.peers.length
    if (peers <= 0){
      uploadbtn.style[ 'cursor'] = 'default'
      uploadbtn.style[ 'opacity'] = '.6'
      uploadbtn.text = 'reinitializing' }
    else
      uploadbtn.text = 'send a file to ' + peers + ' peer'
        + ((peers > 1)?'s':'') })

  this.on( 'connect', peer =>{
    console.log( 'peer connected:', peer)
    this.emit( 'updateSendButton')
    this.emit( 'acceptFiles', peer) })

  this.on( 'acceptFiles', peer =>{
    let receive = new FileWriteStream()
    peer.pipe( receive).on( 'file', file =>{
      console.log( 'file received', file)
      this.emit( 'attachFileURL', file) }) })

  this.on( 'attachFileURL', file =>{
    let fileLink = detect( 'URL').createObjectURL( file)
      downloadbtn.innerHTML = file.name
      downloadbtn.style[ 'cursor'] = 'pointer'
      downloadbtn.style[ 'opacity'] = '1'
      downloadbtn.href = fileLink })

  this.on( 'fileAdded', input =>{
    let file = new FileReadStream( input)
    mesh.wrtc.peers.forEach( (peer, key) => this.emit( 'sendFile', file, peer)) })

  this.on( 'sendFile', (file, peer) =>{
    console.log( 'sending file to peer:', peer)
    file.pipe( peer)
    file.on( 'end', x=>
      console.log( 'sadly this also ends the peer stream :-(') ) })
}

module.exports = singleton.getInstance
