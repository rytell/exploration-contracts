import { ChainId, Token, WAVAX } from "@rytell/sdk";
import { ethers } from "hardhat";

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
    "0x0000000000000000000000000000000000000000",
    18,
    "RADI",
    "RADI"
  ),
};

const AVAX_RADI = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    "0x24ad1A896cF3521b80D3ae428b3cA33902267250",
    18,
    "Rytell Liquidity",
    "RYTL"
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    "0x0000000000000000000000000000000000000000",
    18,
    "Rytell Liquidity",
    "RYTL"
  ),
};

export const FACTORY_ADDRESS = {
  [ChainId.FUJI]: "0x12c643591dD4bcf68bc71Ff5d79DB505EaC792A2",
  [ChainId.AVALANCHE]: "0xe5e970FE3a90F314977a9Fd41e349486a9e8c4fe",
};

export const USDT = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    "0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22",
    6,
    "FUJISTABLE",
    "The Fuji stablecoin"
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    "0xde3A24028580884448a5397872046a019649b084",
    6,
    "USDT",
    "Tether USD"
  ),
};

const BASE_USD_PRICE = 300;
const deployer = "0x8658b19585F19CB53d21beF2af43F93df37d9852";

async function main() {
  const CalculatePrice = await ethers.getContractFactory("CalculatePrice");
  const priceCalculator = await CalculatePrice.deploy(
    WAVAX[ChainId.FUJI].address,
    USDT[ChainId.FUJI].address,
    RADI[ChainId.FUJI].address,
    FACTORY_ADDRESS[ChainId.FUJI],
    BASE_USD_PRICE
  );
  await priceCalculator.deployed();
  console.log("Price calculator deployed to: ", priceCalculator.address);

  const TheLandsOfRytell = await ethers.getContractFactory("TheLandsOfRytell");
  const theLandsOfRytell = await TheLandsOfRytell.deploy(
    "ipfs://QmbP1NySANMBLLj9qniEXtgPxoA8E3B5EkhuF2BQcHMJwj/",
    deployer,
    priceCalculator.address,
    AVAX_RADI[ChainId.FUJI].address
  );
  await theLandsOfRytell.deployed();
  console.log(
    "A collection of TLOR was deployed to: ",
    priceCalculator.address
  );

  await theLandsOfRytell.pause(false);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
