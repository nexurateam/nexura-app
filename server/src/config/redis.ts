import Redis from "ioredis";

import logger from "./logger";

import { environment, COOLIFY_REDIS, REDIS_URI, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME } from "@/utils/env.utils";

let redis: Redis;

if (environment !== "development")
  redis = new Redis(COOLIFY_REDIS, { maxRetriesPerRequest: null });
else
  redis = new Redis({
    host: REDIS_URI,
    maxRetriesPerRequest: null,
    password: REDIS_PASSWORD,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
  });

redis.on("connect", () => {
  logger.info({ module: "REDIS", msg: "🔌 Redis connected" });
});

redis.on("ready", () => {
  logger.info({ module: "REDIS", msg: "✅ Redis ready" });
});

redis.on("error", (error: any) => {
  logger.error({ module: "REDIS", msg: "❌ Redis error", data: error });
});

redis.on("end", () => {
  logger.warn({ module: "REDIS", msg: "⚠️ Redis connection closed" });
});

redis.on("reconnecting", (time: number) => {
  logger.warn({ module: "REDIS", msg: `♻️ Redis reconnecting in ${time}ms` });
});

export { redis };
