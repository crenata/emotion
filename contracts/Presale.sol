pragma solidity ^0.5.16;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./BEP20Token.sol";

contract Presale is Context, Ownable {
    using SafeMath for uint256;

    address payable ownerAddress;
    BEP20Token public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    /**
     * @param _buyer Buyer's address.
     * @param _amount Amount of token.
     */
    event Sell(address indexed _buyer, uint256 _amount);

    /**
     * @param _tokenContract Token contract address.
     * @param _tokenPrice Initial token price.
     */
    constructor(BEP20Token _tokenContract, uint256 _tokenPrice) public {
        ownerAddress = _msgSender();
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    /**
     * @param _numberOfTokens Token amount.
     */
    function buyTokens(uint256 _numberOfTokens) public payable {
        uint256 inWei = _numberOfTokens.mul(1e18);
        require(_msgValue() == _numberOfTokens.mul(tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= inWei);
        require(tokenContract.transfer(_msgSender(), inWei));
        tokensSold += _numberOfTokens;
        emit Sell(_msgSender(), _numberOfTokens);
    }

    /**
     * @dev Ends sale the token sale period.
     */
    function endSale() public onlyOwner {
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        if (contractBalance > 0) require(tokenContract.transfer(ownerAddress, contractBalance));
        selfdestruct(ownerAddress);
    }
}
