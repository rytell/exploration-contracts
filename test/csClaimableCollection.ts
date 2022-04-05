import { Token } from "@rytell/sdk";
import { ZERO } from "@rytell/sdk/dist/constants";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ClaimableCollection", function () {
  let claimableCollection: any;
  let baseCollection: any; // rytell seals
  let owner: any;
  let landClaimers: any[];

  this.beforeEach(async function () {
    [owner, ...landClaimers] = await ethers.getSigners();

    const CryptoSeals = await ethers.getContractFactory("CryptoSeals");
    baseCollection = await CryptoSeals.deploy();
    await baseCollection.deployed();

    await baseCollection.startDrop();

    // mint some
    await baseCollection
      .connect(landClaimers[0])
      .summonSeal(20, { value: ethers.utils.parseEther("6") });
    console.log(
      (await baseCollection.tokensOfOwner(landClaimers[0].address)).map(
        (token: any) => token.toString()
      )
    );

    const ClaimableCollection = await ethers.getContractFactory(
      "CsClaimableCollection"
    );
    claimableCollection = await ClaimableCollection.deploy(
      "ipfs://QmRDDHtTzYDgHJth5KBzw7aVicZ3yyymmvEoLF9EfkcCgd/",
      baseCollection.address
    );
    await claimableCollection.deployed();
    await claimableCollection.setPaused(false);
    await claimableCollection.setUriPrefix(
      "ipfs://QmRDDHtTzYDgHJth5KBzw7aVicZ3yyymmvEoLF9EfkcCgd/"
    );
    await claimableCollection.setUriSuffix(".json");
  });

  it("Land claimer should have at least a seal", async function () {
    const landClaimerSealBalance = await baseCollection.balanceOf(
      landClaimers[0].address
    );
    expect(landClaimerSealBalance.toNumber()).to.equal(20);
  });

  it("Should let seal owners to claim lands", async function () {
    const sealNumbers = await baseCollection.tokensOfOwner(
      landClaimers[0].address
    );
    console.log(sealNumbers.map((seal: any) => seal.toNumber()));
    await expect(
      claimableCollection.connect(landClaimers[0]).mint(sealNumbers[0])
    ).not.to.be.reverted;

    const csLands = await claimableCollection.walletOfOwner(
      landClaimers[0].address
    );

    expect(await claimableCollection.sealLand(sealNumbers[0])).to.equal(
      csLands[0]
    );
  });

  it("Should not let a seal owner claim twice for same seal", async function () {
    const sealNumbers = await baseCollection.tokensOfOwner(
      landClaimers[0].address
    );

    // claim a first time
    await expect(
      claimableCollection.connect(landClaimers[0]).mint(sealNumbers[0])
    ).not.to.be.reverted;

    // claim a second time
    await expect(
      claimableCollection.connect(landClaimers[0]).mint(sealNumbers[0])
    ).to.be.revertedWith("This seal has already claimed a land");
  });

  it("URI should have an offset of 1 index", async function () {
    const sealNumbers = await baseCollection.tokensOfOwner(
      landClaimers[0].address
    );

    await expect(
      claimableCollection.connect(landClaimers[0]).mint(sealNumbers[0])
    ).not.to.be.reverted;

    const csLands = await claimableCollection.walletOfOwner(
      landClaimers[0].address
    );

    expect(await claimableCollection.tokenURI(csLands[0].toNumber())).to.equal(
      "ipfs://QmRDDHtTzYDgHJth5KBzw7aVicZ3yyymmvEoLF9EfkcCgd/2.json"
    );
  });
});
