// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { ChainId } from "@rytell/sdk";

const BASE_COLLECTION = {
  [ChainId.FUJI]: "0x9EE99f276fAFB7350b9Ab0314431a24a6A68E34B",
  [ChainId.AVALANCHE]: "0x0540E4EE0C5CdBA347C2f0E011ACF8651bB70Eb9",
};

async function main() {
  const CsClaimableCollection = await ethers.getContractFactory(
    "CsClaimableCollection"
  );
  const claimableCollection = await CsClaimableCollection.deploy(
    "ipfs://QmRDDHtTzYDgHJth5KBzw7aVicZ3yyymmvEoLF9EfkcCgd/",
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
