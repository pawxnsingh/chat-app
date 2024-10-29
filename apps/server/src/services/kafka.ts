import { Kafka, Producer } from "kafkajs";
import prismaClient from "./prisma";

const kafka = new Kafka({
  clientId: "chat-app-client",
  brokers: ["localhost:9092 "],
});

// i dont want to create producer again and again
let producer: null | Producer = null;
export async function createProducer() {
  if (producer) {
    return producer;
  }
  const _producer = kafka.producer({});
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    topic: "MESSAGES",
    messages: [
      {
        value: message,
        key: `message-${Date.now()}`,
      },
    ],
  });

  // just tell that message is sent
  return true;
}

export async function messagesConsumer() {
  console.log("Consumer is Running.....");
  const consumer = kafka.consumer({
    groupId: "default",
  });

  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ pause, topic, message }) => {
      if (!message) return;

      console.log(`new message received: ${message}`);

      const text = JSON.parse(message.value?.toString()!);
      console.log({ text });

      const msg = text?.message;
      console.log({ msg });

      try {
        await prismaClient.message.create({
          data: {
            text: msg,
          },
        });
        console.log("created db entry");
      } catch (error) {
        console.log("something went wrong ....");
        pause();
        setTimeout(() => {
          consumer.resume([
            {
              topic: "MESSAGES",
            },
          ]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
