const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const hasha = require('hasha');
const { exec } = require('child_process');
const util = require('util');
const archiver = require('archiver');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

const SAMPLE_PASS_DIR = path.resolve('passes/sample.pass');
const OUTPUT_PASS_DIR = path.resolve('output/pass');

// main files
const DS_STORE_FILE = path.resolve('output/.DS_Store');      // files created by macosx these should be cleaned
const SIGNATURE_FILE = path.resolve('output/signature') 
const MANIFEST_FILE = path.resolve('output/manifest.json');


const config = {
   appleWWDRCACertificatePath: path.resolve('certificates/WWDRG4.pem'),   // Apple authority certificate (it should be extract from the .cer see README.md)
   passCertificatePath: path.resolve('certificates/signerCert.pem'),      // Certificate to sign
   passCertificateKeyPath: path.resolve('certificates/signerKey.pem'),    // Private key from the certificate (it should be extract from p12 with SSL see README.md)
   manifestFilePath: path.resolve('output/pass/manifest.json'),           // The path of the manifest, that represent the list of each file with the content as sha1
   signatureFilePath: path.resolve('output/pass/signature'),              // The signing of the pass path
   certificatePassword: '12345'
};

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

// is supposed that this method should be create the pass.json 
// with the user data and the design of the loyalty card

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

   const outputFile = path.resolve('output', 'pass.pkpass');

   //Create an output file stream
   const output = fs.createWriteStream(outputFile);
   
   const archive = archiver('zip', {
     zlib: { level: 9 } // level of compression
   });

   archive.on('error', (err) => {
      console.log('Ops, something was wrong!', err);
   });

   archive.pipe(output);

   // Add 'pass' to the zip file
   archive.directory((OUTPUT_PASS_DIR), false);

   archive.finalize();

   console.log('File pkpass created succesfully!');
};

const signPass = async () => {
   await _createTemporaryDirectory();
   await _copyPassToTemporaryLocation();
   await _cleanDSStoreFiles();

   // This method should be update the pass with 
   // the custom design and the the user data of 
   // the loyalty card
   
   // await _buildPassFormat();

   await _generateJSONManifest();
   await _signJSONManifest();
   await _compressPassFile();
}

module.exports = signPass;