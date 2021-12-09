pragma solidity >=0.4.20;

contract MagellanicToken{
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    string public name="Magellanic";
    string public symbol="MGL";
    string public standard="Magellanic v1.0";    //is not included in erc20 standard
    mapping(address=>mapping(address=>uint)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 indexed _value
    );

    constructor(uint256 _total) public{
        totalSupply=_total;
        //allocate the initial supply
        balanceOf[msg.sender]=totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender]>=_value);

        balanceOf[msg.sender]=balanceOf[msg.sender]-_value;
        balanceOf[_to]=balanceOf[_to]+_value;

        emit Transfer(msg.sender,_to,_value);

        return true;
    }
    

    
    //approve
    function approve(address _spender,uint256 _value) public returns(bool success){
        //allowance
        allowance[msg.sender][_spender]=_value;
        //approve event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(balanceOf[_from]>=_value);
        require(allowance[_from][msg.sender]>=_value);

        balanceOf[_from]-=_value;
        balanceOf[_to]+=_value;

        allowance[_from][msg.sender]-=_value;

        emit Transfer(_from, _to, _value);

        return true;
    }



}