var cuid = require( 'cuid')
var signalhub = require( 'signalhub')
var webrtcSwarm = require( 'webrtc-swarm')
var EventEmitter = require( 'events').EventEmitter
var inherits = require( 'inherits')

module.exports = Mesh

inherits( Mesh, EventEmitter)
function Mesh (opts){
  if (! (this instanceof Mesh)) return new Mesh( opts)
  if (! opts) opts = { namespace: null }
  if (! this.namespace) {
    this.namespace = opts.namespace || cuid.slug()
    this.wrtc = webrtcSwarm( signalhub( this.namespace, 
      ['http://localhost:7000']), {})
    ;['peer', 'connect', 'disconnect'].forEach( event =>{
      this.wrtc.on( event, x => this.emit( event, x)) }) } }
