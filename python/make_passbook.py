import sys, os.path, hashlib, re
import zipfile
import subprocess
# from StringIO import StringIO
from io import BytesIO

# 
# Passbook Hack
# David Schuetz
# 30 May 2014
# 
# Simple hack that builds a Passbook .pkpass file.
# Requires openssl to perform S/MIME detached signature.
# Requires Apple WWDR CA Cert, and Apple Developer Cert / Key that
#   matches the passbook ID within the pass.json file.
#

#
# 1. Go to provisioning profile, create a new Pass Type ID
# 2. Download genereated pass.cer file and import into Keychain
# 3. Export as Certificates.p12
# 4. Split out key and cert:
#    openssl pkcs12 -in Certificates.p12 -clcerts -nokeys -out passcert.pem
#    openssl pkcs12 -in Certificates.p12 -nocerts -out passkey.pem
# 5. Download Apple WWDR certificate:
#    http://developer.apple.com/certificationauthority/AppleWWDRCA.cer
#    Export from Keychain to wwdr.pem
# 6. Put supporting files in a new folder called "components"
#    logo.png, logo@2x.png, thumbnail.png, thumbnail@2x.png, etc.
#    (see "files" list below)
# 7. Move the .pem files into components
# 8. Create components/pass.json with the contents of the passbook pass
# 9. Run the script. Cross your fingers.
#

# For detailed Passbook documentation, see the official Apple docs:
#   https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/PassKit_PG/Chapters/Introduction.html

#
# to hash the manifest:
#   shasum manifest
# to manually parse the signature:
#   openssl asn1parse -in signature -inform der
#   you should see the shasum in there somewhere (under :messageDigest)
# to manually verify the signature:
#   openssl smime -verify -in signature -content manifest.json -inform der -noverify
#   the "-noverify" means to not verify the entire CA chain, just check the
#      message signature vs the content, using the certs embeeded in signature
#

APP_MEDIA_DIR = './components/'

WWDR_FILENAME = APP_MEDIA_DIR + 'Apple_WWDR.pem'    
PASS_KEY_FILENAME = APP_MEDIA_DIR + 'passkey.pem'  
PASS_CERT_FILENAME = APP_MEDIA_DIR + 'passcert.pem' 

files = ('pass.json', 'logo.png', 'logo@2x.png', 'icon.png', 'icon@2x.png', 
    'thumbnail.png', 'thumbnail@2x.png')


#
# load supporting files, hash 'em, build up manifest
#
file_data = {}
file_hashes = {}
manifest = '{\n'
for file in files:
    f = open(APP_MEDIA_DIR + file, 'rb')
    data = f.read().decode(errors='replace')
    f.close()
    filename = os.path.basename(file)
    file_data[filename] = data
    file_hashes[filename] = hashlib.sha1(data.encode('utf-16')).hexdigest()
    manifest += '   "%s":"%s",\n' % (filename, file_hashes[filename])

manifest += '}\n'

# 
# write the manifest to manifest.json
#
f = open(APP_MEDIA_DIR + 'manifest.json', 'w')
f.write(manifest)
f.close()

#
# sign the manifest, save as a detatched binary DER signature in "signature"
#
cmd = '/usr/bin/openssl smime -sign -signer %s -inkey %s -certfile %s -in %smanifest.json -out %ssignature -outform der -binary -passin pass:12345' % (PASS_CERT_FILENAME, PASS_KEY_FILENAME, WWDR_FILENAME, APP_MEDIA_DIR, APP_MEDIA_DIR )
print(cmd)
subprocess.call(cmd, shell=True)

# 
# add manifest and signature to the list of files
#
for file in ['manifest.json', 'signature']:
    f = open(APP_MEDIA_DIR + file, 'rb')
    data = f.read().decode(errors='replace')
    f.close()
    filename = os.path.basename(file)
    file_data[filename] = data
    file_hashes[filename] = hashlib.sha1(data.encode('utf-8')).hexdigest()


# 
# put all the files into a zip file
#
zipdata = BytesIO()
zip = zipfile.ZipFile(zipdata, 'w')
for filename, data in file_data.items():
    zip.writestr(filename, data)


#
# and write the zip file to pass.pkpass
#
f = open('pass.pkpass', 'wb')
f.write(zipdata.getvalue())
f.close()


