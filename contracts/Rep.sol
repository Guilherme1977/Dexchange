//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Rep is ERC20 {
  constructor(uint256 initialBalance) ERC20("Augur token", "REP") {
    _mint(msg.sender, initialBalance);
  }

  function faucet(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
