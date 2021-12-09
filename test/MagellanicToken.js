const MagellanicToken = artifacts.require("../contracts/MagellanicToken.sol");
const assert = require("assert");

contract("MagellanicToken", function (accounts) {
  it("sets totalSupply on deployment", async () => {
    const instance = await MagellanicToken.deployed();
    const totalSupply = await instance.totalSupply();
    assert.equal(totalSupply.toNumber(), "1000000");
  });

  it("it allocates the initial supply to the admin account", async () => {
    const instance = await MagellanicToken.deployed();
    const adminBalance = await instance.balanceOf(accounts[0]);
    assert.equal(adminBalance.toNumber(), "1000000");
  });

  it("it sets the name and symbol correctly", async () => {
    const instance = await MagellanicToken.deployed();
    const name = await instance.name();
    const symbol = await instance.symbol();
    const standard = await instance.standard();
    assert.equal(name, "Magellanic");
    assert.equal(symbol, "MGL");
    assert.equal(standard, "Magellanic v1.0");
  });

  it("it transfers ownership of tokens", async () => {
    const success = false;
    try {
      const instance = await MagellanicToken.deployed();
      const adminBalance = await instance.transfer.call(
        accounts[1],
        9999999999
      );
      success = true;
    } catch (error) {
      assert.equal(success, false);
    }

    const instance = await MagellanicToken.deployed();
    const receipt = await instance.transfer(accounts[1], 250000, {
      from: accounts[0],
    });
    const balanceRec = await instance.balanceOf(accounts[1]);
    const balanceSen = await instance.balanceOf(accounts[0]);
    assert.equal(balanceRec, "250000");
    assert.equal(balanceSen, "750000");

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      'should be the "Transfer" event'
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      "logs the account the tokens are transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      "logs the account the tokens are transferred to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      250000,
      "logs the transfer amount"
    );

    const funcCall=await instance.transfer.call(
        accounts[1],
        250000
      );
    assert.equal(funcCall,true);  
  });

  it('approves tokens for delegated transfer',async()=>{
    const instance = await MagellanicToken.deployed();
    const approveCall = await instance.approve.call(accounts[1],100);
    assert.equal(approveCall, true);

    const receipt = await instance.approve(accounts[1],100);
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      'should be the "Approve" event'
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "logs the owner"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "logs the spender"
    );
    assert.equal(
      receipt.logs[0].args._value,
      100,
      "logs the value"
    );

    const allowance=await instance.allowance(accounts[0],accounts[1]);
    assert.equal(allowance,100);

  });

  it('handles delegated token transfer',async()=>{
    const instance = await MagellanicToken.deployed();
    const fromAccount=accounts[2];
    const toAccount=accounts[3];
    const spendingAccount=accounts[4];

    const send=await instance.transfer(fromAccount,100,{from:accounts[0]});

    const approve=await instance.approve(spendingAccount,10,{from:fromAccount});

    //try sending more tokens than spneding account has
    let success=false;
    try{
      await instance.transferFrom(fromAccount,toAccount,1000,{from:spendingAccount});
      success=true;
    }catch(err){
      assert.equal(success,false);
    } 
    assert.equal(success,false);

    //try sending more than the owner has approved
    let success2=false;
    try{
      await instance.transferFrom(fromAccount,toAccount,20,{from:spendingAccount});
      success2=true;
    }catch(err){
      assert.equal(success2,false);
    } 
    assert.equal(success2,false);

    //--------------------
    const done=await instance.transferFrom.call(fromAccount,toAccount,10,{from:spendingAccount});
    assert.equal(done,true);

    //---------------------
    const receipt=await instance.transferFrom(fromAccount,toAccount,10,{from:spendingAccount});
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      'should be the "Transfer" event'
    );
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      "logs the account the tokens are transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "logs the account the tokens are transferred to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      10,
      "logs the transfer amount"
    );

    const balance= await instance.balanceOf(fromAccount);
    assert.equal(balance,90);

    const balanceTo=await instance.balanceOf(toAccount);
    assert.equal(balanceTo,10);

    const allowance=await instance.allowance(fromAccount,spendingAccount);
    assert.equal(allowance,0);

  });
});
