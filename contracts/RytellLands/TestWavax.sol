// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestWavax is ERC20("TestWavax", "TWAVAX") {
  constructor(
    uint256 amount,
    address supplyHolder
  ) {
    _mint(supplyHolder, amount);
  }
}
