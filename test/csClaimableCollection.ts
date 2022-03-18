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

    const ClaimableCollection = await ethers.getContractFactory(
      "CsClaimableCollection"
    );
    claimableCollection = await ClaimableCollection.deploy(
      "ipfs://QmVvpF887BE1h5rojcxg8aZC6yrtc5Q5oNeqfwnEzy2KPa/",
      baseCollection.address
    );
    await claimableCollection.deployed();
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
    await expect(
      claimableCollection.connect(landClaimers[0]).mint(sealNumbers[0])
    ).not.to.be.reverted;

    expect(await claimableCollection.sealLand(sealNumbers[0])).to.equal(
      sealNumbers[0]
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
});
