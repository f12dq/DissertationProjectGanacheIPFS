# DissertationProjectGanacheIPFS
BLOCKCHAIN BASED SECURE SYSTEM FOR SHARING DATA ON THE OFF CHAIN
FULL PROJECT
GANACHE INSTALLER
IPFS INSTALLER
Some project files may have been changed due to SPRINTS and changing deliverables but the process of testing remains the same.
Now after ganache installation chose a new workspace name and from my FULL PROJECT  input the truffle-config.js so it would set up the project into the environment.
You may need to install these :
npm install ipfs-http-client@46.0.0
npm install web3@1.5.3

NOW deploy the contracts which are already built from my project into your Ganache environment with this line in your terminal : 
1.	Compile the project : truffle compile
2.	Migrate to ganache environment the data storage smart contract : truffle migrate --network ganache
DOING this so right in the ganache contracts you should see this : 
 
YOUR IPFS dapp should say this : 
 
CONNECTED AND gateway, api settings.
In the project I used them here: 
 
FROM ABOVE the web3ProviderUrl is the ganache environment http address and the ipfsHost is the ipfs server.
THE CONTRACT ADRESS SHOUL YOU FIND IN GANACHE, CONTRACT DEPLOYED DATA STORAGE ADRESS.
NOWyou want to safely share your data in the ipfs decentralized storage running upload_file.js
 
Ensure that you write correct name of the file and the file path.
The result should look like this :
 
You will get a transaction hash for your contract, which you will fiind it here :
 
Then YOU CLICK on the contract and YOU will see the unique CID from ipfs server cloud, like this :
 
So you are the owner of this smart contract, having the unique hash transaction with the store CID location of you file.
NOW YOU WANT TO RETRIEVE YOUR ORIGINAL FILE.
You need to run the retrieve_file.js but before copy the CID from the transaction above and paste it into the retrieve_file.js like here:
 
DOING these RUN THE FILE.
The successful output should look like this :
 
It would output your original content within the file you uploaded.
HAPPY TESTING.
