# peermesh

> Start a **fully meshed network** by passing on the generated link and share files **peer-to-peer** and **end-to-end encrypted** powered by WebRTC!

- [x] Works fully in the browser using `WebRTC`.
- [x] Mesh swarms can be started by opening the site. A "mesh URL" is generated to be passed around.
- [x] The mesh URL contains a password. All files mesh will be sent `end-to-end encrypted`.
- [x] Swarms can be joined by opening the mesh URL.
- [x] Swarm form fully meshed networks (n:n) using [`webrtc-swarm`](https://github.com/mafintosh/webrtc-swarm).
- [x] WebRTC signaling data is exchanged via [`signalhub`](https://github.com/mafintosh/signalhub).
- [x] Swarm URLs can be bookmarked and reused. `trust on first use: encryption keys`
- [ ] You see when the source code changes because of [`hyperboot`](https://github.com/substack/hyperboot). `trust on first use: source code`

Files will \*not\* be propagated among peers. The peers that initates a transfer will send the file to every connected peer individually.

Combining trust on first use both for encryption keys \*and\* source code will help you [defeat Sauron](http://holgerkrekel.net/2013/10/26/defating-sauron-with-the-trust-on-first-use-principle/)!

[![peermesh](https://cdn.pbrd.co/images/1nDKNtbn.png)](https://pguth.github.io/peermesh/)

## Installation

```sh
git clone https://github.com/pguth/peermesh.git
cd peermesh

# You need a signaling server running:
npm install -g signalhub
signalhub listen -p 7000

# Now serve peermesh:
npm run build # and then open `public/index.html` in your browser or
npm start # to start the development server on `http://localhost:9966`
```

## Related

- [`peertransfer`](https://github.com/pguth/peertransfer)
  Peertransfer is a (1:n) WebRTC based file transfer tool. Compared to `peermesh` it encodes a authentication code into the "sharing URL" that is passed around and will not initiate WebRTC signaling if the code is missing or wrong.

## Credits

- [Encrypt and decrypt content with Nodejs](http://lollyrock.com/articles/nodejs-encryption/) `crypto`
- [JavaScript File Encrypter](http://tutorialzine.com/2013/11/javascript-file-encrypter/) `design`

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
