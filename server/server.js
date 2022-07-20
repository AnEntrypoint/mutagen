const http = require('http');
const Web3 = require("web3");
const ABI = require('./abi.json').abi;
const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
const contract = new web3.eth.Contract(ABI, "0xCfeA4763583d9a39Ade0DA8Fd6d1B5282Ba67689");
const NodeCache = require('node-cache');
const cache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
const axios = require('axios');
function load(name) {
  return new Promise((ret, fail) => {
    contract.methods.getData(name).call().then((id) => {
      ret(id);
    }).catch(fail);
  });
}
const doServer = async function (req, res) {
  try {
    var data = cache.get(req.url.replace('/',''));
    if(!data) {
      let nft = await load(req.url.replace('/',''));
      cache.set(req.url.replace('/',''), JSON.stringify(data = (await axios.get(nft)).data));
    } else {
      data = JSON.parse(data);
    }
    res.writeHead(302, {
      location: data.site,
    });
    res.end();
  } catch(e) {
    console.error(e);
    res.write('not found');
    res.end();
  }
}
var server = http.createServer(doServer);
process.stdout.on('error', console.error);
server.listen(8081);
