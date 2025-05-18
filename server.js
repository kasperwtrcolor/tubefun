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
          Authorization: `Bearer ${eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNDFmYTczZi04Mjc0LTRkMTEtYTk3NC0yZWU5N2ZiZGFmNGQiLCJlbWFpbCI6InJhc21hc3N0dWRpb0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDI1MTgxNmUzZTJlZjlhZjNhYzciLCJzY29wZWRLZXlTZWNyZXQiOiIwOGFjZDJhZjI3YjIxZjViOGY4ODI3Mjk4MjIyOGQ5NmM3ZTg3MWIxMjY3NDM5NjZlNTYzMzgzYzEzNTEwYmYyIiwiZXhwIjoxNzc5MTQxMjQ2fQ.8QV4aviEJSGgM0Fukyb0Tsd-opltTJw6nOzs84dExS8}`,
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
