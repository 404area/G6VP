import { FileTextOutlined } from '@ant-design/icons';
import { IUserEdge, IUserNode } from '@antv/graphin';
import { Alert, Button, Row, Space, Upload, message, notification } from 'antd';
import React, { useState } from 'react';
import { Updater } from 'use-immer';
import xlsx2js from 'xlsx2js';
import { IInputData, IState } from './typing';
import { getOptions } from './utils';
import $i18n from '../../i18n';

interface IProps {
  state: IState;
  updateState: Updater<IState>;
  updateGISite: (params: any) => void;
}

const { Dragger } = Upload;

const UploadLocalFile: React.FC<IProps> = props => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const { state, updateState, updateGISite } = props;

  const draggerProps = {
    name: 'file',
    defaultFileList: state.inputData,
    onRemove: file => {
      const renderData = state.inputData.filter(d => d.uid !== file.uid);
      if (renderData.length === 0) {
        setButtonDisabled(true);
      }
      updateState(draft => {
        draft.inputData = renderData;
      });
      mergeData(renderData);
    },
    customRequest: async options => {
      const { file, onSuccess } = options;
      let fileData;

      setButtonDisabled(false);

      if (!file) {
        return false;
      } else if (/\.(xls|xlsx|csv)$/.test(file.name.toLowerCase())) {
        const data = await xlsx2js(file);
        const isNodeFile = (file.name as string).includes('nodes');
        const isEdgeFile = (file.name as string).includes('edges');
        if (!isNodeFile && !isEdgeFile) {
          notification.error({
            message: $i18n.get({
              id: 'gi-site.components.FileServerEngine.UploadLocalFile.TheFileNameIsNot',
              dm: '文件名不规范',
            }),
            description: $i18n.get({
              id: 'gi-site.components.FileServerEngine.UploadLocalFile.AccordingToTheSpecificationsCsv',
              dm: '按照规范，CSV 或者 Excel 文件，文件名中需要包含 nodes 或者 edges 以此区分是点表还是边表。规范命名示例如下:\n             交易表.edges.csv 用户表.nodes.csv',
            }),

            duration: 0,
          });
          return;
        }

        fileData = isEdgeFile
          ? {
              nodes: [],
              edges: data,
              combos: [],
            }
          : {
              nodes: data,
              edges: [],
              combos: [],
            };

        const renderData: IInputData[] = [
          ...state.inputData,
          {
            uid: file.uid,
            name: file.name,
            data: fileData,
            transfunc: state.transfunc,
            enable: true,
          },
        ];
        updateState(draft => {
          draft.inputData = renderData;
        });
        onSuccess('Ok');
        mergeData(renderData);
      } else if (/\.(json)$/.test(file.name.toLowerCase())) {
        const reader = new FileReader();
        reader.readAsText(file, 'utf-8');
        reader.onload = fileReader => {
          fileData = JSON.parse(fileReader.target!.result as string);

          const renderData = [
            ...state.inputData,
            {
              uid: file.uid,
              name: file.name,
              data: fileData,
              transfunc: state.transfunc,
              enable: true,
            },
          ];
          updateState(draft => {
            draft.inputData = renderData;
          });
          onSuccess('Ok');
          mergeData(renderData);
        };
      } else {
        return false;
      }
    },
  };

  const downloadMockFiles = async () => {
    window.open('https://github.com/antvis/G6VP/blob/master/packages/gi-site/src/mock/excel');
  };

  const downloadJSON = async () => {
    window.open('https://github.com/antvis/G6VP/blob/master/packages/gi-site/src/mock/fund-force.json');
  };

  const mergeData = (renderData: IInputData[] = state.inputData) => {
    try {
      let nodes: IUserNode[] = [];
      let edges: IUserEdge[] = [];
      let combos: any[] = [];

      renderData.forEach(d => {
        nodes = [...nodes, ...d.data.nodes];
        edges = [...edges, ...d.data.edges];
        combos = [...combos, ...(d.data.combos ? d.data.combos : [])];
      });
      updateState(draft => {
        draft.data = { nodes, edges };
        draft.transData = eval(state.transfunc)({ nodes, edges });
      });
    } catch (e) {
      message.error(
        $i18n.get({
          id: 'gi-site.components.FileServerEngine.UploadLocalFile.PleaseUploadValidData',
          dm: '请上传合法数据',
        }),
      );
    }
  };

  const checkData = () => {
    updateState(draft => {
      draft.activeKey++;
      draft.transColumns = getOptions(state.data);
      draft.tableData = state.transData?.nodes.map((d, i) => {
        return {
          ...d,
          key: i,
        };
      });
    });
  };

  return (
    <div className="upload-panel" style={{ margin: '10px 0px 0px 0px' }}>
      <div style={{ textAlign: 'left' }}>
        <Alert
          message={$i18n.get({
            id: 'gi-site.components.FileServerEngine.UploadLocalFile.JsonFileSpecificationPointAnd',
            dm: 'JSON 文件规范：点边数据必须放在同一个 JSON 文件中上传，nodes 表示点的集合，edges 表示边的集合',
          })}
          type="info"
          showIcon
          closable
          style={{ marginBottom: '12px' }}
          action={
            <Space direction="vertical">
              <Button size="small" type="primary" onClick={downloadJSON}>
                {$i18n.get({
                  id: 'gi-site.components.FileServerEngine.UploadLocalFile.DownloadSampleData',
                  dm: '下载示例数据',
                })}
              </Button>
            </Space>
          }
        />

        <Alert
          message={$i18n.get({
            id: 'gi-site.components.FileServerEngine.UploadLocalFile.CsvXlsXlsxFileSpecification',
            dm: 'CSV/XLS/XLSX文件规范： 分别上传点表和边表，按照约定，点表文件名必须包含 nodes ,例如 acount.nodes.csv，边表文件名必须包含 edges ，例如 transfer.edges.csv',
          })}
          type="info"
          showIcon
          closable
          style={{ marginBottom: '12px' }}
          action={
            <Space direction="vertical">
              <Button size="small" type="primary" onClick={downloadMockFiles}>
                {$i18n.get({
                  id: 'gi-site.components.FileServerEngine.UploadLocalFile.DownloadSampleData',
                  dm: '下载示例数据',
                })}
              </Button>
            </Space>
          }
        />
      </div>

      <h4 style={{ marginBottom: 0, marginTop: '10px' }}>
        {$i18n.get({ id: 'gi-site.components.FileServerEngine.UploadLocalFile.TransmittedData', dm: '已传数据' })}
      </h4>

      <div className="upload-panel-section">
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <FileTextOutlined />
          </p>
          <p>
            {$i18n.get({
              id: 'gi-site.components.FileServerEngine.UploadLocalFile.ClickOrDragTheData',
              dm: '点击或将数据文件拖拽到这里上传，支持 JSON，CSV，XLS，XLSX格式',
            })}
          </p>
          {/* <Divider /> */}
        </Dragger>
      </div>

      <Row style={{ padding: '30px 0px 10px 0px', justifyContent: 'center' }}>
        <Button type="primary" disabled={buttonDisabled} shape="round" onClick={checkData}>
          {$i18n.get({ id: 'gi-site.components.FileServerEngine.UploadLocalFile.GoToTheNextStep', dm: '进入下一步' })}
        </Button>
      </Row>
    </div>
  );
};

export default UploadLocalFile;
