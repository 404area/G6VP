import type { GISiteParams } from '@antv/gi-sdk';
import { utils } from '@antv/gi-sdk';
import { notification } from 'antd';
import { getSearchParams } from '../../components/utils';
import { queryDatasetInfo } from '../../services/dataset';

import * as ProjectServices from '../../services/project';
import { getComponentsByAssets, getElementsByAssets } from './getAssets';
import getLayoutsByAssets from './getAssets/getLayoutsByAssets';
import $i18n from '../../i18n';
const { generatorSchemaByGraphData, generatorStyleConfigBySchema } = utils;
export { generatorSchemaByGraphData, generatorStyleConfigBySchema };

export const isObjectEmpty = obj => {
  return Object.keys(obj).length === 0;
};
export const queryActiveAssetsInformation = ({ assets, data, config, serviceConfig, schemaData, engineId }) => {
  const components = getComponentsByAssets(assets.components, data, serviceConfig, config, schemaData, engineId);
  const elements = getElementsByAssets(assets.elements, data, schemaData);
  const layouts = getLayoutsByAssets(assets.layouts, data, schemaData);
  return {
    components,
    elements,
    layouts,
  };
};

/** 更新站点的 SCHEMA 和 DATA */
export const getUpdateGISite =
  ({ config, projectId, activeAssetsKeys }) =>
  (params: GISiteParams) => {
    if (!params) {
      return false;
    }
    let { data, schemaData, tag, engineId, engineContext, projectConfig: ENGINE_PROJECT_CONFIG } = params;

    if (!schemaData || !engineId) {
      notification.error({
        message: $i18n.get({ id: 'gi-site.pages.Analysis.utils.FailedToStartTheService', dm: '服务引擎启动失败' }),
        description: $i18n.get({
          id: 'gi-site.pages.Analysis.utils.NoGraphModelIsFound',
          dm: '没有查询到图模型，请检查接口是否正常',
        }),
      });
      return false;
    }
    const style = utils.generatorStyleConfigBySchema(schemaData);
    const preContext = JSON.parse(localStorage.getItem('SERVER_ENGINE_CONTEXT') || '{}');
    let projectConfig;

    const IS_INITIAL_STYLE = config.nodes?.length === 1 && config.edges?.length === 1;
    if (preContext.engineId === engineId && !IS_INITIAL_STYLE) {
      projectConfig = {
        ...ENGINE_PROJECT_CONFIG, //引擎设置的拥有最低优先级
        ...style, // GI默认生成的节点和边的样式
        ...config, // 默认的GI配置
      };
    } else {
      projectConfig = {
        ...config, // 默认的GI配置
        ...style, // GI默认生成的节点和边的样式
        ...ENGINE_PROJECT_CONFIG, //引擎设置的拥有最高优先级
      };
    }

    const updateParams = {
      engineId,
      engineContext,
      schemaData,
      projectConfig,
    };

    updateParams['activeAssetsKeys'] = {
      ...activeAssetsKeys,
      components: projectConfig.components.map(item => item.id),
    };
    if (data) {
      updateParams['data'] = data;
    }

    ProjectServices.updateById(projectId, updateParams).then(res => {
      notification.success({
        message: $i18n.get({
          id: 'gi-site.pages.Analysis.utils.ServiceEngineStartedSuccessfully',
          dm: '服务引擎启动成功',
        }),
        description: $i18n.get({
          id: 'gi-site.pages.Analysis.utils.TheServiceEngineStartedSuccessfully',
          dm: '服务引擎启动成功,正在重启窗口',
        }),
      });
      utils.setServerEngineContext({
        GI_SITE_PROJECT_ID: projectId,
        engineId: engineId,
      });
      setTimeout(() => {
        window.location.reload();
      }, 200);
    });
  };

/**
 * 判断是否是引擎系统间直连，直接在GI上展示
 * @returns
 */
export const useEngineSystemDirectConnect = async (projectId: string) => {
  const { searchParams } = getSearchParams(window.location);
  const IS_ENGINE_SYSTEM_DIRECT_CONNECT = projectId === 'ENGINE_SYSTEM_DIRECT_CONNECT';
  const datasetInfoString = searchParams.get('datasetInfo');
  // 如果 URL中 直接带有这个参数，则直接解析使用
  if (datasetInfoString && IS_ENGINE_SYSTEM_DIRECT_CONNECT) {
    try {
      const datasetInfo = JSON.parse(decodeURIComponent(datasetInfoString));

      return datasetInfo;
    } catch (error) {
      console.log('dataInfo parse error', error);
      return false;
    }
  }
  return false;
};

export const useDatasetInfo = async datasetId => {
  const { searchParams } = getSearchParams(window.location);
  const datasetInfoString = searchParams.get('datasetInfo');
  let datasetInfo;
  // 如果 URL中 直接带有这个参数，则直接解析使用
  if (datasetInfoString) {
    try {
      datasetInfo = JSON.parse(decodeURIComponent(datasetInfoString));
    } catch (error) {
      console.log('dataInfo parse error', datasetInfo);
    }
  } else {
    // 正常情况，是根据datasetId查询需要的数据集信息
    datasetInfo = await queryDatasetInfo(datasetId);
  }
  return datasetInfo;
};
