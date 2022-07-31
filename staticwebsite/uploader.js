require('dotenv').config();
const { NFTStorage, File  } = require('nft.storage');
const { filesFromPath } = require('files-from-path');
const hre = require("hardhat");
const axios = require("axios");
const path = require('path');
(async ()=>{
  const Token = await hre.ethers.getContractFactory("Mutagen")
  const token = await Token.attach("0x75B30629B07E2ccF275Cd1ef4Fc456C8B023f235")
    const storage = new NFTStorage({ token:process.env.WEB3STORAGETOKEN })
    const files = filesFromPath('public', {
      pathPrefix: path.resolve('public'),
      hidden: true,
    })
    let olddata;
    let cid, oldcid;
    cid = await storage.storeDirectory(files);
    try {
      oldcid = (await token.getData(process.env.NAME));
      let exists;
      olddata = oldcid.replace('.ipfs.cf-ipfs.com','').replace('/metadata.json', '').replace(`https://`,'');
      console.log({cid, olddata});
      if(olddata) exists = await axios.get(oldcid, {headers: { Authorization: "Bearer " + process.env.WEB3STORAGETOKEN }    });
      console.log({site:exists?.data?.site, cid:'https://'+cid+'.ipfs.cf-ipfs.com/'});
      if(!exists.data.site) return console.log('no site');
      if(exists.data.site === 'https://'+cid+'.ipfs.cf-ipfs.com/')  return console.log('up to date');
      if(exists === '') return 'no exists';
      if(exists.status==200) {
        await storage.delete(exists.data.site.replace('.ipfs.cf-ipfs.com','').replace('/metadata.json', '').replace(`https://`,''));
        await storage.delete(olddata);
      }
      console.log({exists});
    } catch(e) {
      console.error(e);
    }
    if(!cid) return console.log('no cid');
    const json = JSON.stringify({
      name: process.env.NAME,
      description: process.env.DESCRIPTION, 
      image: process.env.IMAGE,
      site: 'https://'+cid+'.ipfs.cf-ipfs.com/'
    });
    const newcid = await storage.storeDirectory([
        new File(
          json,
          'metadata.json',
           { type: 'text/plain' }
        )
    ])
    const data = await token.getData(process.env.NAME);
    if(data) console.log(await token.setAddress(process.env.NAME, 'https://'+newcid+'.ipfs.cf-ipfs.com/metadata.json'));
    else console.log(await token.mintToken(process.env.NAME, 'https://'+newcid+'.ipfs.cf-ipfs.com/metadata.json'));
})();

