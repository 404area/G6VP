import { utils } from '@antv/gi-sdk';
import { notification } from 'antd';
import { formatterCypherResult } from './ServerComponent/utils';
import request from 'umi-request';
import $i18n from '../i18n';

export const CypherQuery = {
  name: $i18n.get({ id: 'galaxybase.src.services.CypherQuery.GraphStatementQuery', dm: '图语句查询' }),
  service: async (params = {}) => {
    const { value } = params as any;
    const { GALAXYBASE_USER_TOKEN, CURRENT_GALAXYBASE_SUBGRAPH, HTTP_SERVICE_URL } = utils.getServerEngineContext();

    // const graphName = localStorage.getItem('CURRENT_GALAXYBASE_SUBGRAPH') || 'default';

    const response = await request(`${HTTP_SERVICE_URL}/api/cypher/commit`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GALAXYBASE_USER_TOKEN,
      },
      data: JSON.stringify({
        statements: [
          {
            statement: value,
            resultDataContents: ['graph'],
          },
        ],

        graphName: CURRENT_GALAXYBASE_SUBGRAPH,
      }),
    });
    const { status, success, errors, results } = response;
    if (!success && errors && errors.length > 0) {
      notification.error({
        message: $i18n.get({
          id: 'galaxybase.src.services.CypherQuery.FailedToExecuteCypherQuery',
          dm: '执行 Cypher 查询失败',
        }),
        description: $i18n.get(
          {
            id: 'galaxybase.src.services.CypherQuery.QueryFailedErrorsmessage',
            dm: '查询失败：{errorsMessage}',
          },
          { errorsMessage: errors[0].message },
        ),
      });
      return {
        nodes: [],
        edges: [],
      };
    }
    if (status === 412) {
      notification.error({
        message: $i18n.get({
          id: 'galaxybase.src.services.CypherQuery.EngineAuthenticationFailedCheckThe',
          dm: '引擎认证失败：请检查数据集',
        }),
        description: errors[0].message,
      });
      return {
        nodes: [],
        edges: [],
      };
    }

    let { nodes, edges } = formatterCypherResult(results);
    return {
      nodes,
      edges,
    };
  },
};
