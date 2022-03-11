//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@rytell/exchange-contracts/contracts/core/interfaces/IRytellPair.sol";

contract CalculatePrice {
  address avaxUsdcPair;
  address avaxRadiPair;
  uint256 baseUsdPrice;

  constructor(
    address _avaxUsdcPair,
    address _avaxRadiPair,
    uint256 _baseUsdPrice
  ) {
    avaxUsdcPair = _avaxUsdcPair;
    avaxRadiPair = _avaxRadiPair;
    baseUsdPrice = _baseUsdPrice;
  }
}
