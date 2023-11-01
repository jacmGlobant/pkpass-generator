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
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

const ROOT_PATH = './';
const SAMPLE_PASS = './passes/sample';
const OUTPUT_PASS = './output';

const DS_STORE_FILE = 'output/.DS_Store';
const SIGNATURE_FILE = 'output/signature' 
const MANIFEST_FILE = 'output/manifest.json';

const _createTemporaryDirectory = () => {
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

const _copyPassToTemporaryLocation = () => {
   try {
      fse.copySync(SAMPLE_PASS, OUTPUT_PASS, { overwrite: true });
   } catch (error) {
      // log system here
   }
}

const _cleanDSStoreFiles = () => {
   try {
      [DS_STORE_FILE, SIGNATURE_FILE, MANIFEST_FILE].map(f => {
         fs.rmSync(f, { recursive: false, force: true });
      });
   } catch (error) {
      
   }
}

const _buildPassFormat = () => {
   const passFormat = {
      passTypeIdentifier: 'pass.com.jacm.pasedeprueba',
      webServiceURL: 'http://propane.apple.com:4567/',
      formatVersion: 1,
      relevantDate: '2011-12-08T13:00-08:00',
      teamIdentifier: 'SDKQATEAM1',
      authenticationToken: '30c4cb4ba863fa9d7687959d8fbc6f0c',
      description: 'Boarding pass with sha 1',
   }
   // write in the output folder;
   return passFormat;
}

const _generateJSONManifest = async () => {
   try {

      const files = await readdir(OUTPUT_PASS);

      const manifest = {};

      for (const file of files) {
         const filePath = path.join(OUTPUT_PASS, file);
         const fileBuffer = await readFile(filePath);
         const hash = await hasha(fileBuffer, {algorithm: 'sha1'});
         manifest[file] = hash;
      }

      const jsonContent = JSON.stringify(manifest, null, 3); // Pretty print with 3 spaces indentation

      const manifestFilePath = path.join(OUTPUT_PASS, 'manifest.json');
      await writeFile(manifestFilePath, jsonContent);

      console.log('Manifest JSON created :D');

   } catch (e) {
      console.error('Error generating JSON manifest:', e);
   }
};

const config = {
   appleWWDRCACertificatePath: '/Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/pass2.cer',
   passCertificatePath: '/Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/passSigner2.p12',
   passCertificateKeyPath: '/Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/privateKey.pem',
   manifestFilePath: '/Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/output/manifest.json',
   signatureFilePath: '/Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/output/signature',
   certificatePassword: 'Test@123'
};

const _signJSONManifest = async () => {
   try {
      const command = `openssl smime -binary -sign -certfile ${config.appleWWDRCACertificatePath}` +
                  `-signer ${config.passCertificatePath}` +
                  `-inkey ${config.passCertificateKeyPath}` +
                  `-in ${manifestFilePath} ` +
                  `-out ${signatureFilePath} ` + 
                  `-outform DE` +
                  `-passin pass:${config.certificatePassword}`;

/*       const command = `openssl smime -binary -sign -certfile /Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/AppleWWDRCAG4.cer \
   -signer /Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/PassSigner.p12 \
   -inkey /Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/certificates/privateKey.pem \
   -in /Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/output/manifest.json \
   -out /Users/lissette.vasquez/Projects/PKPASS/pkpass-generator/output/signature \
   -outform DER -passin pass:Test@123` */

   await execPromise(command);

   console.log('Manifest JSON signed successfully');
   } catch (error) {
      console.log('Error signing json manifest :(', error)
   }
}

const execPromise = (command) => {
   return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
         if (error) {
            console.log('error in promise', error);
         }
         resolve(stdout.trim());
         console.log('exec promise ok! :D')
      });
   });
};

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