import { ZBClient } from 'zeebe-node';
import fs from 'fs';

// Initialize Zeebe client
const zbc = new ZBClient({
  hostname: process.env.ZEEBE_ADDRESS || 'localhost',
  useTLS: false, // important for self-managed setup
  oAuth: {
    url:
      process.env.ZEEBE_AUTHORIZATION_SERVER_URL ||
      'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
    clientId: process.env.ZEEBE_CLIENT_ID || 'orchestration',
    clientSecret: process.env.ZEEBE_CLIENT_SECRET || 'secret',
  },
});

// Optional: rotation tracking for reproducibility (not required for random numbers)
const rotationFile = './prearrang-counter.json';

function getLastNumber() {
  if (!fs.existsSync(rotationFile)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(rotationFile, 'utf8'));
    return data.last ?? 0;
  } catch {
    return 0;
  }
}

function saveLastNumber(last) {
  fs.writeFileSync(rotationFile, JSON.stringify({ last }));
}

// Start worker
zbc.createWorker({
  taskType: 'generate-prearrang-num', // your BPMN task type
  taskHandler: async (job) => {
    // Option 1: purely random 6-digit number (FEEL-style)
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    // Option 2: sequential number (uncomment to use sequential logic)
    // const last = getLastNumber();
    // const next = (last % 999999) + 1; // cycle through 1–999999
    // saveLastNumber(next);
    // const randomNum = String(next).padStart(6, '0');

    console.log(`🎯 Generated preArrangNumber: ${randomNum}`);

    // Complete the job and pass variable to Camunda
    await job.complete({ preArrangNumber: randomNum ,gopNumber: randomNum});
  },
});


