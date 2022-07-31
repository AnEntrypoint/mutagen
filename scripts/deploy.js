// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");
async function main() {
  const Mut = await ethers.getContractFactory("Mutagen");
  const mut = await Mut.deploy();
  //const mut = await upgrades.deployProxy(Mut, []);
  await mut.deployed();
  console.log("Mutagen deployed to:", mut.address);
}

main();