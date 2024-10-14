// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./UAHT_DAO.sol";
import "./UAHT_ORACLE.sol";

contract UAHT_JAR is ReentrancyGuard {
    address public jar = 0x579B733576c607ab08909F4f8Dc3b274C721aAba;
    address public uaht_dao = 0x08B491bC7848C6AF42c3882794A93d70c04e5816;
    address public uaht_oracle = 0x626CEF050c13eDE2B1b801bc6a76863E212ec25d;

    struct Position { // позика
      address next;
      address prev;
      address asset;
      uint256 stake;
      uint256 debt;
      uint256 end;
   }

    address public base;
    mapping (address => Position) public position;
    mapping (address => uint256) public stake;

    event Sync(address from, Position position);
    event Put(uint256 _in, uint256 _out);
    event Pop(uint256 _out, uint256 _in);

    function value(address asset) public view returns(uint256) {
        return UAHT_ORACLE(uaht_oracle).data(asset, jar);
    }

    function to_uaht(address asset, uint256 amount, uint256 _days) public view returns(uint256) {
        uint256 rate = 100 - Math.sqrt(_days);
        require(rate > 0, "!rate");
        return Math.mulDiv(amount, value(asset), 10 ** ERC20(asset).decimals()) * rate / 100;
    }

    function to_asset(address asset, uint256 uaht) public view returns(uint256) {
        return Math.mulDiv(uaht, 10 ** ERC20(asset).decimals(), value(asset)) * 99 / 100;
    }

    function total_uaht() public view returns(uint256) {
        return UAHT_DAO(uaht_dao).operators(address(this));
    }

    function total_asset(address asset) public view returns(uint256) {
        return ERC20(asset).balanceOf(address(this));
    }

    function max_uaht() public view returns(uint256) {
        return UAHT_DAO(uaht_dao).allowance(address(this));
    }

    function free_uaht() public view returns(uint256) {
        return max_uaht() - total_uaht();
    }

    function free_asset(address asset) public view returns(uint256) {
        return total_asset(asset) - stake[asset];
    }

    function simulate_free_asset(address asset) public returns(uint256) {
        sync();
        return free_asset(asset);
    }

    function sync() public { // синхронізація
        address next = base;
        while(next != address(0) && position[next].end <= block.timestamp) {
            address _next = position[next].next;
            sync_position(next);
            next = _next;
        }
    }

    function sync_position(address index) public {
        if(index != address(0) && position[index].end <= block.timestamp) {
            stake[position[index].asset] -= position[index].stake;
            emit Sync(index, position[index]);
            if(index == base) {
                base = position[index].next;
            }
            if (position[index].prev != address(0)) {
                position[position[index].prev].next = position[index].next;
            }
            if (position[index].next != address(0)) {
                position[position[index].next].prev = position[index].prev;
            }
            delete position[index];
        }
    }

    function put(address asset, uint256 amount, uint256 _days) public nonReentrant() returns(uint256) { // застава
        SafeERC20.safeTransferFrom(ERC20(asset), msg.sender, address(this), amount);
        if(position[msg.sender].end != 0) {
            require(position[msg.sender].asset == asset , "!asset");
            require(position[msg.sender].end > block.timestamp, "!!end");
            uint256 debt = to_uaht(asset, amount, (position[msg.sender].end - block.timestamp) / 1 days);
            require(debt > 0, "!debt");
            position[msg.sender].debt += debt;
            position[msg.sender].stake += amount;
            UAHT_DAO(uaht_dao).input(msg.sender, debt);
            stake[position[msg.sender].asset] += amount;
            emit Put(amount, debt);
            return debt;
        } else {
            require(position[msg.sender].debt == 0 , "!empty");
            position[msg.sender] = Position(address(0), address(0), asset, amount, to_uaht(asset, amount, _days), block.timestamp + _days * 1 days);
            require(position[msg.sender].debt > 0, "!debt");
            UAHT_DAO(uaht_dao).input(msg.sender, position[msg.sender].debt);
            stake[position[msg.sender].asset] += position[msg.sender].stake;
            if (base == address(0)) {
                base = msg.sender;
            } else {
                address next = base;
                address prev = address(0);
                while (next != address(0) && position[next].end < position[msg.sender].end) {
                    prev = next;
                    next = position[next].next;
                }
                position[msg.sender].next = next;
                position[msg.sender].prev = prev;
                if (prev != address(0)) {
                    position[prev].next = msg.sender;
                } else {
                    base = msg.sender;
                }
                if (next != address(0)) {
                    position[next].prev = msg.sender;
                }
            }
            emit Put(amount, position[msg.sender].debt);
            return position[msg.sender].debt;
        }
    }

    function pop(address asset, uint256 uaht, address to) public nonReentrant() returns(uint256) { // ліквідація
        if(position[msg.sender].debt == 0) {
            sync();
            uint256 _stake = to_asset(asset, uaht);
            require(_stake > 0 && _stake < free_asset(asset), "!stake");
            UAHT_DAO(uaht_dao).output(msg.sender, uaht);
            SafeERC20.safeTransfer(ERC20(asset), to, _stake);
            emit Pop(_stake, uaht);
            return _stake;
        } else {
            require(uaht == position[msg.sender].debt, "!position");
            uint256 _stake = position[msg.sender].stake;
            UAHT_DAO(uaht_dao).output(msg.sender, position[msg.sender].debt);
            SafeERC20.safeTransfer(ERC20(position[msg.sender].asset), to, _stake);
            emit Pop(_stake, position[msg.sender].debt);
            position[msg.sender].end = 0;     
            sync_position(msg.sender);
            return _stake;
        }
    }
}
