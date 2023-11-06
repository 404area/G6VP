import { GraphinData, IUserEdge } from '@antv/graphin';
import SimpleEdge from '../components/SimpleEdge';
import SimpleNode from '../components/SimpleNode';
import { GIAssets, GIConfig } from '../typing';
import { uniqueElementsBy } from './common';
import { filterByRules } from './filterByRules';
import processEdges from './processEdges';

/**
 *
 * @param elementType 元素类型：node or edge
 * @param data 数据
 * @param config GISDK配置
 * @param ElementAssets 元素资产
 * @param reset 是否重置transform
 * @returns nodes or edges
 */
export const transDataByConfig = (
  elementType: 'nodes' | 'edges',
  data: GraphinData,
  config: Partial<GIConfig>,
  ElementAssets: GIAssets['elements'],
  reset?: boolean,
) => {
  console.time(`${elementType.toUpperCase()}_TRANS_COST`);

  const elementConfig = config[elementType];

  if (!elementConfig) {
    return {};
  }

  let elementData = data[elementType];

  if (elementType === 'edges') {
    // 先整体做个多边处理
    elementData = processEdges(elementData as IUserEdge[], {
      poly: 40,
      loop: 10,
    });
  }

  const [basicConfig, ...otherConfigs] = elementConfig;

  const filterElements = otherConfigs
    .map(item => {
      //@ts-ignore
      const { id, expressions, logic } = item;
      if (!ElementAssets) {
        return [];
      }
      const Element = ElementAssets[id];
      const filterData = filterByRules(elementData, { logic, expressions });
      const elementMapper = Element.registerTransform(filterData);
      return filterData.map(elementMapper);
    })
    .reduce((acc, curr) => {
      return [...curr, ...acc];
    }, []);

  const uniqueElements = uniqueElementsBy(filterElements, (a, b) => {
    return a.id === b.id;
  });
  const uniqueIds = uniqueElements.map(n => n.id);
  //@ts-ignore
  const restElements = elementData.filter(n => {
    return uniqueIds.indexOf(n.id) === -1;
  });
  //@ts-ignore
  let elementAsset = ElementAssets[basicConfig.id];
  if (!elementAsset) {
    if (elementType === 'edges') {
      //@ts-ignore
      elementAsset = SimpleEdge;
    } else {
      //@ts-ignore
      elementAsset = SimpleNode;
    }
  }

  //@ts-ignore
  const restMapper = elementAsset.registerTransform(restElements, basicConfig, reset);
  const restData = restElements.map(restMapper);

  const nodes = [...uniqueElements, ...restData];
  console.timeEnd(`${elementType.toUpperCase()}_TRANS_COST`);

  return nodes;
};
