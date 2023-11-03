# pkpass-generator
Project to create a pass file formatted for apple-wallet


## Process to create certificates (Juan)


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


## How debug a pass with simulator (Juan)


## Python Code (Juan)
