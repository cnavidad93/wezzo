#! /usr/bin/env node
import http from 'http';
import StompServer from 'stomp-broker-js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('[WZ] Options:');
  console.log('[WZ] -h / --help:    Show command help');
  console.log('[WZ] -p / --port:    Set the port to run the ws server');
  process.exit(1);
}

const getPort = (args) => {
  const portIndex = args.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portIndex === -1) {
    return null;
  }

  const port = args[portIndex + 1];
  if (!port) {
    console.error('[WZ] ERROR:  Port not provided');
    process.exit(1);
  }

  if (isNaN(port)) {
    console.error('[WZ] ERROR: Port must be a number');
    process.exit(1);
  }

  if (port < 1024 || port > 49151) {
    console.error('[WZ] ERROR: Port must be between 1024 and 49151');
    process.exit(1);
  }

  return port;
};

const port = getPort(process.argv) || 3322;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);

const server = http.createServer(app);
server.listen(port);

const stompServer = new StompServer({
  server,
  debug: console.log,
  path: '/ws',
  protocol: 'ws',
});

app.post('/event', (req, res) => {
  const { destination, message } = req.body;
  console.log(`[WZ] Sending message to ${destination}: `, message);

  try {
    stompServer.send(destination, null, JSON.stringify(message));
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.use('/', express.static(path.join(__dirname, 'public')));

console.log(`[WZ] Websocket url: ws://localhost:${port}/ws`);
console.log(`[WZ] UI url: localhost:${port}`);
console.log(``);
console.log(`[WZ] Server log:`);
