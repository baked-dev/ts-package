const { createProgram } = require("typescript");
const { parentPort } = require("worker_threads");

parentPort.on("message", ({ files, config }) => {
  createProgram(files, config).emit();
  process.exit(1);
});