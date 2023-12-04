/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IoC } from '@villedemontreal/workit-core';
import { Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import { CamundaBpmClient } from '../../src/camundaBpmClient';
import { SERVICE_IDENTIFIER } from '../../src/config/constants/identifiers';
import { logger } from '../../src/logger';
import { Utils } from '../../src/utils/utils';

let camundaClient: CamundaBpmClient;
let clientLib: { subscribe: jest.Mock<any>; start: jest.Mock<any>; stop: jest.Mock<any> };
describe('Camunda Client', () => {
  beforeEach(() => {
    const config = {
      maxTasks: 1,
      workerId: 'demo',
      baseUrl: `http://localhost:8080/engine-rest`,
      topicName: 'topic_demo',
      bpmnKey: 'BPMN_DEMO',
      autoPoll: false,
    };

    IoC.unbind(SERVICE_IDENTIFIER.logger);
    IoC.bindToObject(logger, SERVICE_IDENTIFIER.logger);

    const configuration = Utils.buildConfig(config);
    clientLib = new CamundaExternalClient(configuration) as any;

    clientLib.subscribe = jest.fn().mockReturnValue(undefined);
    clientLib.start = jest.fn().mockReturnValue(undefined);
    clientLib.stop = jest.fn().mockReturnValue(undefined);
    // issue with definition - fix with any
    camundaClient = new CamundaBpmClient(configuration, clientLib as any);
  });

  it('should be an instance of CamundaClient', () => {
    expect(camundaClient).toBeInstanceOf(CamundaBpmClient);
  });

  it('should call subscribe and start methods', async () => {
    await expect(camundaClient.subscribe(async () => Promise.resolve())).resolves.toBeUndefined();
    expect(clientLib.subscribe).toHaveBeenCalledTimes(1);
    expect(clientLib.start).toHaveBeenCalledTimes(1);
    expect(clientLib.stop).not.toHaveBeenCalled();
  });

  it('should call stop method', async () => {
    await expect(camundaClient.unsubscribe()).resolves.toBeUndefined();
    expect(clientLib.stop).toHaveBeenCalledTimes(1);
    expect(clientLib.subscribe).toHaveBeenCalledTimes(0);
    expect(clientLib.start).toHaveBeenCalledTimes(0);
  });
});
