import * as nock from 'nock';
import { Configs } from '../models/config';
import { ZBElasticClient } from '../repositories/zbElasticClient';

let api: ZBElasticClient;
const config = new Configs();

const elasticResponseById = require('./data/elasticResponseById.workflow');

describe('getWorkflowById', () => {
  beforeAll(() => {
    api = new ZBElasticClient(config);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Should get workflow by id', async () => {
    const _id = '2251799813685249';
    const scope = nock('http://localhost:9200')
      .get(`/operate-workflow_alias/_doc/${_id}`)
      .reply(200, elasticResponseById);

    const response = await api.getWorkflowById(_id);
    scope.done();
    expect(response.data).toMatchSnapshot();
  });
});
