const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());

app.post("/api/proxy/ipfs", upload.any(), async (req, res) => {
  try {
    const form = new FormData();

    // Add uploaded file(s)
    req.files.forEach(file => {
      form.append("file", file.buffer, file.originalname);
    });

    // Add text fields
    Object.entries(req.body).forEach(([key, value]) => {
      form.append(key, value);
    });

    const response = await axios.post("https://pump.mypinata.cloud/ipfs/QmTRKh5uTd5JEDr8nhZvin4qWbtJFQTCR6FbhhLhrd6XZ4", form, {
      headers: form.getHeaders()
    });

    res.json(response.data);
  } catch (err) {
    console.error("IPFS upload failed:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      detail: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
