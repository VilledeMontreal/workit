/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IMessage, IStepFunctionClientConfig, IncidentException } from '@villedemontreal/workit-types';
import { StepFunctionClient } from '../sfnClient';
import * as fs from 'fs/promises';

import {
  CreateStateMachineCommand,
  StartExecutionCommand,
  CreateStateMachineCommandInput,
  CreateStateMachineCommandOutput,
  StartExecutionCommandInput,
  StartExecutionCommandOutput,
  SendTaskSuccessCommand,
  SendTaskSuccessCommandOutput,
  SendTaskFailureCommand,
  SendTaskFailureCommandOutput,
  SendTaskHeartbeatCommandOutput,
  SendTaskHeartbeatCommand,
} from '@aws-sdk/client-sfn';

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stringify = require('fast-safe-stringify');

export class StepFunctionRepository {
  private readonly _config: IStepFunctionClientConfig;

  private readonly _client: StepFunctionClient;

  constructor(config: IStepFunctionClientConfig) {
    this._config = config;
    this._client = new StepFunctionClient(this._config);
  }

  public async deployWorkflow(
    absPath: string,
    override?: CreateStateMachineCommandInput,
  ): Promise<CreateStateMachineCommandOutput> {
    const workflow = (await fs.readFile(absPath)).toString();
    const input = Object.assign({ definition: workflow }, override);
    const command = new CreateStateMachineCommand(input);
    return this._client.send(command);
  }

  public startExecution<T>(model: StartExecutionCommandInput): Promise<StartExecutionCommandOutput> {
    const command = new StartExecutionCommand(model);
    return this._client.send(command);
  }

  public sendTaskSuccess(message: IMessage): Promise<SendTaskSuccessCommandOutput> {
    const payload = JSON.stringify(message.body);

    if (payload.length > 262144) {
      throw new IncidentException("payload (message.body) can't exceed 256KB");
    }

    const params = { output: message.body ? payload : '{}', taskToken: message.properties.jobKey };
    const command = new SendTaskSuccessCommand(params);
    return this._client.send(command);
  }

  public sendTaskFailure(error: NodeJS.ErrnoException, message: IMessage): Promise<SendTaskFailureCommandOutput> {
    const params = {
      cause: stringify(error).substring(0, 32768),
      taskToken: message.properties.jobKey,
      error: (error.code || error.name || 'UnhandledException').substring(0, 256),
    };
    const command = new SendTaskFailureCommand(params);
    return this._client.send(command);
  }

  public sendTaskHeartbeat(message: IMessage): Promise<SendTaskHeartbeatCommandOutput> {
    const params = {
      taskToken: message.properties.jobKey,
    };
    const command = new SendTaskHeartbeatCommand(params);
    return this._client.send(command);
  }
}
