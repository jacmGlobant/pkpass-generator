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

(async () => {
   await signPass();
})()