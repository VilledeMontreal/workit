/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { SERVICE_IDENTIFIER } from '../../../config/constants/identifiers';
import { ICamundaConfig } from '../specs/camundaConfig';
import { ICreateWorkflowInstanceResponse } from '../specs/createWorkflowInstanceResponse';
import { IHttpResponse } from '../specs/httpResponse';
import { IIncident } from '../specs/incident';
import { IProcessDefinition } from '../specs/processDefinition';
import { IProcessXmlDefinition } from '../specs/processXmlDefinition';
import { IResolveIncident } from '../specs/resolveIncident';
import { Utils } from '../utils';
export interface ICamundaRepository {
  deployWorkflow(deployName: string, absPath: string): Promise<IHttpResponse<IBpmnDeployResponse>>;
  getWorkflows(options?: { params: {} }): Promise<IHttpResponse<IBpmn[]>>;
  getWorkflowCount(options?: { params: {} }): Promise<IHttpResponse<{ count: number }>>;
  getWorkflow(idOrKey: string): Promise<IProcessDefinition & IProcessXmlDefinition>;
  updateVariables<T = any>(processInstanceId: string, variables: T): Promise<IHttpResponse<void>>;
  updateJobRetries(id: string, retries: number): Promise<IHttpResponse<void>>;
  createWorkflowInstance<T = any>(idOrKey: string, variables: T);
  publishMessage<T = any, K = any>({
    messageName,
    processInstanceId,
    variables,
    correlationKeys
  }: {
    messageName: string;
    processInstanceId: string;
    variables: T;
    correlationKeys: K;
  });
  resolveIncident(incidentKey: string): Promise<void>;
  cancelWorkflowInstance(id: string): Promise<void>;
}
@injectable()
export class CamundaRepository implements ICamundaRepository {
  private static getworkflowInstanceUrl(idOrKey: string) {
    let url = `/process-definition`;
    if (idOrKey.split(':').length === 3) {
      url += `/${idOrKey}/start`;
    } else {
      url += `/key/${idOrKey}/start`;
    }
    return url;
  }
  private static setStaticHeaders(configs: ICamundaConfig, headers: any) {
    if (configs.interceptors) {
      // TODO: improve this part.
      const basicAuthFunc = (configs.interceptors as any).find((func: any) => func.name === 'bound interceptor');
      let camundaConfig = { headers: {} };
      if (basicAuthFunc) {
        camundaConfig = basicAuthFunc({});
      }
      return Object.assign(headers, camundaConfig.headers);
    }
    return headers;
  }
  private readonly _request: AxiosInstance;
  private readonly _headers: any;
  private readonly _configs: ICamundaConfig;
  constructor(@inject(SERVICE_IDENTIFIER.camunda_external_config) configs: ICamundaConfig) {
    this._configs = configs;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-APP': this._configs.workerId || 'unknow'
    };
    this._headers = CamundaRepository.setStaticHeaders(configs, headers);
    this._request = axios.create({
      baseURL: this._configs.baseUrl,
      timeout: 30000,
      headers: this._headers
    });
  }
  public deployWorkflow(deployName: string, absPath: string): Promise<IHttpResponse<IBpmnDeployResponse>> {
    const formData = new FormData();
    const xmlStream = fs.createReadStream(absPath);
    formData.append('deployment-name', deployName);
    formData.append('process', xmlStream);
    return this._request.post('/deployment/create', formData, {
      headers: Object.assign({}, this._headers, {
        'content-type': `multipart/form-data; boundary=${formData.getBoundary()}`
      })
    });
  }
  public getWorkflows(options?: { params: {} }): Promise<IHttpResponse<IBpmn[]>> {
    return this._request.get('/process-definition', options);
  }
  public getWorkflowCount(options?: { params: {} }): Promise<IHttpResponse<{ count: number }>> {
    return this._request.get('/process-definition/count', options);
  }
  public createWorkflowInstance<T = any>(
    idOrKey: string,
    variables: T
  ): Promise<IHttpResponse<ICreateWorkflowInstanceResponse>> {
    const url = CamundaRepository.getworkflowInstanceUrl(idOrKey);
    return this._request.post(url, {
      businessKey: typeof variables === 'object' ? (variables as any).businessKey : undefined,
      variables: Utils.serializeVariables(variables)
    });
  }
  /**
   * Message can be correlated to a message start event or an intermediate message catching event.
   */
  public async publishMessage<T = any, K = any>({
    messageName,
    processInstanceId,
    variables,
    correlationKeys
  }: {
    messageName: string;
    processInstanceId: string;
    variables: T;
    correlationKeys: K;
  }) {
    await this._request.post('/message', {
      messageName,
      processInstanceId,
      correlationKeys: Utils.serializeVariables(correlationKeys),
      businessKey: typeof variables === 'object' ? (variables as any).businessKey : undefined,
      processVariables: Utils.serializeVariables(variables),
      resultEnabled: false,
      all: true // same behaviour than Zeebe
    });
  }
  public async cancelWorkflowInstance(id: string): Promise<void> {
    await this._request.delete(
      `/process-instance/${id}?skipCustomListeners=true&skipIoMappings=true&skipSubprocesses=true`
    );
  }
  public async getIncident(incidentKey: string): Promise<IIncident> {
    const response: IHttpResponse<IIncident[]> = await this._request.get(`/incident/?incidentId=${incidentKey}`);
    return response.data[0];
  }
  public async resolveIncident(incidentKey: string): Promise<void> {
    const incident = await this.getIncident(incidentKey);
    // check if type is for external task
    await this._request.post(`/process-instance/${incident.processInstanceId}/modification`, {
      skipCustomListeners: true,
      skipIoMappings: true,
      instructions: [
        {
          type: 'cancel', // change for enum
          activityId: incident.activityId
        }
      ]
    } as IResolveIncident);
  }
  public async getWorkflow(idOrKey: string): Promise<IProcessDefinition & IProcessXmlDefinition> {
    if (!idOrKey) {
      throw new Error('Id or Key must be specified');
    }

    let basePath = '/process-definition';
    if (idOrKey.split(':').length !== 3) {
      basePath += '/key';
    }

    const pDef = this._request.get(`${basePath}/${idOrKey}`);
    const pDefXml = this._request.get(`${basePath}/${idOrKey}/xml`);
    const results = await Promise.all([pDef, pDefXml]);
    const payload = results[0].data;
    payload.bpmn20Xml = results[1].data.bpmn20Xml;
    return Promise.resolve(payload);
  }
  public updateJobRetries(id: string, retries: number): Promise<IHttpResponse<void>> {
    return this._request.put(`/external-task/${id}/retries`, {
      retries
    });
  }
  public updateVariables<T = any>(
    processInstanceId: string,
    variables: T,
    local: boolean = false
  ): Promise<IHttpResponse<void>> {
    return this._request.post(`/process-instance/${processInstanceId}/variables`, {
      modifications: Utils.serializeVariables(variables, local)
    });
  }
}
