// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./UAHT.sol";

contract UAHT_DAO { // спільнота @uaht_group
    address moderator; // hodl
    mapping (address => bool) public trust; // лістинг на uaht.io
    mapping (address => uint256) public operators; // партнерський пул
    address public uaht_contract = 0x0D9447E16072b636b4a1E8f2b8C644e58F3eaA6A;
    mapping (uint256 => uint256) public proposal; // виконання за рейтингом

    constructor() {
        moderator = msg.sender;
    }

    modifier moderable { // SAFU в ОВДП
        require(msg.sender == moderator);
        _;
    }

    modifier operable { // KYC + AML
        require(operators[msg.sender] > 0);
        _;
    }

    modifier usable { // GDPR
        require(UAHT(uaht_contract).balanceOf(msg.sender) > 0);
        _;
    }

    function input(address to, uint256 uah) public operable {
        require(operators[msg.sender] + uah < allowance(msg.sender));
        operators[msg.sender] += uah;
        UAHT(uaht_contract).input(to, uah); // поворотний внесок | пфд | застава | тощо
    }

    function output(address from, uint256 uah) public operable {
        require(operators[msg.sender] - uah > 0);
        require(uah <= UAHT(uaht_contract).allowance(from, msg.sender) || trust[msg.sender]);
        operators[msg.sender] -= uah;
        UAHT(uaht_contract).output(from, uah); // повернення боргу
    }

    function transfer(address from, address to, uint256 uah, uint256 fee) public operable { // simple ERC-865 | переуступка
        require(uah > 30*fee); // ~3% max
        output(from, uah);
        input(to, uah - fee);
    }

    function assign(address operator, uint256 stake) public moderable {
        operators[operator] = stake; // proof of stake + authority
    }

     function affiliate(address operator, bool confirm) public moderable {
        trust[operator] = confirm;
    }

    function allowance(address operator) public view returns(uint256) {
        return UAHT(uaht_contract).allowance(moderator, operator);
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
        proposal[id] += uah; // голосування гривнею | підписом
    }

    function upgrade(address to, bool confirm) public moderable {
        UAHT(uaht_contract).delegate(to, confirm);
        selfdestruct(payable(to));
    }

    function delegate(address to, bool confirm) public moderable {
        require(confirm);
        moderator = to;
    }
}
