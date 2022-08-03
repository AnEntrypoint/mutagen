require('dotenv').config();
const { NFTStorage, File  } = require('nft.storage');
const { filesFromPath } = require('files-from-path');
const hre = require("hardhat");
const axios = require("axios");
const path = require('path');
(async ()=>{
  const Token = await hre.ethers.getContractFactory("Mutagen")
  const token = await Token.attach("0xDfC943B513bcFF2456177DA8523c84e3e52ed674")
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
      console.log({cid, olddata, oldcid});
      if(olddata.length) exists = await axios.get(oldcid, {headers: { Authorization: "Bearer " + process.env.WEB3STORAGETOKEN }    });

      if(exists === '') throw 'no exists';
      if(!exists?.data.link) throw 'no site';
      if(exists.data.link === 'https://'+cid+'.ipfs.cf-ipfs.com/')  {
        return console.log('up to date');
      }
      if(exists.status==200) {
        try {
          await storage.delete(exists.data.link.replace('.ipfs.cf-ipfs.com','').replace('/metadata.json', '').replace(`https://`,''));
          await storage.delete(olddata);
        }catch(e) {}
      }
      console.log({exists});
    } catch(e) {
      console.error(e);
    }
    if(!cid) return console.log('no cid');
    const json = JSON.stringify({
      name: process.env.NAME,
      description: process.env.DESCRIPTION,
      author: process.env.AUTHOR,
      excerpt: process.env.EXCERPT,
      title: process.env.TITLE,
      project: process.env.PROJECT,
      image: process.env.IMAGE,
      link: cid+'.ipfs.cf-ipfs.com/'
    });
    const newcid = await storage.storeDirectory([
        new File(
          json,
          'metadata.json',
           { type: 'text/plain' }
        )
    ])
    console.log({json});
    const data = await token.getData(process.env.NAME);
    if(data) console.log(await token.setAddress(process.env.NAME, 'https://'+newcid+'.ipfs.cf-ipfs.com/metadata.json'));
    else console.log(await token.mintToken(process.env.NAME, 'https://'+newcid+'.ipfs.cf-ipfs.com/metadata.json', 'push.247420.xyz'));
})();

