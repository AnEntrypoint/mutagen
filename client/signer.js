require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const abi = require("./abi.json").abi;
const ethers = require('ethers');
const Web3 = require('web3');
(async () => {
        const myPrivateKeyHex = process.env.PRIVATE_KEY;
        const localKeyProvider = new HDWalletProvider({
            privateKeys: [myPrivateKeyHex],
            providerOrUrl: `https://rpc-mumbai.matic.today`,
        });
        const web3 = new Web3(localKeyProvider);
        const provider = new ethers.providers.Web3Provider(web3);
        const dnscall = new ethers.Contract(
            '0xF02075D38a2Fe6302E5db1B87DbFDBB4C3C65951',
            abi,
            provider.getSigner()
          );
        await dnscall.mintToken('test', 'https://www.google.com');
        //console.log('TX receipt', receipt);
        //console.log('done');
})()
