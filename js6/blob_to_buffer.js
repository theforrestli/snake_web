module.exports = function blobToBuffer(blob, cb) {
  if(blob == undefined) {
    return cb(new Uint8Array())
  }
  const fileReader = new FileReader();
  fileReader.onloadend  = function(event) { 
    const uint8ArrayNew = new Uint8Array(event.target.result);
    cb(uint8ArrayNew)
  }
  fileReader.readAsArrayBuffer(blob);
}
