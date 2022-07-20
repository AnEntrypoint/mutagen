require('dotenv').config();
const { getFilesFromPath, Web3Storage, File  } = require('web3.storage');
const hre = require("hardhat");
const axios = require('axios');

(async ()=>{
  
    const storage = new Web3Storage({ token:process.env.TOKEN })
    const file = await getFilesFromPath('public');
    console.log(file);
    const files = file.map(a=>{a.name = a.name.replace('/public',''); return a;});
    console.log(files);
    const cid = await storage.put(files);
    const newcid = await storage.put([
        new File(
          [JSON.stringify({
            name: "moonshine",
            description: "Paper collage, using salvaged and original watercolour papers", 
            image: "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/image",
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

