// import { ZBWorkerOptions } from "zeebe-node";

export interface IZeebeWorkerOptions {
  /**
   * Max concurrent tasks for this worker. Default 32.
   */
  maxActiveJobs: number;
  /**
   * Max ms to allow before time out of a task given to this worker. Default: 1000ms.
   */
  timeout: number;
  /**
   * Poll Interval in ms. Default 100.
   */
  pollInterval: number;
  /**
   * Constrain payload to these keys only.
   */
  fetchVariables: string[];
  /**
   * This handler is called when the worker cannot connect to the broker, or loses its connection.
   */
  onConnectionErrorHandler: (err: any) => void;
}
