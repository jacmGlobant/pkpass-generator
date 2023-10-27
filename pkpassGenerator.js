/** 
 *  pass identifier: pass.com.jacm.pasedeprueba
 *  system call to zip utility for compresion: zip -r => for zip
 *  hasha library to create the manifest.json (sha1 hexadecimal)
 *  For sign in: openssl smime -binary -sign -certfile ${config.appleWWDRCACertificatePath} -signer ${config.passCertificatePath} -inkey ${config.passCertificateKeyPath} -in ${tempPassFolder}/manifest.json -out ${tempPassFolder}/signature -outform DER -passin pass:${config.certificatePassword}
 *  PassSigner => password: Test@123
*/

const hasha = require('hasha');

const _createTemporaryDirectory = async () => {
   console.log('> _createTemporaryDirectory called');
}

const _copyPassToTemporaryLocation = async () => {
   console.log('> _copyPassToTemporaryLocation called');
}

const _cleanDSStoreFiles = async () => {
   console.log('> _cleanDSStoreFiles called');
}

const _generateJSONManifest = async () => {
   console.log('> _generateJSONManifest called');
}

const _signJSONManifest = async () => {
   console.log('> _signJSONManifest called');
}

const _compressPassFile = async () => {
   console.log('> _signJSONManifest called');
}

const signPass = async () => {
   await _createTemporaryDirectory();
   await _copyPassToTemporaryLocation();
   await _cleanDSStoreFiles();
   await _generateJSONManifest();
   await _signJSONManifest();
   await _compressPassFile();
   console.log('signPass called !');
}

module.exports = signPass;