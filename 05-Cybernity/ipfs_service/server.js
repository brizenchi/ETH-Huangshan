
const express = require('express');
const multer = require('multer');
const pinataSDK = require('@pinata/sdk');
const { Readable } = require('stream');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const options = {
      pinataMetadata: {
        name: req.file.originalname,
      },
    };
    
    const result = await pinata.pinFileToIPFS(readableStream, options);
    res.status(200).json({
      message: 'File uploaded successfully!',
      cid: result.IpfsHash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to IPFS.');
  }
});

app.get('/download/:cid', async (req, res) => {
  const { cid } = req.params;
  if (!cid) {
    return res.status(400).send('Please provide a CID.');
  }

  try {
    let gatewayUrl = process.env.GATEWAY_URL || 'https://gateway.pinata.cloud';
    if (!gatewayUrl.startsWith('http')) {
      gatewayUrl = `https://${gatewayUrl}`;
    }
    const fileUrl = `${gatewayUrl}/ipfs/${cid}`;
    console.log(fileUrl);
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    console.log(response);
    // It's good practice to forward headers like Content-Type and Content-Length
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Length', response.headers['content-length']);
    
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    if (error.response) {
        return res.status(error.response.status).send(error.response.statusText);
    }
    res.status(500).send('Error downloading file from IPFS.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 