const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

const PINATA_JWT = process.env.PINATA_JWT; // Set this in your Render environment variables

app.post("/api/proxy/ipfs", upload.none(), async (req, res) => {
  try {
    const metadata = req.body;

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `tube.fun-${metadata.symbol || "token"}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json"
        }
      }
    );

    const cid = response.data.IpfsHash;
    const url = `https://pump.mypinata.cloud/ipfs/${cid}`;

    res.json({
      metadataUri: url,
      metadata
    });
  } catch (err) {
    console.error("Pinata upload failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "IPFS upload failed",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
