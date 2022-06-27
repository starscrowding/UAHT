// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UAHT is ERC20 {
    address operator;

    address public usdt;
    uint256 public flow;
    uint256 public rate;

    event Input(address from, uint256 value); 
    event Output(address to, uint256 value); 

    mapping (address => uint256) public stake;

    constructor() ERC20("uaht.io", "UAHT") {
        operator = msg.sender;
    }

    modifier operable {
        require(msg.sender == operator);
        _;
    }

    modifier inflow {
        require(msg.value > 0);
        stake[msg.sender] += msg.value;
        emit Input(msg.sender, msg.value);
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return 2; // kopiyka 
    }

    function input() public payable inflow {}

    function pool(address at) public operable {
        usdt = at;
    }

    function delegate(address to, bool confirm) public operable {
        require(confirm);
        operator = to;
    }

    function moderate(uint256 x) public operable {
        rate = x;
    }

    function swap(uint256 uah) virtual public view returns(uint256) {
        return uah * 1 ether / rate;
    }

    function output(uint256 uah, address to) virtual public {
        require(uah > 0);
        uint256 proof = swap(uah);
        require(proof <= stake[msg.sender]);
        stake[msg.sender] -= proof;
        _mint(to, uah);
        flow += proof;
        emit Output(to, uah);
    }

    function outflow(uint256 uah) public operable {
        require(usdt != address(0));
        require(uah > 0 && uah <= this.balanceOf(msg.sender));
        uint256 matic = swap(uah);
        require(matic <= flow);
        payable(msg.sender).transfer(matic);
        flow -= matic;
        _burn(msg.sender, uah);
    }

    receive() external payable inflow {}
    fallback() external payable inflow {}
}