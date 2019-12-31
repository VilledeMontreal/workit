/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import * as nock from 'nock';
import { Configs } from '../models/config';
import { ZBElasticClient } from '../repositories/zbElasticClient';

let api: ZBElasticClient;
const config = new Configs();

const elasticResponse = require('./data/elasticResponse.workflow');
const elasticAggResponse = require('./data/elasticResponseAggs.workflow');
const elasticEmptyResponse = require('./data/elasticEmptyResponse');
const bpmnProcessId = 'MESSAGE_EVENT';

// tslint:disable-next-line: max-func-body-length
describe('getWorkflows', () => {
  beforeAll(() => {
    api = new ZBElasticClient(config);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Should get workflows with no query', async () => {
    const query = { query: { bool: { must: [] } } };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticResponse);

    const response = await api.getWorkflows({});

    scope.done();
    expect(response.data).toMatchSnapshot();
  });

  it('Should get workflow by key', async () => {
    const key = 2251799813685250;
    const query = { query: { bool: { must: [{ match: { key: { query: key } } }] } } };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticResponse);

    const response = await api.getWorkflows({ key });
    scope.done();
    expect(response.data).toMatchSnapshot();
  });

  // Elasticsearch can't paginate topHits aggregation so we need to return all.
  // Other option is to use another exporter like postgresSQL
  it.skip('Should not get workflow by bpmnProcessId and latest version with "from" out of range', async () => {
    const query = {
      query: { bool: { must: [{ match: { bpmnProcessId: { query: bpmnProcessId } } }] } },
      aggs: { doc_with_latestVersion: { top_hits: { sort: [{ version: { order: 'desc' } }], size: 1 } } }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .query({ from: '1' })
      .reply(200, elasticAggResponse);

    const result = await api.getWorkflows({ bpmnProcessId, latestVersion: true }, { params: { from: 1 } });

    scope.done();
    expect(result.data).toMatchSnapshot();
    expect(result.data.hits.hits[0]).toBeUndefined();
  });

  it('Should not get workflow by bpmnProcessId with "from" out of range', async () => {
    const query = { query: { bool: { must: [{ match: { bpmnProcessId: { query: 'MESSAGE_EVENT' } } }] } } };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .query({ from: '1' })
      .reply(200, elasticEmptyResponse);
    const response = await api.getWorkflows({ bpmnProcessId }, { params: { from: 1 } });
    scope.done();
    expect(response.data).toMatchSnapshot();
  });

  it('Should get workflow by bpmnProcessId and latest version with "from" param', async () => {
    const query = {
      size: 0,
      query: { bool: { must: [{ match: { bpmnProcessId: { query: 'MESSAGE_EVENT' } } }] } },
      aggs: { doc_with_latestVersion: { top_hits: { sort: [{ version: { order: 'desc' } }], size: 1 } } }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticAggResponse);
    const result = await api.getWorkflows({ bpmnProcessId, latestVersion: true });

    scope.done();
    expect(result.data).toMatchSnapshot();
  });

  // Elasticsearch can't paginate topHits aggregation so we need to return all.
  // Other option is to use another exporter like postgresSQL
  it('Should get workflow by latest version', async () => {
    const query = {
      query: { bool: { must: [] } },
      size: 0,
      aggs: { doc_with_latestVersion: { top_hits: { sort: [{ version: { order: 'desc' } }], size: 1 } } }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticAggResponse);

    const result = await api.getWorkflows({ latestVersion: true });
    scope.done();
    expect(result.data).toMatchSnapshot();
  });

  it('Should get workflow by bpmnProcessId and version', async () => {
    const query = {
      query: {
        bool: { must: [{ match: { bpmnProcessId: { query: bpmnProcessId } } }, { match: { version: { query: 1 } } }] }
      }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticResponse);

    const result = await api.getWorkflows({ bpmnProcessId, version: 1 });
    scope.done();
    expect(result.data).toMatchSnapshot();
  });

  it('Should not get workflow with bad version but good bpmnProcessId', async () => {
    const query = {
      query: {
        bool: { must: [{ match: { bpmnProcessId: { query: bpmnProcessId } } }, { match: { version: { query: 0 } } }] }
      }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticEmptyResponse);

    const result = await api.getWorkflows({ bpmnProcessId, version: 0 });
    scope.done();
    expect(result.data).toMatchSnapshot();
  });

  it('Should get workflow by bpmnProcessId and latest version', async () => {
    const query = {
      query: { bool: { must: [{ match: { bpmnProcessId: { query: bpmnProcessId } } }] } },
      size: 0,
      aggs: { doc_with_latestVersion: { top_hits: { sort: [{ version: { order: 'desc' } }], size: 1 } } }
    };
    const scope = nock('http://localhost:9200')
      .post('/operate-workflow_alias/_search', query)
      .reply(200, elasticAggResponse);

    const result = await api.getWorkflows({ bpmnProcessId, latestVersion: true });
    scope.done();
    expect(result.data).toMatchSnapshot();
  });
});
