import { WebSocketServer } from "ws";
import Redis from "ioredis";
import http from "http";
import { produceMessage } from "./kafka";

// here we need two connection with redis one for publishing and one for subscribing
// so we need to create two instances of redis
// we need to open two open connection with the

// -- working
const pub = new Redis("redis://localhost:6379");

const sub = new Redis("redis://localhost:6379");

class SocketService {
  private _wss: WebSocketServer;

  constructor(server: http.Server) {
    console.log("Init Socker Service....");
    this._wss = new WebSocketServer({ server });
    // here this got initialized and

    sub.subscribe("MESSAGES", (err, count) => {
      if (err) {
        console.error("Failed to subscribe: %s", err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels`
        );
      }
    });

    // subscribing the messages from the redis
    sub.on("message", async (channel, message) => {
      console.log(`Recieved message from channel ${channel}: ${message}`);

      if (channel === "MESSAGES") {
        // broadcast the message to all connected Websocket clients
        this._wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
        // we will push this message to the kafka
        await produceMessage(message);
        console.log("messages produced to the kafka broker");
      }
    });
  }

  public initListeners() {
    const wss = this.wss;
    console.log("Init WSocket Listeners...");

    wss.on("connection", (ws) => {
      ws.on("error", console.error);
      console.log(`New Socker Connected`);
      // w'll get our message here
      ws.on("message", async (data) => {
        try {
          console.log(`New Message recieved: ${data}`);

          const textMessage = data.toString("utf-8");

          console.log({ textMessage });

          const messageToPublish = {
            message: textMessage,
            timestamp: new Date().toISOString(),
          };

          // here we need to publish it to the pubsub
          // the publish part is working fine
          // i need to subscribe to it as well
          await pub.publish("MESSAGES", JSON.stringify(messageToPublish));
        } catch (error) {
          console.log("Error processing message: ", error);
        }
      });
    });
  }

  get wss() {
    return this._wss;
  }
}

export default SocketService;
