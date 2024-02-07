// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./UAHT_DAO.sol";
import "./UAHT_ORACLE.sol";

contract UAHT_JAR {
    address public jar = 0x579B733576c607ab08909F4f8Dc3b274C721aAba;
    address public uaht_dao = 0x08B491bC7848C6AF42c3882794A93d70c04e5816;
    address public uaht_oracle = 0x626CEF050c13eDE2B1b801bc6a76863E212ec25d;

    struct Position { // позика
      address sender;
      address asset;
      uint256 stake;
      uint256 debt;
   }

    mapping (uint256 => Position) public position;

    event Put(uint256 timestamp, uint256 _in, uint256 _out);
    event Pop(uint256 timestamp, uint256 _out, uint256 _in);

    function value(address asset) public view returns(uint256) {
        return UAHT_ORACLE(uaht_oracle).data(asset, jar);
    }

    function to_uaht(address asset, uint256 amount) public view returns(uint256) {
        return Math.mulDiv(amount, value(asset), 10 ** ERC20(asset).decimals());
    }

    function to_asset(address asset, uint256 uaht) public view returns(uint256) {
        return Math.mulDiv(uaht, 10 ** ERC20(asset).decimals(), value(asset));
    }

    function total_uaht() public view returns(uint256) {
        return UAHT_DAO(uaht_dao).operators(address(this));
    }

    function total_asset(address asset) public view returns(uint256) {
        return ERC20(asset).balanceOf(address(this));
    }

    function top() public view returns(uint256) {
        return UAHT_DAO(uaht_dao).allowance(address(this));
    }

    function free() public view returns(uint256) {
        return top() - total_uaht();
    }

    function put(address asset, uint256 amount) public returns(uint256) { // застава
        require(position[block.timestamp].sender == address(0), "!empty");
        SafeERC20.safeTransferFrom(ERC20(asset), msg.sender, address(this), amount);
        position[block.timestamp] = Position(msg.sender, asset, amount, to_uaht(asset, amount));
        require(position[block.timestamp].debt > 0, "!debt");
        UAHT_DAO(uaht_dao).input(msg.sender, position[block.timestamp].debt);
        emit Put(block.timestamp, amount, position[block.timestamp].debt);
        return block.timestamp;
    }

    function pop(uint256 timestamp) public { // ліквідація
        require(position[timestamp].sender == msg.sender || timestamp + 365 * 24 * 60 * 60 < block.timestamp, "!access");
        require(position[timestamp].stake > 0 && position[timestamp].debt > 0, "empty");
        UAHT_DAO(uaht_dao).output(msg.sender, position[timestamp].debt);
        SafeERC20.safeTransfer(ERC20(position[timestamp].asset), msg.sender, position[timestamp].stake);
        emit Pop(timestamp, position[timestamp].stake, position[timestamp].debt);
        position[timestamp].stake = 0;
        position[timestamp].debt = 0;
    }
}
