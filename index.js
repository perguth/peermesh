var d = require('./src/dispatcher')()

var locationHash = window.location.hash.substr(1)

if (locationHash) d.emit('hash', locationHash)
else d.emit('noHash')

document.getElementById('send').onchange =
  e => d.emit('fileAdded', e.target.files[0])

document.getElementById('newMesh').onclick =
  e => d.emit('startNewMesh')
