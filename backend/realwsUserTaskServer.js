import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch'; // Required for Node < 18
import { ZBClient } from 'zeebe-node';

const app = express();
app.use(cors());
app.use(express.json());

// --- Zeebe / Keycloak Config ---
const ZEEBE_ADDRESS = process.env.ZEEBE_ADDRESS || 'localhost';
const ZEEBE_AUTH_URL =
  process.env.ZEEBE_AUTHORIZATION_SERVER_URL ||
  'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token';
const ZEEBE_CLIENT_ID = process.env.ZEEBE_CLIENT_ID || 'orchestration';
const ZEEBE_CLIENT_SECRET = process.env.ZEEBE_CLIENT_SECRET || 'secret';

// --- Initialize Zeebe client (optional for future use) ---
const zbc = new ZBClient({
  hostname: ZEEBE_ADDRESS,
  useTLS: false,
  oAuth: {
    url: ZEEBE_AUTH_URL,
    clientId: ZEEBE_CLIENT_ID,
    clientSecret: ZEEBE_CLIENT_SECRET,
  },
});

// --- Helper: Get OAuth access token ---
async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', ZEEBE_CLIENT_ID);
  params.append('client_secret', ZEEBE_CLIENT_SECRET);

  const response = await fetch(ZEEBE_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}




// --- WebSocket setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
  console.log('✅ WebSocket client connected');
  ws.send(JSON.stringify({ type: 'INIT', message: 'Connected to live Camunda tasks' }));
  let count = 0;
  // Store per-connection state
  ws.userName = null;

  // Handle messages from Angular
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "SET_USER") {
        ws.userName = data.userName;
        console.log(`👤 User set for this connection: ${ws.userName}`);
      }

    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

 async function sendTasks() {
  try {
    const token = await getAccessToken();
    

    const filter = { state: "CREATED", assignee: ws.userName};

    

    const camundaPayload = {
      filter: {},
      page: { from: 0, limit: 100 },
    };

    if (filter.state) camundaPayload.filter.state = filter.state;
    camundaPayload.filter.assignee = filter.assignee;

    const response = await fetch(
      "http://localhost:8088/v2/user-tasks/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(camundaPayload),
      }
    );

    if (!response.ok) {
      console.error("Tasklist fetch error:", await response.text());
      return;
    }

    const data = await response.json();
    const tasks = data.items || [];

    // 🟦 Fetch variables for each task
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        try {
          const varRes = await fetch(
            `http://localhost:8088/v2/user-tasks/${task.userTaskKey}/variables/search`,
            {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          });

          if (!varRes.ok) {
            console.error(`Variable fetch failed for ${task.userTaskKey}`);
            return task;
          }

          const varData = await varRes.json();
          const vars = {};
          if (varData.items?.length) {
            varData.items.forEach((v) => {
              vars[v.name] = v.value;
            });
          }

          // 🟩 Add preArrangNumber into task object
          task.preArrangNumber = vars["preArrangNumber"] ?? null;

          return task;
        } catch (err) {
          console.error(`Error fetching vars for ${task.userTaskKey}`, err);
          return task;
        }
      })
    );
    
    // 🟦 Send to Angular frontend
    ws.send(JSON.stringify({
      count: count,
      type: "TASK_UPDATE",
      data: enrichedTasks
    }));

    count++;

  } catch (err) {
    console.error("Error during task fetch:", err);
  }
}


  // Poll every 10 seconds
  const interval = setInterval(sendTasks, 10000);
 // await sendTasks();
 setTimeout(sendTasks, 100);

  ws.on("close", () => {
    console.log("❌ WebSocket disconnected");
    clearInterval(interval);
  });
});


const PORT = 3001;
server.listen(PORT, () => console.log(`✅ WebSocket + REST server running on http://localhost:${PORT}`));
