import { Worker, workerData, isMainThread, parentPort } from "worker_threads";

export default class AsyncTask<T extends (...args: any[]) => any> {
  constructor(private task: T, private filename: string) {
    if (!isMainThread) {
      try {
        const result = this.task(...workerData);
        if (result instanceof Promise) {
          result
            .then((result) => {
              parentPort!.emit("message", { result });
            })
            .catch((err) => {
              parentPort!.emit("message", { err });
            });
        } else {
          parentPort!.emit("message", { result });
        }
      } catch (err) {
        parentPort!.emit("message", { err });
      }
    }
  }

  public async run(
    ...args: Parameters<T>
  ): Promise<ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>> {
    const worker = new Worker(this.filename, {
      workerData: [...args],
      execArgv: this.filename.endsWith(".ts")
        ? ["-r", "ts-node/register/transpile-only"]
        : undefined,
    });
    return new Promise<
      ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>
    >((resolve, reject) => {
      worker.on("message", (message: { err: any } | { result: any }) => {
        worker.terminate().then(() => {
          if ("err" in message) reject(message.err);
          else resolve(message.result);
        });
      });
    });
  }
}
