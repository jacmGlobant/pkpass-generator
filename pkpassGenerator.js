/** 
 *  pass identifier: pass.com.jacm.pasedeprueba
 *  system call to zip utility for compresion: zip -r => for zip
 *  hasha library to create the manifest.json (sha1 hexadecimal)
 *  For sign in: openssl smime -binary -sign -certfile ${config.appleWWDRCACertificatePath} -signer ${config.passCertificatePath} -inkey ${config.passCertificateKeyPath} -in ${tempPassFolder}/manifest.json -out ${tempPassFolder}/signature -outform DER -passin pass:${config.certificatePassword}
 *  PassSigner => password: Test@123
*/
const fs = require('fs');
const fse = require('fs-extra');
const hasha = require('hasha');
const { exec } = require('child_process');

const ROOT_PATH = './';
const SAMPLE_PASS = './passes/sample';
const OUTPUT_PASS = './output';

const DS_STORE_FILE = 'output/.DS_Store';
const SIGNATURE_FILE = 'output/signature' 
const MANIFEST_FILE = 'output/manifest.json';

const _createTemporaryDirectory = async () => {
   try {
      if (fs.existsSync(OUTPUT_PASS)) {
         fs.rmSync(OUTPUT_PASS, { recursive: true, force: true });
      } 
   } catch (error) {
      // log system here
   } finally {
      fs.mkdirSync(OUTPUT_PASS);
   }
}

const _copyPassToTemporaryLocation = async () => {
   try {
      fse.copySync(SAMPLE_PASS, OUTPUT_PASS, { overwrite: true })
   } catch (error) {
      // log system here
   }
}

const _cleanDSStoreFiles = async () => {
   try {
      [DS_STORE_FILE, SIGNATURE_FILE, MANIFEST_FILE].map(f => {
         fs.rmSync(f, { recursive: false, force: true });
      });
   } catch (error) {
      
   }
}


const _buildPassFormat = async () => {
   const passFormat = {
      passTypeIdentifier: 'pass.com.jacm.pasedeprueba',
      webServiceURL: 'http://propane.apple.com:4567/',
      formatVersion: 1,
      relevantDate: '2011-12-08T13:00-08:00',
      teamIdentifier: 'SDKQATEAM1',
      authenticationToken: '30c4cb4ba863fa9d7687959d8fbc6f0c',
      description: 'Boarding pass',
   }
   // write in the output folder;
}

const _generateJSONManifest = async () => {
   console.log('> _generateJSONManifest called');
}

const _signJSONManifest = async () => {
   console.log('> _signJSONManifest called');
}

const _compressPassFile = async () => {
   const CMD = 'ls';
   exec(CMD, (err, stdout, stderr) => {
      if (err) {
        return;
      }
      console.log(stdout);
   });
   console.log('> _signJSONManifest called');
} 

const signPass = async () => {
   await _createTemporaryDirectory();
   await _copyPassToTemporaryLocation();
   await _cleanDSStoreFiles();

   await _buildPassFormat();

   await _generateJSONManifest();
   await _signJSONManifest();
   await _compressPassFile();
   console.log('signPass called !');
}

module.exports = signPass;