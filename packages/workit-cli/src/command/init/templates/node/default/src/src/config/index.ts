import * as config from 'config';
import { ENV } from '../enums/environment';
import { ICamundaConfig } from '../specs/camundaConfig';

let message = `\n------------------------------------\n`;
message += `Configuration files loaded:\n`;
const sources = config.util.getConfigSources();
for (const source of sources) {
  message += `- ${source.name}\n`;
}
message += `------------------------------------\n`;
// tslint:disable:no-console
console.log(message);

/**
 * Configurations for the application.
 */
export class Configs {
  private static _instance: Configs;

  // ==========================================
  // The environment name is found by node-config. It will
  // use the "NODE_ENV" environment variable or fallback to
  // "development" if not found.
  // @see https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
  // ==========================================
  private readonly _environment: string;
  private readonly _camunda: Readonly<ICamundaConfig>;
  private constructor() {
    this._environment = config.util.getEnv('NODE_ENV');
    this._camunda = {
      workerId: config.get<string>('camunda.workerId'),
      baseUrl: config.get<string>('camunda.baseUrl'),
      maxTasks: config.get<number>('camunda.maxTasks'),
      topicName: config.get<string>('camunda.topicName'),
      maxRetry: config.get<number>('camunda.maxRetry')
    };
  }

  /**
   * Singleton
   */
  static get instance(): Configs {
    if (!this._instance) {
      this._instance = new Configs();
    }
    return this._instance;
  }

  /**
   * Current environment info.
   */
  get environment() {
    return {
      type: this._environment,
      isDev: this._environment === ENV.DEV,
      isAcc: this._environment === ENV.ACCEPTATION,
      isProd: this._environment === ENV.PROD
    };
  }

  /**
   * Camunda configs
   */
  get camunda(): Readonly<ICamundaConfig> {
    return this._camunda;
  }
}

export const configs: Configs = Configs.instance;
