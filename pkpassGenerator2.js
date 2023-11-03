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
	doSomethingWithTheError(err);
}