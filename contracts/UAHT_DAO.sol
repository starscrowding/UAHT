// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./UAHT.sol";

contract UAHT_DAO { // спільнота @uaht_group
    address moderator;
    mapping (address => uint256) operators;

    address public uaht_contract = 0x0D9447E16072b636b4a1E8f2b8C644e58F3eaA6A;
    mapping (uint256 => uint256) public proposal; // виконання за рейтингом

    constructor() {
        moderator = msg.sender;
    }

    modifier moderable {
        require(msg.sender == moderator);
        _;
    }

    modifier operable {
        require(operators[msg.sender] > 0);
        _;
    }

    modifier usable {
        require(UAHT(uaht_contract).balanceOf(msg.sender) > 0);
        _;
    }

    function input(address to, uint256 uah) public operable {
        require(UAHT(uaht_contract).totalSupply() + uah < UAHT(uaht_contract).allowance(moderator, address(this)));
        operators[msg.sender] += uah;
        UAHT(uaht_contract).input(to, uah); // поворотний внесок | пфд | застава | тощо
    }

    function output(address from, uint256 uah) public operable {
        require(operators[msg.sender] - uah > 0);
        operators[msg.sender] -= uah;
        UAHT(uaht_contract).output(from, uah); // повернення боргу
    }

    function assign(address operator, uint256 allowance) public moderable {
        operators[operator] = allowance;
    }

    function propose(uint256 id) public usable { // id повідомлення @uaht_group
        UAHT(uaht_contract).output(msg.sender, 10**4); // 100 грн
        proposal[id] = 0;
    }

    function approve(uint256 id) public moderable {
        proposal[id] = 1;
    }

    function vote(uint256 id, uint256 uah) public usable {
        require(proposal[id] > 0);
        UAHT(uaht_contract).output(msg.sender, uah);
        proposal[id] += uah; // голосування гривнею
    }

    function upgrade(address to, bool confirm) public moderable {
        UAHT(uaht_contract).delegate(to, confirm);
        selfdestruct(payable(to));
    }
}
