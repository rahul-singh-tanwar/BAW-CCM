const express = require("express");
const axios = require("axios");
const cors = require("cors");


const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const uploadFolder = path.join(__dirname, "uploads");
 
 
const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadFolder));

//===================== File Upload Setup =====================//


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
 
// ===== Keycloak + Camunda Config =====
const KEYCLOAK_TOKEN_URL =
  "http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token";
const CLIENT_ID = "orchestration";
const CLIENT_SECRET = "secret";
const CAMUNDA_API_URL = "http://localhost:8088/v2";

async function getAccessToken(req) {
  const authHeader = req.headers.authorization || req.get("Authorization");
  let token;

  if (authHeader) {
    token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    console.log("Using token from incoming Authorization header");
  } else {
    return null;
  }

  return token;
}


function extractVariables(items) {
  const proccesed =  items.map(item => {
    let value = item.value;

    try {
      value = JSON.parse(value);
    } catch (err) {
      console.warn(`⚠️ Could not parse variable ${item.name} value as JSON`);
      // If parsing fails, keep raw value (string or number)
    }

    return {
      name: item.name,
      value: value
    };
  });

  console.log('✅ Extracted variables:', items);

  return proccesed;
}

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


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for user:", username);
  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("username", username);
    params.append("password", password);

    const { data } = await axios.post(KEYCLOAK_TOKEN_URL, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return res.json(data.access_token);
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    res.status(401).json({ error: err.response?.data || "Invalid credentials" });
  }
});


// ===== API endpoint to start a Camunda process =====
app.post("/start-process", async (req, res) => {
  const { processDefinitionId, processDefinitionVersion, variables } = req.body;
  try {

    const token = await getAccessToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No access token provided" });
    }

    const response = await axios.post(
      `${CAMUNDA_API_URL}/process-instances`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "Process started successfully", processInstanceKey: response.data.processInstanceKey });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Search user tasks
app.post("/user-tasks/search", async (req, res) => {

  const { processInstanceKey, name } = req.body;

  const token = await getAccessToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token provided" });
  }

  try {
    const response = await axios.post(
      `${CAMUNDA_API_URL}/user-tasks/search`,
      {
        filter: {
          name: name,
          processInstanceKey: processInstanceKey
        },
        "page": {
          "from": 0,
          "limit": 100
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Log formatted message to backend console
    console.log("✅ User Task retreived successfully:");
    console.log(JSON.stringify(response.data, null, 2));

    const items = response.data.items || [];
    if (items.length > 0) {
      const userTaskKey = items[0].userTaskKey;
      console.log('✅ Found userTaskKey:', userTaskKey);
      res.json({ userTaskKey });
    } else {
      console.log('⚠️ No active user tasks found');
      res.status(404).json({ message: 'No active user tasks found' });
    }
  } catch (error) {
    console.error('❌ Error fetching user task:', error.message);
    res.status(500).json({ error: 'Failed to fetch user task' });
  }
});


// Search user tasks by user id
app.post("/user-task-key/searchbyUser", async (req, res) => {

  const token = await getAccessToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token provided" });
  }

  try {

    const response = await axios.post(
      `${CAMUNDA_API_URL}/user-tasks/search`,
      {
        // Search filter
        filter: {
          state: "CREATED",
          // Optional: state, assignee, candidateGroups
          // state: ["CREATED", "ASSIGNED"],
          assignee: "demo"

        },
        // Optional: pagination
        //  sorting: [{ sortBy: "createdAt", sortOrder: "asc" }],
        "page": {
          "from": 0,
          "limit": 100
        }

      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Log formatted message to backend console
    console.log("✅ User Task retreived successfully:");
    console.log(JSON.stringify(response.data, null, 2));

    const items = response.data.items || [];
    if (items.length > 0) {
      const userTaskKey = items[0].userTaskKey;
      const taskname =
        console.log('✅ Found userTaskKey:', userTaskKey);
      res.json({ userTaskKey });
    } else {
      console.log('⚠️ No active user tasks found');
      res.status(404).json({ message: 'No active user tasks found' });
    }
  } catch (error) {
    console.error('❌ Error fetching user task:', error.message);
    res.status(500).json({ error: 'Failed to fetch user task' });
  }
});

// --- REST Endpoint for user-tasks/searchbyUser ---
app.post('/user-tasks/searchbyUser', async (req, res) => {

  try {
    const { filter, page } = req.body;
    const token = await getAccessToken();
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No access token provided" });
    }

    // Build Camunda API payload
    // Dynamic filter handling
    const camundaPayload = {
      filter: {},
      page: {
        from: page?.from || 0,
        limit: page?.limit || 50,
      },
    };

    // Apply filters conditionally
    if (filter?.state) camundaPayload.filter.state = filter.state;
        camundaPayload.filter.assignee = filter.assignee;   

    console.log("➡️ Sending Camunda Payload:", JSON.stringify(camundaPayload, null, 2));

    const response = await fetch(`http://localhost:8088/v2/user-tasks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Fixed
      },
      body: JSON.stringify(camundaPayload),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: err.message });
  }
});
//Complete a User task

// ===== Complete a user task =====
app.post("/complete-user-task", async (req, res) => {
  const { userTaskKey, variables } = req.body;

  const token = await getAccessToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token provided" });
  }

  try {

    const response = await axios.post(
      `${CAMUNDA_API_URL}/user-tasks/${userTaskKey}/completion`,
      { variables }, // process variables to pass on completion
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      }
    );

    return res.json({
      message: "User task completed successfully",
      data: response.data,
    });
  } catch (err) {
    console.error(
      err.response?.data || err.message
    );

    return res.status(500).json({
      message: "Failed to complete user task",
      error: err.response?.data || err.message,
    });
  }
});

// Example: GET task variables from Camunda/Zeebe
app.get('/user-tasks/:userTaskKey/variables', async (req, res) => {
  const { userTaskKey } = req.params;

  const token = await getAccessToken(req);

  // console.log('Fetching variables for userTaskKey:', userTaskKey, token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token provided" });
  }

  try {

    const camundaResponse = await axios.post(
      `http://localhost:8088/v2/user-tasks/${userTaskKey}/variables/search`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      }
    );

    if(camundaResponse.data.items) {
      return res.json(extractVariables(camundaResponse.data.items));
    }
    else{
      console.warn(`No variables found for userTaskKey: ${userTaskKey}`);
      return res.status(404).json({ message: 'No variables found for this user task' });
    }

  } catch (err) {
    console.error('Failed to fetch task variables', err);
    return res.status(500).json({ error: 'Failed to fetch task variables' });
  }
}); 
 


 
 
// ===== Start server =====
const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));