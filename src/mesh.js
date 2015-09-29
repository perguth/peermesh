var cuid = require( 'cuid')
var signalhub = require( 'signalhub')
var webrtcSwarm = require( 'webrtc-swarm')
var EventEmitter = require( 'events').EventEmitter
var inherits = require( 'inherits')

inherits( Swarm, EventEmitter)
var singleton = (function (){
  var instance
  function init (opts){
    return (instance = new Swarm( opts))}
  return { getInstance: function (opts){
    return instance || (instance = init( opts)) } } })()

function Swarm (opts){
  if (! (this instanceof Swarm)) return new Swarm( opts)
  if (! opts) opts = { id: null }
  if (! this.id) {
    this.id = opts.id || cuid()
    this.wrtc = webrtcSwarm( signalhub( this.id, ['http://x:7000']), {})
    ;['peer', 'connect', 'disconnect'].forEach( event =>{
      this.wrtc.on( event, x => this.emit( event, x)) }) }
}

module.exports = singleton.getInstance
