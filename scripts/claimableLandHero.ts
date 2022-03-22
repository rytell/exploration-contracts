// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { ChainId } from "@rytell/sdk";

const BASE_COLLECTION = {
  [ChainId.FUJI]: "0x6122F8cCFC196Eb2689a740d16c451a352740194",
  [ChainId.AVALANCHE]: "0x0ca68D5768BECA6FCF444C01FE1fb6d47C019b9f",
};

async function main() {
  const ClaimableCollection = await ethers.getContractFactory(
    "ClaimableCollection"
  );
  const claimableCollection = await ClaimableCollection.deploy(
    "ipfs://QmTYv156pj5Lm7F4msJTNAwo2xPVBcF4QHhAwrr3vHSG5g/",
    BASE_COLLECTION[ChainId.FUJI]
  );

  await claimableCollection.deployed();

  console.log(
    "Claimable collection for heroes deployed to:",
    claimableCollection.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
