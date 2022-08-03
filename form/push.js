require('dotenv').config()
global.window = {};
global.document = null;
const { NFTStorage } = require("nft.storage");
const storage = new NFTStorage({ token: process.env.STORAGETOKEN });
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
var querystring = require("querystring"),
  fs = require("fs");

const Web3 = require("web3");
require('./public/mutagen');
require('./public/viewtemplate');
const ABI = window.abi;
const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
const contract = new web3.eth.Contract(ABI, "0xDfC943B513bcFF2456177DA8523c84e3e52ed674");
const dns = contract;
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const axios = require('axios');

const list = (async (collection, draw) => {
  return new Promise(res => {
    let items = [];
    dns.methods._collectionBalances(collection).call().then(total => {
      for (let x = 1; x < parseInt(total) + 1; x++) {
        dns.methods.getCollectionData(collection, x).call().then(url => {
          axios.get(url).then(data => {
            items.push({ url, data: data.data });
            if (x == total) res(items);
          });
        });
      }
    })
  })
})

const sendDiscord = (webhook, message, url) => {
  let embeds = [
    {
      title: "New Project",
      color: 5174599,
      footer: {
        text: message+`\n📅 ${new Date()}\n`+url,
      }
    },
  ];

  //Stringify the embeds using JSON.stringify()
  let data = JSON.stringify({ embeds });

  //Create a config object for axios, you can also use axios.post("url", data) instead
  var config = {
    method: "POST",
    url: webhook, // https://discord.com/webhook/url/here
    headers: { "Content-Type": "application/json" },
    data: data,
  };

  //Send the request
  axios(config)
    .then((response) => {
      console.log("Webhook delivered successfully");
      return response;
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
}
let whitelist = [];
const updateList = () => {
  whitelist = fs.readdirSync('whitelist');
  list('push.247420.xyz').then(
    items => {
      for (let item of items) {
        const newcontent = JSON.stringify(item);
        try {
          const existing = fs.readFileSync('projects/' + item.data.project);
          if (newcontent !== existing) fs.writeFileSync('projects/' + item.data.project, newcontent);
        } catch (e) {
          console.log('loaded');
          fs.writeFileSync('projects/' + item.data.project, newcontent);
          sendDiscord('https://discord.com/api/webhooks/1003286988289486889/1WbsnBmvb8dlnb9Bg1HBcfgVYxrmYb7RzF-ZH-fhewBRe62jJBbOWdox7-CldI5Wuqxs',`New project detected, \nhttps://push.247420.xyz/view.html?name=${item.data.project}`)
        }
      }
    }
  )
};
setInterval(updateList, 60000 * 60);
updateList();
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}


const user = {
  id: Date.now(),
  userEmail: "example@gmail.com",
  password: "123",
};

jwt.sign({ user }, process.env.SECRET, (err, token) => {
  console.log({ token });
});


const app = express();

app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App is listening on port ${port}.`));
/*app.get("/", (req, response) => {
  console.log("Request handler 'start' was called.");

  var body =
    "<html>" +
    "<head>" +
    '<meta http-equiv="Content-Type" ' +
    'content="text/html; charset=UTF-8" />' +
    "</head>" +
    "<body>" +
    '<form action="/upload" enctype="multipart/form-data" ' +
    'method="post">' +
    '<input type="file" name="files" multiple="multiple">' +
    '<input type="submit" value="Upload file" />' +
    "</form>" +
    "</body>" +
    "</html>";

  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(body);
  response.end();
});*/

app.post("/upload", /*verifyToken,*/ async (req, res) => {
  //jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
  //if (err) res.sendStatus(403);
  //else {
  console.log({ req });
  if (!req.files) {
    res.send({ status: false, message: "No file uploaded" });
  } else {
    let avatar = req.files.avatar;
    req.files.files.stream = () => {
      return req.files.files.data;
    };
    const newcid = await storage.storeBlob(req.files.files);

    res.send({
      status: true,
      message: "File is uploaded",
      cid: newcid,
      data: {
        name: req.files.files.name,
        mimetype: req.files.files.mimetype,
        size: req.files.files.size,
      },
    });
  }
  //}
  //});
});

const listpage = fs.readFileSync('public/ssrlist.html').toString();
app.get("/list", async (req, res) => {
  const cached = cache.get('listpage');
  if (cached) {
    res.send(cached);
    return;
  }
  const loaded = listpage.replace('${list}', window.draw(dirToArray('projects').filter(a=>whitelist.includes(a.data.project))));
  
  cache.set('listpage', loaded);
  res.send(loaded);
});

const dirToArray = (path) => {
  return fs.readdirSync(path).map(file => {
    try {
      return JSON.parse(fs.readFileSync(path + "/" + file, { encoding: 'utf8', flag: 'r' }));
    } catch (e) {
      console.error(e);
    }
  })
}


app.use(express.static('public'))
