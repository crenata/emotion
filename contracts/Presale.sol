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
     * @param _amountPrimary Amount of primary.
     * @param _amountToken Amount of token.
     * @param _timestamp Block timestamp.
     */
    event Buy(address indexed _buyer, uint256 _amountPrimary, uint256 _amountToken, uint256 _timestamp);

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
        require(_msgValue() == (_numberOfTokens.div(1e18)).mul(tokenPrice), "Value is not equal token value.");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, "Token value is greater than presale contract balance.");
        require(tokenContract.transfer(_msgSender(), _numberOfTokens), "Failed transfer token to sender.");
        tokensSold += _numberOfTokens;
        emit Buy(_msgSender(), _msgValue(), _numberOfTokens, block.timestamp);
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
