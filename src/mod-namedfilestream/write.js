var FileWriteStream = require('../mod-filestream/write');
var inherits = require('inherits');
var HEADER = require('namedfilestream/header');

function NamedWriteStream(callback, opts) {
  if (! (this instanceof NamedWriteStream)) {
    return new NamedWriteStream(callback, opts);
  }

  this._processedHeader = false;
  this.metadata = null;

  FileWriteStream.call(this, callback, opts);
}

inherits(NamedWriteStream, FileWriteStream);
module.exports = NamedWriteStream;

NamedWriteStream.prototype._createFile = function() {
  // if we have no buffers, then abort any processing
  if (this._buffers.length === 0 || (! this.metadata)) {
    return;
  }

  return new File([new Blob(this._buffers)], this.metadata.name, this.metadata);
};

NamedWriteStream.prototype._preprocess = function(data, callback) {
  // ensure we have processed the header
  if (! this._processedHeader) {
    if (HEADER.compare(data) !== 0) {
      return callback(new Error('Could not read incoming file data: header mismatch'));
    }

    this._processedHeader = true;
    return callback();
  }

  // extract the metadata
  if (! this.metadata) {
    try {
      this.metadata = JSON.parse(data.toString());
      this.emit('header', this.metadata);
      return callback();
    }
    catch (e) {
      return callback(e);
    }
  }

  // pass through the data
  callback(null, data);
};
