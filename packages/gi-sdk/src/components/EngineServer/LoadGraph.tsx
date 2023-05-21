import Graphin, { GraphinContext } from '@antv/graphin';
import { Button, Col, Form, Input, Row, Select, Statistic } from 'antd';
import * as React from 'react';
import { useImmer } from 'use-immer';
import { GraphSchemaData, utils } from '../../index';
import CollapseCard from '../CollapseCard';
import type { GraphDBConfig } from './index';

const { getSchemaGraph } = utils;

type SchemaGraphProps = Pick<
  GraphDBConfig,
  'engineId' | 'queryGraphSchema' | 'giSiteContext' | 'querySubGraphList' | 'queryVertexLabelCount' | 'updateGISite'
>;

const { Option } = Select;

const FitView = () => {
  const { graph } = React.useContext(GraphinContext);
  React.useEffect(() => {
    setTimeout(() => {
      graph.fitView(20);
    }, 200);
  }, []);
  return null;
};

const SchemaGraph: React.FunctionComponent<SchemaGraphProps> = props => {
  const { queryGraphSchema, querySubGraphList, queryVertexLabelCount = () => undefined, engineId } = props;

  const [form] = Form.useForm();
  const { updateGISite } = props;
  const { ENGINE_USER_TOKEN: useToken, CURRENT_SUBGRAPH } = utils.getServerEngineContext();

  const [state, updateState] = useImmer<{
    schemaData: GraphSchemaData;
    count: {
      nodes: number | string;
      edges: number | string;
    };
    subGraphList: any[];
    defaultGraphName: string;
    defaultLabelField: string;
    selectedSubgraph: any;
  }>({
    schemaData: { nodes: [], edges: [] },

    count: {
      nodes: '-',
      edges: '-',
    },
    defaultLabelField: 'name',
    subGraphList: [],
    defaultGraphName: CURRENT_SUBGRAPH,
    selectedSubgraph: undefined,
  });
  const { schemaData, count, subGraphList, defaultGraphName, defaultLabelField } = state;

  const getVertexLabelCount = async () => {
    const result = await queryVertexLabelCount(defaultGraphName);
    if (!(result && result.success)) {
      return;
    }
    const { data } = result;
    updateState(draft => {
      draft.count = {
        nodes: data.nodeCount,
        edges: data.edgeCount,
      };
    });
  };

  const getSubGraphList = async () => {
    const result = await querySubGraphList();
    if (!result) {
      // notification.error({
      //   message: '查询子图列表失败',
      //   description: `查询失败：${result.message}`,
      // });
      return;
    }
    updateState(draft => {
      draft.subGraphList = result;
    });
  };

  const handleChange = async value => {
    utils.setServerEngineContext({
      CURRENT_SUBGRAPH: value,
    });

    // 切换子图后，同步查询 Schema
    const schemaData = (await queryGraphSchema()) as GraphSchemaData;

    updateState(draft => {
      draft.defaultGraphName = value;
      if (schemaData.nodes && schemaData.edges) {
        draft.schemaData = schemaData;
      }
    });
  };

  React.useEffect(() => {
    if (useToken) {
      getVertexLabelCount();
    }
  }, [defaultGraphName]);

  React.useEffect(() => {
    if (useToken) {
      getSubGraphList();
      handleChange(defaultGraphName);
    }
  }, []);
  const handleSubmit = () => {
    const newSchemaData = {
      ...schemaData,
      meta: {
        defaultLabelField: defaultLabelField,
      },
    };
    form.validateFields().then(values => {
      const { datasetName } = values;
      utils.setServerEngineContext({
        engineId,
        schemaData: newSchemaData,
      });
      const engineContext = utils.getServerEngineContext();
      if (updateGISite) {
        updateGISite({
          engineId,
          schemaData: newSchemaData,
          engineContext: engineContext,
          name: datasetName,
        });
      }
    });
  };

  const defaultStyleConfig = utils.generatorStyleConfigBySchema(schemaData);
  const schemaGraph = getSchemaGraph(schemaData, defaultStyleConfig);
  console.log('state', state, defaultStyleConfig, schemaGraph);
  const isEmpty = schemaData.nodes.length === 0;

  return (
    <CollapseCard title="选择子图">
      <Form name="subgraphForm" form={form} layout="vertical">
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <div style={{ padding: '24px' }}>
              <Form.Item
                label="选择子图"
                name="subgraph"
                rules={[
                  {
                    required: true,
                    message: '请选择子图!',
                  },
                ]}
                style={{
                  marginTop: 16,
                }}
                initialValue={defaultGraphName}
              >
                <Select showSearch placeholder="请选择要查询的子图" onChange={handleChange} style={{ width: '100%' }}>
                  {subGraphList.map((d: any) => {
                    return <Option value={d.value}>{!d.description ? d.label : `${d.label}(${d.description})`}</Option>;
                  })}
                </Select>
              </Form.Item>
              <div style={{ margin: '20px 0px' }}>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Statistic title="节点规模" value={count.nodes} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="边规模" value={count.edges} />
                  </Col>
                </Row>
              </div>
              {schemaData ? (
                <Form.Item
                  label="数据名称"
                  name="datasetName"
                  rules={[
                    {
                      required: true,
                      message: '请输入数据名称!',
                    },
                  ]}
                  style={{
                    marginTop: 16,
                  }}
                >
                  <Input placeholder="请为该数据集命名" />
                </Form.Item>
              ) : (
                ''
              )}
              <Button type="primary" onClick={handleSubmit} style={{ width: '100%' }}>
                进入分析
              </Button>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} style={{ border: '2px dashed rgb(22, 101, 255)' }}>
            {isEmpty ? (
              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  height: '100%',
                  alignItems: 'center',
                }}
              >
                暂无图模型
              </div>
            ) : (
              <Graphin
                style={{ minHeight: '300px' }}
                data={schemaGraph}
                fitView
                layout={{ type: 'force2', animation: false }}
              >
                <FitView></FitView>
              </Graphin>
            )}
          </Col>
        </Row>
      </Form>
    </CollapseCard>
  );
};

export default SchemaGraph;
