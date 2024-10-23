import express from "express";
import SocketService from "./services/socket";
import cors from "cors";

async function init() {
  const app = express();
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  // app.use(cors({}));

  // app.get("/", (req, res) => {
  //   res.send("Hello World!");
  // });

  const server = app.listen(PORT, () =>
    console.log(`server is listening on http://localhost:${PORT}`)
  );

  const socketService = new SocketService(server);

  socketService.initListeners();
}

init();
