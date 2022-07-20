const nets = {
    'matic': {
      host: "https://polygon-rpc.com/",
      contract: "0x676Bfe56091BD392Eb919cDd3BeB2DdB7F89D4F0",
    }
  }
  
  const http = require('http');
  const Web3 = require("web3");
  const ABI = require('./abi.json').abi;
  const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
  const contract = new web3.eth.Contract(ABI, "0xF02075D38a2Fe6302E5db1B87DbFDBB4C3C65951");
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
  