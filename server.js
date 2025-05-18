const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

const PINATA_JWT = process.env.PINATA_JWT;

// Upload a file to IPFS (e.g., thumbnail image)
app.post("/api/proxy/ipfs/image", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname
    });

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      }
    });

    const cid = response.data.IpfsHash;
    const url = `https://pump.mypinata.cloud/ipfs/${cid}`;

    res.json({ imageUrl: url });
  } catch (err) {
    console.error("Pinata image upload failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Image upload failed", details: err.response?.data || err.message });
  }
});

// Upload metadata JSON to IPFS
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

    res.json({ metadataUri: url, metadata });
  } catch (err) {
    console.error("Pinata metadata upload failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Metadata upload failed", details: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
