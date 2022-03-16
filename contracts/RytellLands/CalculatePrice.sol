//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@rytell/exchange-contracts/contracts/core/interfaces/IRytellPair.sol";
import "@rytell/exchange-contracts/contracts/core/interfaces/IRytellFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/Math.sol";
import "./libraries/SafeMath.sol";

contract CalculatePrice {
  using SafeMath for uint256;

  address public avax;
  address public radi;
  address public usdc;
  address public factory;
  uint256 public baseUsdPrice;
  uint8 public ratioDecimals = 18;
  uint112 public ratioMultiplier = 1000000000000000000;

  constructor(
    address _avax,
    address _usdc,
    address _radi,
    address _factory,
    uint256 _baseUsdPrice
  ) {
    avax = _avax;
    usdc = _usdc;
    radi = _radi;
    factory = _factory;
    baseUsdPrice = _baseUsdPrice;
  }

  function getPairAddress(address token1, address token2)
    public
    view
    returns (address)
  {
    address pair = IRytellFactory(factory).getPair(token1, token2);
    return pair;
  }

  function getLandPriceAvaxOnly() public view returns (uint256) {
    address avaxUsdc = getPairAddress(avax, usdc);
    uint256 balanceAvax = IERC20(avax).balanceOf(avaxUsdc);
    uint256 balanceUsdc = IERC20(usdc).balanceOf(avaxUsdc);

    // 1 usdc is worth ... avax
    uint256 usdPrice = balanceAvax / (balanceUsdc * (1000000000000));

    uint256 landPriceAvax = baseUsdPrice * usdPrice;
    return landPriceAvax;
  }

  function getLandPriceInTokens() public view returns (uint256, uint256) {
    address avaxUsdc = getPairAddress(avax, usdc);
    uint256 balanceAvax = IERC20(avax).balanceOf(avaxUsdc);
    uint256 balanceUsdc = IERC20(usdc).balanceOf(avaxUsdc);

    // 1 usdc is worth ... avax

    uint256 landPriceAvax = (baseUsdPrice * balanceAvax * 1000000000000000000) /
      (balanceUsdc * (1000000000000) * 2);

    address avaxRadi = getPairAddress(avax, radi);
    uint256 balanceAvaxInRadiPair = IERC20(avax).balanceOf(avaxRadi);
    uint256 balanceRadi = IERC20(radi).balanceOf(avaxRadi);

    uint256 amountRadi = (landPriceAvax * balanceRadi) / balanceAvaxInRadiPair;

    return (landPriceAvax, amountRadi);
  }

  function getPrice()
    public
    view
    returns (
      uint256,
      uint256,
      uint256 liquidity
    )
  {
    (uint256 avaxAmount, uint256 radiAmount) = getLandPriceInTokens();

    // TODO calculate how many lp tokens will be needed
    address avaxRadi = getPairAddress(avax, radi);
    uint256 lpTotalSupply = IRytellPair(avaxRadi).totalSupply();
    (uint112 _reserve0, uint112 _reserve1, ) = IRytellPair(avaxRadi)
      .getReserves();
    if (lpTotalSupply == 0) {
      liquidity = Math.sqrt(avaxAmount.mul(radiAmount));
    } else {
      liquidity = Math.min(
        avaxAmount.mul(lpTotalSupply) / _reserve0,
        radiAmount.mul(lpTotalSupply) / _reserve1
      );
    }
    require(liquidity > 0, "Rytell: INSUFFICIENT_LIQUIDITY_MINTED");
    return (avaxAmount, radiAmount, liquidity);
  }
}
