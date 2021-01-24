module.exports = {
  apps : [{
    name: "battlepang-backend",
    script: "npm",
    args: "start",
    instances: "max",
    listen_timeout: 50000, 
    kill_timeout: 5000, 
    max_memory_restart: "256M",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};