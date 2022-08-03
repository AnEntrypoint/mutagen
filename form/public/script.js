async function waitForTxToBeMined(txHash) {
  let txReceipt;
  while (!txReceipt) {
    try {
      txReceipt = await window.eth.getTransactionReceipt(txHash);
    } catch (err) {
      return console.error(err);
    }
  }
}

const init = async () => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  let account = accounts[0];
  window.addr = account;

  for (let el of document.querySelectorAll(".loggedout"))
    el.style.display = "block";
  for (let el of document.querySelectorAll(".loggedin"))
    el.style.display = "none";
};

window.address = "0xDfC943B513bcFF2456177DA8523c84e3e52ed674";

window.addEventListener("load", async () => {
  if (typeof window.web3 !== "undefined") {
  }
});

window.provider = new window.ethers.providers.Web3Provider(window.ethereum);
fetch("https://gasstation-mumbai.matic.today/v2")
  .then((a) => a.json())
  .then((a) => (window.gasprices = a));

const contract = new window.EthContract(window.provider);
const web3 = new window.Web3("https://matic-mumbai.chainstacklabs.com");
const dns = new web3.eth.Contract(window.abi, window.address);
window.contract = contract;
window.dns = dns;
function load(name) {
  return new Promise((ret, fail) => {
    window.dns.methods
      .getData(name)
      .call()
      .then((input) => {
        const addy = input;
        fetch(addy)
          .then((a) => a.json().then(ret))
          .catch((e) => {
            console.log({ addy });
            console.error(e);
            fail();
          });
      });
  });
}

const networks = {
  mumbai: {
    chainId: "0x13881",
    chainName: "Polygon Testnet Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  }
};

const list = (async (collection, draw) => {
  return new Promise(res=>{
    let items = [];
    dns.methods._collectionBalances(collection).call().then(total => {
      for (let x = 1; x < parseInt(total) + 1; x++) {
        dns.methods.getCollectionData(collection, x).call().then(url => {
          fetch(url).then(a => a.json()).then(data => {
            items.push({ url, data });
            if (draw) draw(items);
            if(x == total) res(items);
          });
        });
      }
    })
  })
})

function save(key, name, data, collection=window.location.host) {
  return new Promise((ret, fail) => {
    window.provider.getGasPrice().then((a) => {
      window.price = window.ethers.utils.formatEther(a);

      dns.methods
        .getId(name)
        .call()
        .then((a) => {
          if (parseInt(a)) {
            window.web3.currentProvider
              .request({
                method: "wallet_addEthereumChain",
                params: [
                  networks.mumbai,
                ],
              })
              .then(() => {
                const accounts = window.ethereum
                  .request({
                    method: "eth_requestAccounts",
                  })
                  .then(() => {
                    window.account = accounts[0];
                    window.ethereum.request({ method: "eth_requestAccounts" });
                    const signer = window.provider.getSigner();
                    window.dnscall = new window.ethers.Contract(
                      window.address,
                      window.abi,
                      signer
                    );
                    console.log("uploading");
                    const formData = new FormData();
                    formData.append('files', new Blob([JSON.stringify(data)], {
                      type: "application/json",
                    }));
                    fetch("/upload", {
                      method: "POST",
                      headers: { Authorization: "Bearer " + key },
                      body: formData,
                    })
                      .then((a) => a.json())
                      .then((a) => {
                        window.dnscall.setAddress(
                          name,
                          "https://ipfs.io/ipfs/" + a.cid
                        );
                        ret(a);
                      })
                      .catch((e) => {
                        console.error(e);
                        fail();
                      });
                  });
              })
              .catch((e) => {
                console.error(e);
                fail();
              });
          } else {
            window.web3.currentProvider
              .request({
                method: "wallet_addEthereumChain",
                params: [
                  networks.mumbai,
                ],
              })
              .then(() => {
                console.log("does not exist");
                const accounts = window.ethereum
                  .request({
                    method: "eth_requestAccounts",
                  })
                  .then(() => {
                    window.account = accounts[0];
                    window.ethereum.request({ method: "eth_requestAccounts" });
                    const signer = window.provider.getSigner();
                    window.dnscall = new window.ethers.Contract(
                      window.address,
                      window.abi,
                      signer
                    );
                    const formData = new FormData();
                    formData.append('files', new Blob([JSON.stringify(data)], {
                      type: "application/json",
                    }));
                    fetch("/upload", {
                      method: "POST",
                      headers: { Authorization: "Bearer " + key },
                      body: formData,
                    })
                      .then((a) => a.json())
                      .then((a) => {
                        console.log(a);
                        window.dnscall.mintToken(
                          name,
                          "https://ipfs.io/ipfs/" + a.cid,
                          collection
                        );
                        ret(a);
                      })
                      .catch((e) => {
                        console.error(e);
                        fail();
                      });
                  });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
    });
  });
}
