module.exports = {
  compilers: {
    solc: {
      version: "0.8.0", // Specify the Solidity version you want to use
    },
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Ganache port
      network_id: 5777, // Match any network id
      gas: 6721975, // Specify the gas limit for contract deployment
    },
  },
};
