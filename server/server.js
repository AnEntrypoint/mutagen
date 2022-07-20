console.log('test');

const http = require('http');
const Web3 = require("web3");
const ABI = require('./abi.json').abi;
const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
const contract = new web3.eth.Contract(ABI, "0xCfeA4763583d9a39Ade0DA8Fd6d1B5282Ba67689");
const cache = require('node-cache');
const axios = require('axios');
function load(name) {
  return new Promise((ret, fail) => {
    contract.methods.getData(name).call().then((id) => {
      console.log(id);
      ret(id);
    }).catch(fail);
  });
}

const doServer = async function (req, res) {
  try {
    let nft = await load(req.url.replace('/',''));
    const data = await axios.get(nft);
    res.writeHead(302, {
      location: data.data.site,
    });
    res.end();
  } catch(e) {
    res.write('not found');
    res.end();
  }
}

var server = http.createServer(doServer);
process.stdout.on('error', console.error);
server.listen(8081);
