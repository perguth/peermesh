var d = require( './src/dispatcher')()
//var debug = require('debug')
localStorage.debug = ''


var locationHash = location.hash.substr(1)

if (locationHash) d.emit( 'hash', locationHash)
else d.emit( 'noHash')

document.getElementById('send').onchange =
  e => d.emit('fileAdded', e.target.files[0])
