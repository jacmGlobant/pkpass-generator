# pkpass-generator
Project to create a pass file formatted for apple-wallet

## Process to create certificates

The way to create the certificates for sign the pass is the following:

1. To have a developer account access
2. Get the team identifier
3. Register a pass identifier, example: pass.com.hardrock.loyaltycard
4. Create the credential for the pass identifier
5. Download the certificate for the pass identifier 
6. Download the apple authority distribution certificate (WWDR) type G4

Once the certificates is downloaded in some folder in the machine is neccesary export to pem (pkcs12)

These are the most common commands to manage certificates:

```bash
# get information form certificate (.cer)
openssl x509 -inform DER -in pass.cer -noout -text

# extract pem certificate signer 
$ openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signerCert.pem -passin pass:12345 -info -legacy

# extract private key
$ openssl pkcs12 -in pass.p12 -nocerts -out signerKey.pem -passin pass:12345 -passout pass:12345 -info -legacy


# verify signature
$ cd output/pass
$ openssl smime -verify -in signature -content manifest.json -inform der -noverify
```

## Flow to create pkpass (manual)

The process to be followed to generate a pkpass is as follows:

1. **Create a temporary directory:**  
   A function is created in order to make sure that there is a clean and empty directory ready to store files temporarily.

2. **Copy pass to Temporary Location:**  
   A function is created in order to safely copy the contents of one directory to another (our temporary directory), overwriting the files in the destination if they already exist.

3. **Clean DSStore:**  
   A function is created with the objective of deleting from three specified files (DS_STORE_FILE, SIGNATURE_FILE, MANIFEST_FILE).

4. **Generate JSONManifest:**  
   A function is created with the objective of generating a manifest.json file containing a list of files along with their respective SHA-1 checksums (hashes).

5. **Sign JSON Manifest:**  
   A function is created in order to digitally sign a JSON file, specifically a "manifest", using the openssl tool. This is done to ensure the authenticity and integrity of the manifest file.

6. **Compress pass file:**  
   A function is created to compress a set of files into a .pkpass file using the zip command. 


## Flow to create pkpass with passkit-generator

Alexander Cerutti has developed a library that offers a user-friendly approach, simplifying the entire process of generating the pkpass file. The advantage of this library lies in its minimal lines of code required for implementation. However, a limitation is that it relies entirely on NodeJS

The library repository:
https://github.com/alexandercerutti/passkit-generator

And in this project we are the example to use and working very well!

See the file pkpassgenerator2.js

The way to execute is:

```bash
$ node pkPassGenerator2.js
```

With this command the file pkasss 'pass.pkpass' will be generated in the 'output' folder

Using this command will generate the 'pass.pkpass' file in the 'output' folder. The code is straightforward, and the key aspect here is correctly passing the required certificates to the configuration structure:

```bash
const fs = require('fs');
const { PKPass } = require("passkit-generator");


try {
   (async () => {
         const pass = await PKPass.from({
            model: "./passes/sample",
            certificates: {
               wwdr: fs.readFileSync('./certificates/WWDRG4.pem'),
               signerCert: fs.readFileSync('./certificates/signerCert.pem'),
               signerKey: fs.readFileSync('./certificates/signerKey.pem'),
               signerKeyPassphrase: '12345'
            },
         }, {
            serialNumber: "AAGH44625236dddaffbda"
         });
         pass.setBarcodes("36478105430"); // Random value
         const buffer = pass.getAsBuffer();
         fs.writeFileSync('output/pass.pkpass', buffer);
   })();
} catch (err) {
	console.log(err);
}
```

The pass structure should be define in the folder '/passes/sample' like is in the example
and the other parameters: serialNuber, and the barcode definition


## How debug a pass with simulator (Juan)


## Python Code (Juan)


## PkPass implementationin JAVA
