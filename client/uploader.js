require('dotenv').config();
const { getFilesFromPath, Web3Storage, File  } = require('web3.storage');
const hre = require("hardhat");

(async ()=>{
    const storage = new Web3Storage({ token:process.env.WEB3STORAGETOKEN })
    const file = await getFilesFromPath('public');
    const files = file.map(a=>{a.name = a.name.replace('/public',''); return a;});
    const cid = await storage.put(files);
    const newcid = await storage.put([
        new File(
          [JSON.stringify({
            name: process.env.NAME,
            description: process.env.DESCRIPTION, 
            image: process.env.IMAGE,
            site: 'https://'+cid+'.ipfs.dweb.link/'
          })],
          '/metadata.json'
        )
    ])
    const Token = await hre.ethers.getContractFactory("Adaptogen")
    const token = await Token.attach("0xCfeA4763583d9a39Ade0DA8Fd6d1B5282Ba67689")
    const data = await token.getData(process.env.NAME);
    if(data) console.log(await token.setAddress(process.env.NAME, 'https://'+newcid+'.ipfs.dweb.link/metadata.json'));
    else console.log(await token.mintToken(process.env.NAME, 'https://'+newcid+'.ipfs.dweb.link/metadata.json'));
})();

