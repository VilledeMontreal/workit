import axios, { AxiosInstance } from 'axios';
import { HttpMethods } from '../enums/httpMethods';
import { Configs } from '../models/config';
import { IElasticDocument } from '../models/elasticDocument';
import { IElasticResponse } from '../models/elasticResponse';
import { IWorkflow } from '../models/workflows/workflow';
import { IWorkflowQuery } from '../models/workflows/workflowQuery';
import { IEndpoints } from '../specs/apiConfig';
import { IOptions } from '../specs/options';
import { IResponse } from '../specs/response';
import { Utils } from '../utils/utils';

export class ZBElasticClient {
  private readonly _request: AxiosInstance;
  private readonly _urls: IEndpoints;
  constructor(configs: Configs) {
    const config = configs.elastic;
    const _url = configs.elastic.url;
    const endpoints = configs.elastic.endpoints;
    this._urls = endpoints;
    this._request = axios.create({
      baseURL: _url,
      timeout: config.timeout,
      maxRedirects: config.retry,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    Utils.addInterceptors(this._request, configs.elastic.interceptors);
  }

  public getWorkflowById(id: string, options?: Partial<IOptions>): Promise<IResponse<IElasticDocument<IWorkflow>>> {
    const localUrl = `${this._urls.workflows}/_doc/${id}`;
    return this.get(localUrl, options);
  }

  public async getWorkflows(
    model: Partial<IWorkflowQuery>,
    options?: Partial<IOptions>
  ): Promise<IResponse<IElasticResponse<IWorkflow>>> {
    const localUrl = `${this._urls.workflows}/_search`;
    const q = this.buildWorkflowQuery(model);
    const response = await this.send<IElasticResponse<IWorkflow>, any>(HttpMethods.POST, localUrl, q, options);

    if (model.latestVersion) {
      // TODO: make a guard (e.g IElasticResponse<IWorkflow> | IElasticAggResponse<IWorkflow>)
      let data = response.data;
      const aggs = (data as any).aggregations;
      if (aggs) {
        data = {
          _shards: data._shards,
          timed_out: data.timed_out,
          took: data.took,
          hits: aggs.doc_with_latestVersion.hits
        };
      }

      return {
        headers: response.headers,
        data,
        status: response.status,
        statusText: response.statusText
      };
    }

    return response;
  }

  protected send<T, K = T>(
    verb: HttpMethods,
    pUrl: string,
    doc: K,
    options?: Partial<IOptions>
  ): Promise<IResponse<T>> {
    const _options = options || ({} as any);
    return this._request(pUrl, {
      method: verb,
      data: doc,
      params: _options.params,
      withCredentials: true,
      headers: _options.headers
    });
  }

  protected get<T>(pUrl: string, options?: Partial<IOptions>): Promise<IResponse<T>> {
    const _options = options || ({} as any);
    return this._request(pUrl, {
      method: HttpMethods.GET,
      params: _options.params,
      withCredentials: true,
      headers: _options.headers
    });
  }

  // TODO: use filter not just must for querying elasticsearch, in order to activate caching
  private buildWorkflowQuery(model: Partial<IWorkflowQuery>): any {
    // TODO: Improve with query builder pattern when time
    const q: any = {
      query: {
        bool: {
          must: [] as any[]
        }
      }
    };

    const key = model.key;
    if (key) {
      const mustMatchKey = {
        match: {
          key: {
            query: key
          }
        }
      };
      q.query.bool.must.push(mustMatchKey);
    } else if (model.bpmnProcessId) {
      const mustMatchBpmnProcessId = {
        match: {
          bpmnProcessId: {
            query: model.bpmnProcessId
          }
        }
      };
      q.query.bool.must.push(mustMatchBpmnProcessId);
    }
    const hasVersionParam = typeof model.version === 'number';
    if (!model.key && !hasVersionParam && model.latestVersion) {
      q.size = 0;
      q.aggs = {
        doc_with_latestVersion: {
          top_hits: {
            sort: [
              {
                version: {
                  order: 'desc'
                }
              }
            ],
            size: 1
          }
        }
      };
    } else if (hasVersionParam) {
      const mustMatchVersion = {
        match: {
          version: {
            query: model.version
          }
        }
      };
      q.query.bool.must.push(mustMatchVersion);
    }

    return q;
  }
}
