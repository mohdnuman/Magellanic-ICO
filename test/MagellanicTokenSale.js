const MagellanicTokenSale = artifacts.require(
  "../contracts/MagellanicTokenSale.sol"
);
const MagellanicToken = artifacts.require("../contracts/MagellanicToken.sol");
const assert = require("assert");

contract("MagellanicTokenSale", function (accounts) {
  var price = 1000000000000000;
  var buyer = accounts[1];
  var admin = accounts[0];
  var tokensAvailable = 7500;

  it("initialises contract with the correct values", async () => {
    const instance = await MagellanicTokenSale.deployed();
    const address = await instance.tokenContract();
    const tokenPrice = await instance.tokenPrice();
    assert.notEqual(instance.address, "0x0");
    assert.notEqual(address, "0x0");
    assert.equal(tokenPrice, price);
  });

  it("facilitates token buying", async () => {
    const instance = await MagellanicTokenSale.deployed();
    const tokenInstance = await MagellanicToken.deployed();
    var numberOfTokens = 10;
    var value = numberOfTokens * price;
    //provisioning some tokens
    const tokensTransferred = await tokenInstance.transfer(
      instance.address,
      tokensAvailable,
      { from: admin }
    );
    const receipt = await instance.buyTokens(numberOfTokens, {
      from: buyer,
      value: value,
    });
    const amount = await instance.tokenSold();
    assert.equal(amount.toNumber(), numberOfTokens);

    const instanceBalance = await tokenInstance.balanceOf(instance.address);
    assert.equal(instanceBalance.toNumber(), tokensAvailable - numberOfTokens);
    const buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(buyerBalance.toNumber(), numberOfTokens);

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", 'should be the "Sell" event');
    assert.equal(receipt.logs[0].args._buyer, accounts[1], "logs the buyer");
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "logs the numberOfTokens"
    );

    let done = false;
    try {
      const receipt = await instance.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      });
      done = true;
    } catch (err) {
      assert.equal(done, false);
    }
    assert.equal(done, false);

    //-------------------------------------

    // const instanceBalance=await tokenInstance.balanceOf(instance.address);
    // console.log(instanceBalance.toNumber());
    // assert.equal(instanceBalance.toNumber(),750000);

    //trying to buy more tokens than what is available with the contract
    // const transReceipt=await instance.buyTokens(700000,{from:buyer,value:700000*price});
    var transferred = false;
    try {
      const transReceipt = await instance.buyTokens(7000000, {
        from: buyer,
        value: 7000000 * price,
      });
      console.log("hello");
      transferred = true;
    } catch (err) {
      assert.equal(transferred, false);
    }
    assert.equal(transferred, false);

    //-----------------------------------------------
  });

  it("ends token sale", async () => {
    const instance = await MagellanicTokenSale.deployed();
    const tokenInstance = await MagellanicToken.deployed();

    //try to end sale from the count other admin
    let done = false;
    try {
      const receipt = await instance.endSale({ from: buyer });
      done = true;
    } catch (err) {
      assert.equal(done, false);
    }
    assert.equal(done, false);

    //try to endSale from admin
    let done2 = true;
    try {
      const receipt = await instance.endSale({ from: admin });
      done2 = true;
    } catch (err) {
      assert.equal(done2, true);
    }
    assert.equal(done2, true);

    //transfers remaing tokens to the admin
    const adminBalance = await tokenInstance.balanceOf(admin);
    assert.equal(adminBalance.toNumber(), 999990);

    //resets the values after contrcat destruction
    let done3 = false;
    try {
      const tokenPrice2 = await instance.tokenPrice();
      done3 = true;
    } catch (err) {
      assert.equal(done3, false);
    }
    assert.equal(done3, false);
  });
});
