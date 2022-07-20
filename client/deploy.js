const hre = require("hardhat");

async function main() {
  const Mut = await hre.ethers.getContractFactory("Adaptogen");
  const mut = await Mut.deploy();
  await mut.deployed();
  console.log("Mutagen deployed to:", mut.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
