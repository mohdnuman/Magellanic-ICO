var SimpleStorage = artifacts.require("./SimpleStorage.sol");
const MagellanicToken = artifacts.require('../contracts/MagellanicToken.sol');
const MagellanicTokenSale = artifacts.require('../contracts/MagellanicTokenSale.sol');

module.exports = async function(deployer) {
  deployer.deploy(SimpleStorage);
  await deployer.deploy(MagellanicToken,1000000);
  var price=1000000000000000;
  await deployer.deploy(MagellanicTokenSale,MagellanicToken.address,price);
};
