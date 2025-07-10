const { PinataSDK } = require("pinata");
const fs = require("fs");
const { Blob } = require("buffer");
require("dotenv").config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

async function upload() {
  try {
    const blob = new Blob([fs.readFileSync("./hello.txt")]);
    const file = new File([blob], "hello.txt", { type: "text/plain" });
    const upload = await pinata.upload.public.file(file);
    console.log("File uploaded successfully!");
    console.log(upload);
  } catch (error) {
    console.log(error);
  }
}

upload(); 