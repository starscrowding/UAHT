// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UAHT is ERC20 {
    address operator;

    event Input(address to, uint256 value); 
    event Output(address from, uint256 value); 

    constructor() ERC20("uaht.io", "UAHT") {
        operator = msg.sender;
    }

    modifier operable {
        require(msg.sender == operator);
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return 2; // kopiyka 
    }

    function input(address to, uint256 uah) public operable {
        _mint(to, uah); 
        emit Input(to, uah);
    }

    function output(address from, uint256 uah) public operable {
        _burn(from, uah);
        emit Output(from, uah);
    }

    function delegate(address to, bool confirm) public operable {
        require(confirm);
        operator = to;
    }
}