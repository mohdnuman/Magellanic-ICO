pragma solidity >=0.4.20;

import "./MagellanicToken.sol";

contract MagellanictokenSale{
    address admin;
    MagellanicToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    
    event Sell(
        address indexed _buyer,
        uint256 indexed _amount
    );

    constructor(MagellanicToken _contract,uint256 _tokenPrice) public{
        admin=msg.sender;
        tokenContract=_contract;
        tokenPrice=_tokenPrice;
    }

    //multiply function
    function multiply(uint256 a, uint256 b) internal pure returns(uint c){
        require(b==0 || (c=a*b)/b==a );
    }

    //buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable{
        require(msg.value==multiply(_numberOfTokens,tokenPrice));
        require(tokenContract.balanceOf(address(this))>=_numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokenSold+=_numberOfTokens;

        emit Sell(msg.sender,_numberOfTokens);      
    }

    //End sale
    function endSale() public {
        require(msg.sender==admin);
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));

        address payable wallet = address(uint160(admin));
        selfdestruct(wallet);
        //tranferring remaining tokens to admin
        //destroy contract

    }
}