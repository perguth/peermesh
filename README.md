# peermesh

> Send files peer-to-peer over a mesh network built with WebRTC.

- [x] Works fully in the browser using `WebRTC`.
- [x] Mesh swarms can be started by opening the site. A "mesh URL" is generated to be passed around.
- [x] Swarms can be joined by opening the mesh URL.
- [x] Swarm form fully meshed networks (n:n) using [`webrtc-swarm`](https://github.com/mafintosh/webrtc-swarm).
- [x] WebRTC signaling data is exchanged via [`signalhub`](https://github.com/mafintosh/signalhub).

Files will not be propagated among peers. The peers that initates a transfer will send the file to all connected peers.

[![peermesh](https://cdn.pbrd.co/images/1lPSAkRF.png)](https://pguth.github.io/peermesh/)

## Related

- [`peertransfer`](https://github.com/pguth/peertransfer)
  Peertransfer is a (1:n) WebRTC based file transfer tool. Compared to `peermesh` it encodes a authentication code into the "sharing URL" that is passed around and will not initiate WebRTC signaling if the code is missing or wrong. Also it encrypts the file before it is send out using a key that is encoded in the URL.
