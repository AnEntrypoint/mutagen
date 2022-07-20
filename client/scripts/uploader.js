const hre = require("hardhat");
const axios = require('axios');
async function main() {
  const Token = await hre.ethers.getContractFactory("Adaptogen")
  const token = await Token.attach("0xF02075D38a2Fe6302E5db1B87DbFDBB4C3C65951")
  const nft = await token.getData('bla');
  console.log((await axios.get(nft)).data.site);
  /*console.log(await token.mintToken('bla', 'https://bafybeifi5pi66dbeisnq5pjdmljwd5gzmriclm3upgwbzl5cynml25afgy.ipfs.dweb.link/nft.txt', {
    gasLimit: 4000000
  }))*/
  /*console.log(await token.setAddress('bla', 'https://bafybeifi5pi66dbeisnq5pjdmljwd5gzmriclm3upgwbzl5cynml25afgy.ipfs.dweb.link/nft.txt', {
    gasLimit: 4000000
  }))*/

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
