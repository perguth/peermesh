var debug = require( 'debug')( 'pm')
localStorage.debug = 'pm:*'
var signalhub = require( 'signalhub')
var wrtcSwarm = require( 'webrtc-swarm')
//var wrtc = require('wrtc')

if (module.hot) module.hot.accept()

debug( 'pm:start'); console.log( 'start!')
var hub = signalhub( 'peermesh', [
  'localhost:7000' ])
var mesh = wrtcSwarm( hub, {
  //wrtc: wrtc
  })


mesh.on('connect', function (peer, id) {
  debug( 'pm: connect')
  console.log('connected to a new peer:', id)
  console.log('total peers:', mesh.peers.length)
})
mesh.on('disconnect', function (peer, id) {
  debug( 'pm: close')
  console.log('closed to a new peer:', id)
  console.log('total peers:', mesh.peers.length)
})


window.mesh = mesh


var crel = require('crel');
var detect = require('feature/detect');
var dnd = require('drag-and-drop-files');
var img = crel('img');
var video = crel('video', { autoplay: true });
var FileReadStream = require('namedfilestream/read');
var FileWriteStream = require('namedfilestream/write');

function upload(files) {
  var queue = [].concat(files);

  function sendNext() {
    var writer = new FileWriteStream();
    var next = queue.shift();

    console.log('sending file');
    new FileReadStream(next).pipe(writer).on('file', function(file) {
      console.log('file created: ', file);
      img.src = detect('URL').createObjectURL(file);
      // video.src = detect('URL').createObjectURL(next);

      if (queue.length > 0) {
        sendNext();
      }
    });
  }

  sendNext();
}

dnd(document.body, upload);

document.body.appendChild(crel('style', 'body, html { margin: 0; width: 100%; height: 100% }'));
document.body.appendChild(img);
document.body.appendChild(video);
