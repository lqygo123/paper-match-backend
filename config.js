
module.exports = {
  MONGO_URL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017",
  // SGB_BASE_URL: process.env.SGB_BASE_URL || 'http://sgb-service.swan:8080',
  PORT: process.env.PORT || 3000,
  TASK_CONCURRENCY: process.env.TASK_CONCURRENCY || 2,
  DB_CONNECTION_OPTS: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}