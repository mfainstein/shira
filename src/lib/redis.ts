import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisConnection(): Redis {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not set, using default localhost:6379");
    return new Redis({
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    });
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

export const redis = globalForRedis.redis ?? createRedisConnection();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

redis.on("close", () => {
  console.log("[Redis] Connection closed");
});

export default redis;
