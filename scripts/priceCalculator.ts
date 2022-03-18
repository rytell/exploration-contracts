// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { ChainId, Token, WAVAX } from "@rytell/sdk";

const RADI = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    "0xCcA36c23E977d6c2382dF43e930BC8dE9daC897E",
    18,
    "RADI",
    "RADI"
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    "0x9c5bbb5169b66773167d86818b3e149a4c7e1d1a",
    18,
    "RADI",
    "RADI"
  ),
};

export const FACTORY_ADDRESS = {
  [ChainId.FUJI]: "0x12c643591dD4bcf68bc71Ff5d79DB505EaC792A2",
  [ChainId.AVALANCHE]: "0xe5e970FE3a90F314977a9Fd41e349486a9e8c4fe",
};

const STABLE_TOKEN = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    "0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22",
    6,
    "FUJISTABLE",
    "The Fuji stablecoin"
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    6,
    "USDC.e",
    "USDC.e"
  ),
};

const BASE_USD_PRICE = 300;

async function main() {
  const CalculatePrice = await ethers.getContractFactory("CalculatePrice");
  const priceCalculator = await CalculatePrice.deploy(
    WAVAX[ChainId.FUJI].address,
    STABLE_TOKEN[ChainId.FUJI].address,
    RADI[ChainId.FUJI].address,
    FACTORY_ADDRESS[ChainId.FUJI],
    BASE_USD_PRICE
  );

  await priceCalculator.deployed();

  console.log("Price calculator deployed to:", priceCalculator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
