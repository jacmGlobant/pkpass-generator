/** 
 *  pass identifier: pass.com.jacm.pasedeprueba
 *  system call to zip utility for compresion: zip -r => for zip
 *  hasha library to create the manifest.json (sha1 hexadecimal)
 *  For sign in: openssl smime -binary -sign -certfile ${config.appleWWDRCACertificatePath} -signer ${config.passCertificatePath} -inkey ${config.passCertificateKeyPath} -in ${tempPassFolder}/manifest.json -out ${tempPassFolder}/signature -outform DER -passin pass:${config.certificatePassword}
 *  PassSigner => password: Test@123
*/

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const hasha = require('hasha');
const { exec } = require('child_process');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

const SAMPLE_PASS_DIR = path.resolve('passes/sample');
const OUTPUT_PASS_DIR = path.resolve('output/pass');

const DS_STORE_FILE = path.resolve('output/.DS_Store');
const SIGNATURE_FILE = path.resolve('output/signature') 
const MANIFEST_FILE = path.resolve('output/manifest.json');

const _createTemporaryDirectory = () => {
   try {
      if (fs.existsSync(OUTPUT_PASS_DIR)) {
         fs.rmSync(OUTPUT_PASS_DIR, { recursive: true, force: true });
      } 
      fs.mkdirSync(OUTPUT_PASS_DIR);
   } catch (error) {
      // log system here
   } 
}

const _copyPassToTemporaryLocation = () => {
   try {
      fse.copySync(SAMPLE_PASS_DIR, OUTPUT_PASS_DIR, { overwrite: true });
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

      const files = await readdir(OUTPUT_PASS_DIR);

      const manifest = {};

      for (const file of files) {
         const filePath = path.join(OUTPUT_PASS_DIR, file);
         const fileBuffer = await readFile(filePath);
         const hash = await hasha(fileBuffer, {algorithm: 'sha1'});
         manifest[file] = hash;
      }

      const jsonContent = JSON.stringify(manifest, null, 3); // Pretty print with 3 spaces indentation

      const manifestFilePath = path.join(OUTPUT_PASS_DIR, 'manifest.json');
      await writeFile(manifestFilePath, jsonContent);

      console.log('Manifest JSON created :D');

   } catch (e) {
      console.error('Error generating JSON manifest:', e);
   }
};

const config = {
   appleWWDRCACertificatePath: path.resolve('certificates/WWDRG4.pem'),
   passCertificatePath: path.resolve('certificates/signerCert.pem'),
   passCertificateKeyPath: path.resolve('certificates/signerKey.pem'),
   manifestFilePath: path.resolve('output/pass/manifest.json'),
   signatureFilePath: path.resolve('output/pass/signature'),
   certificatePassword: '12345'
};

const _signJSONManifest = async () => {
   try {
      const command = `openssl smime -binary \
                        -sign -certfile ${config.appleWWDRCACertificatePath} \
                        -signer ${config.passCertificatePath} \
                        -inkey ${config.passCertificateKeyPath} \
                        -in ${config.manifestFilePath} \
                        -out ${config.signatureFilePath} \
                        -outform DER -passin pass:${config.certificatePassword}`;

   await execPromise(command);
   console.log('Manifest JSON signed successfully');
   } catch (error) {
      console.log('Error signing json manifest :(', error)
   }
}

const execPromise = (command) => {
   return new Promise((resolve, _) => {
      exec(command, (error, stdout, _) => {
         if (error) {
            console.log('error in promise', error);
         }
         resolve(stdout.trim());
         console.log('exec promise ok! :D')
      });
   });
};

const _compressPassFile = async () => {
   process.chdir('output');
   const CMD = `zip -r pass.pkpass pass`;
   exec(CMD, (err, stdout, _) => {
      if (err) {
        console.log('Ups, something was wrong!')
      }
      console.log(stdout);
   });
   console.log('> _compressPassFile called');
}

const signPass = async () => {
   await _createTemporaryDirectory();
   await _copyPassToTemporaryLocation();
   await _cleanDSStoreFiles();
   // await _buildPassFormat();
   await _generateJSONManifest();
   await _signJSONManifest();
   await _compressPassFile();
}

module.exports = signPass;