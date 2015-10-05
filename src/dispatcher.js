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
    mesh.on( 'disconnect', x => console.log( 'disconnect'))
      
    let url = window.location.href.toString() + '#' + dat
    urlElem.value = url })

  this.on( 'peer', peer =>{
    console.log( 'new peer connected')
    let receive = new FileWriteStream()
    peer.pipe( receive).on( 'file', file =>{
      console.log( 'file received', file)
      var downloadbtn = document.getElementById( 'downloadLink')
      var fileLink = detect( 'URL').createObjectURL( file)
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
