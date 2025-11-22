// server.js
 
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
 
const app = express();
const port = 3000;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const uploadFolder = path.join(__dirname, "uploads");
 
app.use('/uploads', express.static(uploadFolder)); 
app.use(cors());
app.use(express.json());


 
 
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
 
const upload = multer({ storage });
 
const BPM_BASE_URL = 'https://localhost:9443';
 
// ===============================
// 🔹 HEADER BUILDER (CSRF + AUTH)
// ===============================
function getBpmHeaders(req) {
    const csrfToken = req.headers['bpmcsrftoken'] || '';
    const authorization = req.headers['authorization'] || '';
 
    return {
        BPMCSRFToken: csrfToken,
        Authorization: authorization,
        'Content-Type': 'application/json'
    };
}
 
// =====================================================================
// 🔹 REUSABLE HELPERS FOR URL CONSTRUCTION (PRESERVE QUERY PARAMETERS)
// =====================================================================
function buildTargetUrl(req, path) {
    const queryIndex = req.originalUrl.indexOf('?');
    const rawQuery = queryIndex !== -1 ? req.originalUrl.slice(queryIndex) : '';
    return `${BPM_BASE_URL}${path}${rawQuery}`;
}
 
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
 
// ===============================
// 🔹 GENERIC PROXY GET
// ===============================
function proxyGet(req, res, url) {
    axios.get(url, { headers: getBpmHeaders(req), httpsAgent })
        .then(r => res.json(r.data))
        .catch(e =>
            res.status(e.response?.status || 500).json({ error: e.message })
        );
}
 
// ===============================
// 🔹 GENERIC PROXY POST
// ===============================
function proxyPost(req, res, url) {
    axios.post(url, req.body, { headers: getBpmHeaders(req), httpsAgent })
        .then(r => res.json(r.data))
        .catch(e =>
            res.status(e.response?.status || 500).json({ error: e.message })
        );
}
 //Upload Files
app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
 
  // Return metadata for uploaded files
  const uploadedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`, // endpoint to download later
  }));
 
  res.json({
    message: 'Files uploaded successfully',
    files: uploadedFiles,
  });
});

// ===============================
// 🔹 FIXED: BPM LOGIN ROUTE
// ===============================
 
app.post('/bpm/system/login', (req, res) => {
    const targetUrl = `${BPM_BASE_URL}/bpm/system/login`;
 
    axios.post(targetUrl, req.body, {
        headers: getBpmHeaders(req),
        httpsAgent
    })
        .then(response => res.json(response.data))
        .catch(error =>
            res.status(error.response?.status || 500).json({ error: error.message })
        );
});
 
// ======================================
// 🔹 PROCESSES — GET / POST / GET BY ID
// ======================================
 
app.get('/bpm/processes', (req, res) => {
    const url = buildTargetUrl(req, '/bpm/processes');
    proxyGet(req, res, url);
});
 
app.post('/bpm/processes', (req, res) => {
    const url = buildTargetUrl(req, '/bpm/processes');
    console.log('Proxying POST to:', url);
    proxyPost(req, res, url);
});
 
app.get('/bpm/processes/:process_id', (req, res) => {
    const url = `${BPM_BASE_URL}/bpm/processes/${req.params.process_id}`;
    proxyGet(req, res, url);
});
 
// ======================================
// 🔹 USER TASK APIs (ALL ENDPOINTS)
// ======================================
 
// GET /user-tasks
app.get('/bpm/user-tasks', (req, res) => {
    const url = buildTargetUrl(req, '/bpm/user-tasks');
    proxyGet(req, res, url);
});
 
// GET /user-tasks/{task_id}
app.get('/bpm/user-tasks/:task_id', (req, res) => {
    const url = buildTargetUrl(req, `/bpm/user-tasks/${req.params.task_id}`);
    proxyGet(req, res, url);
});
 
// POST /user-tasks/{task_id}/claim
app.post('/bpm/user-tasks/:task_id/claim', (req, res) => {
    const url = buildTargetUrl(req, `/bpm/user-tasks/${req.params.task_id}/claim`);
    proxyPost(req, res, url);
});
 
// POST /user-tasks/{task_id}/complete
app.post('/bpm/user-tasks/:task_id/complete', (req, res) => {
    const url = buildTargetUrl(req, `/bpm/user-tasks/${req.params.task_id}/complete`);
    proxyPost(req, res, url);
});
 
// POST /user-tasks/{task_id}/fail
app.post('/bpm/user-tasks/:task_id/fail', (req, res) => {
    const url = buildTargetUrl(req, `/bpm/user-tasks/${req.params.task_id}/fail`);
    proxyPost(req, res, url);
});
 
// ===============================
// 🔹 START SERVER
// ===============================
app.listen(port, () => {
    console.log(`BPM Proxy Server running at http://localhost:${port}`);
});
 