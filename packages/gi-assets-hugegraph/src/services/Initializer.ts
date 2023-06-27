import { utils } from '@antv/gi-sdk';
import { message } from 'antd';
import request from 'umi-request';
import $i18n from '../i18n';
export const GI_SERVICE_INTIAL_GRAPH = {
  name: $i18n.get({ id: 'hugegraph.src.services.Initializer.InitializeAQuery', dm: '初始化查询' }),
  service: async () => {
    return new Promise(resolve => {
      resolve({
        nodes: [],
        edges: [],
      });
    });
  },
};

export const GI_SERVICE_SCHEMA = {
  name: $i18n.get({ id: 'hugegraph.src.services.Initializer.QueryGraphModel', dm: '查询图模型' }),
  service: async () => {
    let res = {
      nodes: [],
      edges: [],
    };
    const {
      engineServerURL: uri,
      CURRENT_SUBGRAPH: graphId,
      HTTP_SERVICE_URL: httpServerURL,
    } = utils.getServerEngineContext();

    if (!uri) {
      // 没有登录信息，需要先登录再查询 schema
      message.error(
        $i18n.get({
          id: 'hugegraph.src.services.Initializer.HugegraphDataSourceConnectionFailed',
          dm: 'HugeGraph 数据源连接失败: 没有获取到连接 HugeGraph 数据库的连接信息，请先连接 HugeGraph 数据库再进行尝试！',
        }),
      );
      return;
    }

    try {
      const result = await request(`${httpServerURL}/api/hugegraph/schema`, {
        method: 'POST',
        data: { graphId, uri },
      });

      if (result.success) {
        res = result.data;
      }
      return res;
    } catch (e) {
      message.error(
        $i18n.get(
          {
            id: 'hugegraph.src.services.Initializer.GraphModelQueryFailedE',
            dm: '图模型查询失败: {e}',
          },
          { e: e },
        ),
      );
    }
    return res;
  },
};
