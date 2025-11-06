import { app } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      console.log(`API server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start API server", error);
    process.exit(1);
  }
};

start();
