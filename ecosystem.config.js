module.exports = {
  apps: [
    {
      name: "negevtime",
      script: "yarn",
      args: "start",
      instances: "max", // number of CPU cores
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
