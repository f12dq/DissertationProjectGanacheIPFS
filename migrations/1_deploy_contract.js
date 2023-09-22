const MyContract = artifacts.require("DataStorage");

module.exports = function (deployer) {
  deployer.deploy(MyContract);
};
