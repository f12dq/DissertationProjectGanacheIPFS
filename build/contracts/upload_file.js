const fs = require('fs');
const Web3 = require('web3');
const IPFS = require('ipfs-http-client');
const contractABI = require('./DataStorage.json').abi;
const contractAddress = '0x176656B8c97Aa727CB9ee2bc54335c9A36DB33B7';

const web3ProviderUrl = 'http://127.0.0.1:7545';
const ipfsHost = 'http://127.0.0.1:5001/ip4/127.0.0.1/tcp/5001';

const web3 = new Web3(web3ProviderUrl);
const contract = new web3.eth.Contract(contractABI, contractAddress);
const ipfs = IPFS({ host: ipfsHost, port: '5001', protocol: 'http' }); // Change 'https' to 'http'

const crypto = require('crypto');

class Upload {
  constructor(name, filePath) {
    this.name = name;
    this.filePath = filePath;
    this.cid = null;
  }

  async deriveKeyFromHash(hash) {
    try {
      // Use PBKDF2 to derive a 256-bit (32 bytes) key from the transaction hash
      const salt = crypto.randomBytes(16); // Generate a random salt
      console.log('Salt:', salt.toString('hex')); // Display the salt in the console
      const iterations = 100000; // Choose an appropriate number of iterations
      const keyLength = 32;
      const derivedKey = crypto.pbkdf2Sync(hash, salt, iterations, keyLength, 'sha256');
      return derivedKey;
    } catch (error) {
      console.error('Error deriving key from hash:', error);
      throw error;
    }
  }

  async encryptFile(password) {
    try {
      const fileContent = fs.readFileSync(this.filePath);
      const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV)
      const key = await this.deriveKeyFromHash(password);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      const encryptedData = Buffer.concat([cipher.update(fileContent), cipher.final()]);
      const encryptedFile = Buffer.concat([iv, encryptedData]);
      return encryptedFile;
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw error;
    }
  }

  async uploadToIPFS() {
    try {
      const password = web3.utils.sha3(this.name); // Using the transaction hash as the password
      const encryptedFile = await this.encryptFile(password);
      const ipfsResponse = await ipfs.add(encryptedFile);
      this.cid = ipfsResponse.cid.toString();
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  async uploadToSmartContract() {
    try {
      if (!this.cid) {
        throw new Error('File content not uploaded to IPFS');
      }

      const accounts = await web3.eth.getAccounts();
      const encodedData = contract.methods.storeData(this.name, this.cid).encodeABI();

      const transactionReceipt = await web3.eth.sendTransaction({
        from: accounts[0],
        to: contractAddress,
        data: encodedData,
        gas: 6721975, // Adjust the gas limit as needed
      });

      console.log(`File "${this.name}" uploaded successfully. Transaction hash: ${transactionReceipt.transactionHash}`);
    } catch (error) {
      console.error('Error uploading to smart contract:', error);
      throw error;
    }
  }
}

(async () => {
  try {
    const name = 'ExpertMACD.ex5'; // Provide the name of the file
    const filePath = './build/contracts/ExpertMACD.ex5'; // Provide the correct file path

    const fileUpload = new Upload(name, filePath);

    await fileUpload.uploadToIPFS();
    await fileUpload.uploadToSmartContract();
  } catch (error) {
    console.error('Error:', error);
  }
})();
