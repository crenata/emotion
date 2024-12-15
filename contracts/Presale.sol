pragma solidity ^0.5.16;

import "./Context.sol";
import "./IERC20.sol";
import "./IPresale.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract Presale is Context, IPresale, Ownable {
    using SafeMath for uint256;

    address payable ownerAddress;

    IERC20 private _token;
    uint256 private _tokenPrice;
    uint256 private _tokensSold;

    /**
     * @param token_ Token contract address.
     * @param tokenPrice_ Initial token price.
     */
    constructor(address token_, uint256 tokenPrice_) public {
        ownerAddress = _msgSender();
        _token = IERC20(token_);
        _tokenPrice = tokenPrice_;
    }

    /**
     * @dev Returns the erc token address.
     */
    function token() external view returns(IERC20) {
        return _token;
    }

    /**
     * @dev Returns the token price.
     */
    function tokenPrice() external view returns(uint256) {
        return _tokenPrice;
    }

    /**
     * @dev Returns the tokens sold.
     */
    function tokensSold() external view returns(uint256) {
        return _tokensSold;
    }

    /**
     * @dev Transfers tokens bought by buyer.
     *
     * @param amount Amount of token to buy.
     */
    function buyTokens(uint256 amount) external payable returns(bool) {
        _buyTokens(amount);
        return true;
    }

    /**
     * @dev End the presale.
     */
    function endSale() external onlyOwner returns(bool) {
        _endSale();
        return true;
    }

    /**
     * @dev Transfers tokens bought by buyer.
     *
     * @param amount Amount of token to buy.
     */
    function _buyTokens(uint256 amount) internal {
        require(_msgValue() == (amount.div(1e18)).mul(_tokenPrice), "Presale: Value is not equal token value.");
        require(_token.balanceOf(address(this)) >= amount, "Presale: Token value is greater than presale contract balance.");
        require(_token.transfer(_msgSender(), amount), "Presale: Failed transfer token to sender.");
        _tokensSold = _tokensSold.add(amount);
        emit Buy(_msgSender(), _msgValue(), amount, block.timestamp);
    }

    /**
     * @dev End the presale.
     */
    function _endSale() internal onlyOwner {
        uint256 amount = _token.balanceOf(address(this));
        if (amount > 0) require(_token.transfer(ownerAddress, amount), "Presale: Failed transfer token to owner.");
        emit End(ownerAddress, address(this).balance, amount, block.timestamp);
        selfdestruct(ownerAddress);
    }
}
