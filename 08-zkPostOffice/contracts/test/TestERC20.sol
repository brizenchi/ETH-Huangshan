// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestERC20
 * @dev 用于测试的ERC20代币合约
 */
contract TestERC20 is ERC20 {
    address public owner;

    constructor() ERC20("tesnt token", "tesnt token") {
        owner = msg.sender;
        _mint(msg.sender, 100000 * 10 ** decimals()); 
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev 铸造新代币
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
