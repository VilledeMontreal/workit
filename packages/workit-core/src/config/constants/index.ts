/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export class Constants {
  private static _instance: Readonly<Constants>;

  private _envs: { dev: string; accept: string; prod: string };

  private constructor() {
    this._envs = {
      // ==========================================
      // "development" seems to be the standard Node label, not "dev".
      // The node-config library uses this :
      // https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
      // ==========================================
      dev: 'development',
      accept: 'acceptation',
      // ==========================================
      // "production" seems to be the standard Node label, not "prod".
      // ==========================================
      prod: 'production'
    };
  }

  /**
   * Singleton
   * @readonly
   * @static
   * @type {Constants}
   * @memberof Constants
   */
  public static get instance(): Readonly<Constants> {
    if (!this._instance) {
      this._instance = Object.freeze(new Constants());
    }
    return this._instance;
  }

  /**
   * Known environment types
   * @readonly
   * @memberof Constants
   */
  public get envs() {
    return this._envs;
  }
}

export const constants: Readonly<Constants> = Constants.instance;
