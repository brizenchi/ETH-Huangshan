# Pinata File Upload and Download

This project demonstrates how to upload and download files to IPFS using the Pinata SDK.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create a `.env` file:**

    Create a file named `.env` in the root of the project and add your Pinata credentials:

    ```
    PINATA_JWT=YOUR_PINATA_JWT
    GATEWAY_URL=YOUR_GATEWAY_URL
    ```

    You can get these values from the "API Keys" section of your Pinata account.

## Usage

### Upload a file

To upload the `hello.txt` file, run the following command:

```bash
npm start
```

After a successful upload, you will see the file's information, including its CID.

### Download a file

To download a file, you need its CID. Run the following command, replacing `YOUR_CID` with the actual CID of the file:

```bash
npm run download -- YOUR_CID
```

This will fetch the file from the Pinata gateway and display its content in the console.
