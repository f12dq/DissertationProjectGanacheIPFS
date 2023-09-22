const fs = require('fs');
const IPFS = require('ipfs-http-client');
const Web3 = require('web3');
const crypto = require('crypto');
const contractABI = require('./DataStorage.json').abi;
const contractAddress = '0x176656B8c97Aa727CB9ee2bc54335c9A36DB33B7';

const web3ProviderUrl = 'http://127.0.0.1:7545';
const ipfsHost = 'http://127.0.0.1:5001/ip4/127.0.0.1/tcp/5001';

const web3 = new Web3(web3ProviderUrl);
const contract = new web3.eth.Contract(contractABI, contractAddress);
const ipfs = IPFS({ host: ipfsHost, port: '5001', protocol: 'http' });

class Retrieve {
  constructor(cid, password) {
    this.cid = cid;
    this.password = password;
    this.fileContent = null;
  }

  async retrieveFromIPFS() {
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(this.cid)) {
        chunks.push(chunk);
      }
      this.fileContent = Buffer.concat(chunks);
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      throw error;
    }
  }

  async saveDecryptedToFile(filePath) {
    try {
      const iv = this.fileContent.slice(0, 16);
      const encryptedData = this.fileContent.slice(16);
      const key = await this.deriveKeyFromHash(this.password);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

      fs.writeFileSync(filePath, decryptedData);
      console.log(`File saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving decrypted file:', error);
      throw error;
    }
  }

  async deriveKeyFromHash(hash) {
    try {
      const salt = Buffer.from('6fe56f12e9a093c0962a52958909abdf', 'hex');
      const iterations = 100000;
      const keyLength = 32;
      const derivedKey = crypto.pbkdf2Sync(hash, salt, iterations, keyLength, 'sha256');
      return derivedKey;
    } catch (error) {
      console.error('Error deriving key from hash:', error);
      throw error;
    }
  }
}

(async () => {
  try {
    const cid = 'QmYmxumSgKSWeJBJKBpAJdLzrj6dK5WdQiFXJDeJJ6gA2d'; // Replace with actual CID
    const password = web3.utils.sha3('ExpertMACD.ex5'); // Replace with password used during uploading
    const filePath = 'downloaded_file3.ex5'; // Set desired file name and extension

    const fileRetrieve = new Retrieve(cid, password);

    await fileRetrieve.retrieveFromIPFS();
    await fileRetrieve.saveDecryptedToFile(filePath);
  } catch (error) {
    console.error('Error:', error);
  }
})();
