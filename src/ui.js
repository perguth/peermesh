var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

module.exports = Ui

inherits(Ui, EventEmitter)
function Ui (opts) {
  if (!(this instanceof Ui)) return new Ui(opts)

  var uploadbtn = document.getElementById('uploadLink')

  this.on('noMorePeers', peers => {
    uploadbtn.style['cursor'] = 'default'
    uploadbtn.style['opacity'] = '.6'
    uploadbtn.onclick = x => null
    uploadbtn.className =
    uploadbtn.className.replace('process', 'receive')
    uploadbtn.className =
    uploadbtn.className.replace('green', 'magenta')
    uploadbtn.className =
    uploadbtn.className.replace('red', 'magenta')
    uploadbtn.text = 'reinitializing'
  })

  this.on('peersAvailable', peers => {
    uploadbtn.style['cursor'] = 'pointer'
    uploadbtn.style['opacity'] = '1'
    uploadbtn.onclick = x => document.getElementById('send').click()
    uploadbtn.className =
      uploadbtn.className.replace('receive', 'send')
    uploadbtn.className =
      uploadbtn.className.replace('process', 'send')
    uploadbtn.className =
      uploadbtn.className.replace('magenta', 'green')
    uploadbtn.className =
      uploadbtn.className.replace('red', 'green')
    uploadbtn.text = 'send to ' + peers + ' peer' + ((peers > 1) ? 's' : '')
  })

  this.on('fileReceived', fileID => {
    let fileButton = document.getElementsByClassName(fileID)[0]
    fileButton.className =
      fileButton.className.replace('receive', 'browse') })

  this.on('addFileButton', (fileName, fileID) => {
    console.log('fileid', fileID)
    let filesArea = document.getElementById('files')
    filesArea.innerHTML =
      `<a id=downloadLink class='button receive red ${fileID}' style='cursor:default;
        width:100%;height:62px;line-height:62px;margin-bottom:13px;
        text-transform:none;opacity:1;background-image:url(green-big.png);
        background-repeat:no-repeat;background-position-x:-436px;'
        target=_blank>${fileName}</a>${filesArea.innerHTML}` })

  this.on('updateProgress', (name, fileID, overall, size) => {
    let fileButton = document.getElementsByClassName(fileID)[0]
    let margin = -1 * (436 - 436 * size / overall)
    fileButton.style.backgroundPositionX = margin + 'px'
  })

  this.on('attachFileURL', (fileID, fileLink, fileName) => {
    let fileButton = document.getElementsByClassName(fileID)[0]
    fileButton.href = fileLink
    fileButton.download = fileName
    fileButton.style.cursor = 'pointer'
  })

  this.on('sendFile', x => {
    uploadbtn.style['cursor'] = 'default'
    uploadbtn.onclick = x => null
    uploadbtn.text = 'sending'
    uploadbtn.className =
    uploadbtn.className.replace('green', 'red')
    uploadbtn.className =
    uploadbtn.className.replace('send', 'process')
  })
}
