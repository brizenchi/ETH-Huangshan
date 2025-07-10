const { PinataSDK } = require("pinata");
const fs = require("fs");
require("dotenv").config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

async function download(cid) {
  try {
    const response = await pinata.gateways.public.get(cid);
    fs.writeFile(`./${cid}`, response.data, (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log(`File downloaded and saved as ${cid}`);
    });
  } catch (error) {
    console.log(error);
  }
}

const cid = process.argv[2];

if (!cid) {
  console.log("Please provide a CID as a command-line argument.");
  process.exit(1);
}

download(cid); 