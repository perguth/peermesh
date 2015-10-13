var inherits = require( 'inherits')
var EventEmitter = require( 'events').EventEmitter
var FileReadStream = require( 'namedfilestream/read')
var FileWriteStream = require( 'namedfilestream/write')
var detect = require('feature/detect')


inherits( Dispatcher, EventEmitter)
var singleton = (function (){
  var instance
  function init (opts){
    return (instance = new Dispatcher( opts))}
  return { getInstance: function (opts){
    return instance || (instance = init( opts)) } } })()

function Dispatcher (opts){
  var urlElem = document.getElementById('url')
  var uploadbtn = document.getElementById( 'uploadLink')
  var downloadbtn = document.getElementById( 'downloadLink')
  var peers = 0

  this.on( 'noHash', dat =>{
    let mesh = require( './mesh')()
    mesh.on( 'peer', peer => this.emit( 'peer', peer))
    mesh.on( 'disconnect', x => console.log( 'disconnect'))
    setTimeout( x =>{
      let url = window.location.href.toString() + '#' + mesh.id
      urlElem.value = url
      console.log( mesh.id) }, 100) })

  this.on( 'hash', dat =>{
    let mesh = require( './mesh')( { id: dat })
    mesh.on( 'peer', peer => this.emit( 'peer', peer))
    mesh.on( 'disconnect', x => {
      console.log( 'disconnect')
      if (--peers == 0) {
        uploadbtn.style[ 'cursor'] = 'pointer'
        uploadbtn.style[ 'opacity'] = '.6'
        uploadbtn.text = 'transmitted - reinitializing'
      } })
      
    let url = window.location.href.toString()
    urlElem.value = url })

  this.on( 'peer', peer =>{
    console.log( 'new peer connected')
    uploadbtn.style[ 'cursor'] = 'pointer'
    uploadbtn.style[ 'opacity'] = '1'
    peers++
    uploadbtn.text = 'SEND A FILE to ' + peers + ' peer' + ((peers > 1)?'s':'')

    let receive = new FileWriteStream()
    peer.pipe( receive).on( 'file', file =>{
      console.log( 'file received', file)
      let fileLink = detect( 'URL').createObjectURL( file)
      downloadbtn.innerHTML = file.name
      downloadbtn.style[ 'cursor'] = 'pointer'
      downloadbtn.style[ 'opacity'] = '1'
      downloadbtn.href = fileLink
    }) })

  this.on( 'fileAdded', input =>{
    let mesh = require( './mesh')()
    let file = new FileReadStream( input)
    mesh.wrtc.peers.forEach( (peer, key) =>{
      console.log( 'sending file to peer #', key)
      file.pipe( peer)
      file.on( 'end', x => console.log( 'end file stream')) }) })
}

module.exports = singleton.getInstance
