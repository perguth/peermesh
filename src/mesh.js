var cuid = require( 'cuid')
var signalhub = require( 'signalhub')
var webrtcSwarm = require( 'webrtc-swarm')
var EventEmitter = require( 'events').EventEmitter
var inherits = require( 'inherits')

inherits( Swarm, EventEmitter)
var singleton = (function (){
  var instance
  function init (opts){
    return (instance = new Swarm( opts)) }
  return { getInstance: function (opts){
    return instance || (instance = init( opts)) } } })()

function Swarm (opts){
  if (! (this instanceof Swarm)) return new Swarm( opts)
  if (! opts) opts = { namespace: null }
  if (! this.namespace) {
    this.namespace = opts.namespace || cuid.slug()
    this.wrtc = webrtcSwarm( signalhub( this.namespace, ['http://localhost:7000']), {})
    ;['peer', 'connect', 'disconnect'].forEach( event =>{
      this.wrtc.on( event, x => this.emit( event, x)) }) }
}

module.exports = singleton.getInstance
