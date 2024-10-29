import express from "express";
import SocketService from "./services/socket";
import { messagesConsumer } from "./services/kafka";

async function init() {
  const app = express();
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  const server = app.listen(PORT, () =>
    console.log(`server is listening on http://localhost:${PORT}`)
  );

  messagesConsumer();
  const socketService = new SocketService(server);

  socketService.initListeners();
}

init();
