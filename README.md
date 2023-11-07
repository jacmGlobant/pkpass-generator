# pkpass-generator
Project to create a formatted pass file for apple-wallet

The purpose of this repository is to describe the steps necessary to create the pkpass file
file as it is essential to implement apple-wallet.

The first step is to obtain the certificates to be able to sign the pass, the pass is how
Apple sees any digital document on the apple-wallet

1. [Process to create the certificates](#process-to-create-certificates)
2. [Flow to create the pkpass (custom implementation)](#flow-to-create-pkpass-see-the-source-code-pkpassgeneratorjs)
3. [Use of NodeJS community library (passkit-generator)](#flow-to-create-pkpass-with-passkit-generator-see-the-source-code-pkpassgenerator2js)
4. [Python implementation (is old code but the foundation to create the pkpass)](#python-code-see-in-the-folder-python-make_passbookpy-code-of-david-schuetz)
5. [Alternatives with Java language](#pkpass-implementation-in-java)
6. [How debug a pkpass](#how-debug-a-pass-with-simulator)


## Process to create certificates

The way to create the certificates for sign the pass is the following:

1. To have a developer account access
2. Get the team identifier
3. Register a pass identifier, example: pass.com.hardrock.loyaltycard
4. Create the credential for the pass identifier
5. Download the certificate for the pass identifier 
6. Download the apple authority distribution certificate (WWDR) type G4
7. Last but not least, the machine that will perform the signature must have the certificate in the Apple keychain.

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

In the apple documentation there are all step to get the certicates:

- [Apple Pass identifiers and certificates](https://developer.apple.com/help/account/configure-app-capabilities/create-wallet-identifiers-and-certificates)


## Flow to create pkpass (see the source code pkpassGenerator.js)

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


All steps to create the pkpass file is in: https://developer.apple.com/documentation/walletpasses/building_a_pass


## Flow to create pkpass with passkit-generator (see the source code pkpassGenerator2.js)

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

This video explains the implementation of the passkit-generator library: https://www.youtube.com/watch?v=rJZdPoXHtzI
and has a good explanation on how to generate certificates visually


## How debug a pass with simulator

To debugg a pass with a simulator, we need to consider the next steps:

1. **Ensure Proper Environment:**
   - Install the latest version of Xcode on your Mac, which comes with the iOS somulator.
   - Make sure you have the latest operating system version on your simulator to avoid compatibility issues.
2. **Verify the pkpass File:**
   - Ensure the pkpass file is correctly signed and that all required images and fields are present and valid. You can use OpenSSL to verify the signature of a pkpass file.
3. **Check console logs:**
   - If there are issues adding the pass, you'll need to check the simulator's console logs for more information on the errors.
   - Open the "Console" app on your Mac and select the simulator you're working with to view its logs.
4. **Check common aspects:**
   - Ensure the pass has a valid organization identifier and a valid development team.
   - Ensure the expiration date (if present) is correct.
   - Verify that the certificate information and manifest match and are valid.
   - Check for typos or formatting issues in the pkpass file's JSON.
   - For more information, you can visit https://developer.apple.com/documentation/walletpasses/building_a_pass

## Python Code (see in the folder python make_passbook.py code of David Schuetz)

1. **Load supporting files, hash 'em and build up manifest** 
   The code reads files from a list, decodes them to text, computes and stores their SHA-1 hashes encoded in UTF-16, and builds a text-format manifest with the filenames and their hashes.

2. **Write the manifest to manifest.json**
   The function opens a file named 'manifest.json' in write mode, writes the content of the manifest variable into it, and then closes the file.

3. **Digital Signature Creation with OpenSSL**
   The function builds and executes an OpenSSL command to digitally sign manifest.json using specified certificate and key files, then saves the signature in DER format, with the password provided for key access.

4. **Add manifest and signature to the list of files**
   The function reads the binary content of 'manifest.json' and 'signature', attempts to decode it to text, stores it, and computes their SHA-1 hashes in UTF-8 encoding.

5. **Put all files in a zip file**
   The function creates an in-memory ZIP archive and adds files to it using their names and contents from file_data.

6. **Write the zip file to pass.pkpass**
   The function writes the in-memory ZIP archive data to a file named 'pass.pkpass', effectively creating or updating it on the disk.

[See more from the code courtesy of David Schuetz](https://gist.github.com/phoikoi/797be3a230959caa3039769bc7d4dba2)

## PkPass implementation in JAVA

With java there are two implementation in the internet:

1. [Create Rest API to download Apple wallet (.pkpass) file using Spring, Java](https://mumzee.medium.com/create-rest-api-to-download-apple-wallet-pkpass-file-using-spring-java-bd66e4eb8f3e)
2. [(Java) Sign Manifest File to Generate a Passbook .pkpass file](https://example-code.com/java/passbook_signature_pkpass.asp)

As you can see, it follows essentially the same steps as the other methods, and we need to adhere to Apple's specifications.