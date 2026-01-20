module.exports = {
  apps: [
    {
      name: "negevtime",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/app",
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
