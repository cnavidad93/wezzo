import http from 'http';
import StompServer from 'stomp-broker-js';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 3322;
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

stompServer.subscribe('/lock', (msg) => {
  console.log('[/lock] ', JSON.parse(msg));
});

app.post('/event', (req, res) => {
  console.log('[POST] /event', req.body);
  const { destination, message } = req.body;
  
  try {
    stompServer.send(destination, null, JSON.stringify(message));
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.use('/', express.static('public'));

console.log(`[WS] Websocket url: ws://localhost:${port}/ws`);
console.log(`[WS] UI url: localhost:${port}`);