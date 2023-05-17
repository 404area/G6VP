import { useContext, utils } from '@antv/gi-sdk';
import GremlinEditor from 'ace-gremlin-editor';
import { Button, notification, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { nanoid } from 'nanoid';
import './index.less';

export interface IGremlinQueryProps {
  initialValue?: string;
  height?: number;
  showGutter?: boolean;
  serviceId: string;
  saveTemplateServceId?: string;
  style?: React.CSSProperties | undefined;
  visible?: boolean;
  isShowPublishButton?: boolean;
  controlledValues?: {
    value: string;
  };
}

const GremlinQueryPanel: React.FC<IGremlinQueryProps> = ({
  initialValue = '',
  height = 220,
  serviceId,
  saveTemplateServceId = 'GI/PublishTemplate',
  style,
  visible,
  isShowPublishButton,
  controlledValues,
}) => {
  const { updateContext, transform, services, updateHistory } = useContext();

  const service = utils.getService(services, serviceId);
  const gremlinFromUrl = utils.searchParamOf('gremlin');

  const [state, setState] = useImmer<{
    editorValue: string;
    isFullScreen: boolean;
    modalVisible: boolean;
  }>({
    // 优先级: url 参数 > props 参数
    editorValue: gremlinFromUrl || initialValue || '',
    isFullScreen: false,
    modalVisible: false,
  });

  const setEditorValue = val => {
    setState(draft => {
      draft.editorValue = val;
    });
  };
  const { editorValue, isFullScreen } = state;

  const handleChangeEditorValue = (value: string) => {
    setEditorValue(value);
  };

  const [btnLoading, setBtnLoading] = useState(false);

  const handleClickQuery = async () => {
    setBtnLoading(true);
    if (!service) {
      return;
    }

    const result = await service({
      value: editorValue,
    });

    updateHistory({
      componentId: 'GremlinQuery',
      type: 'query',
      subType: 'Gremlin',
      statement: editorValue,
      success: result && result.success,
      params: {
        value: editorValue,
      },
    });

    setBtnLoading(false);
    if (!result || !result.success) {
      notification.error({
        message: '执行 Gremlin 查询失败',
        description: `失败原因：${result.message}`,
      });
      return;
    }

    updateContext(draft => {
      // @ts-ignore
      const res = transform(result.data);
      draft.data = res;
      draft.source = res;
      draft.isLoading = false;
    });
  };

  useEffect(() => {
    setBtnLoading(false);
  }, [visible]);

  useEffect(() => {
    console.log('editorValue..........', editorValue);
    setEditorValue(editorValue);
  }, []);

  /**
   * 受控参数变化，自动进行分析
   * e.g. ChatGPT，历史记录模版等
   */
  useEffect(() => {
    const { value } = controlledValues || {};
    if (value) {
      setEditorValue(value);
      handleClickQuery();
    }
  }, [controlledValues]);

  return (
    <div className="gi-gremlin-query " style={{ ...style }}>
      <div style={{ border: '1px solid #f6f6f6' }}>
        <GremlinEditor
          initValue={editorValue}
          height={height}
          gremlinId="gi-assets-gremlin"
          onValueChange={value => handleChangeEditorValue(value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'end',
          padding: '8px 8px',
        }}
      >
        <Space>
          {/* {isShowPublishButton && ( */}

          <Button className={'publishButton'} disabled>
            发布成模板
          </Button>

          {/* )} */}
          <Button className={'queryButton'} loading={btnLoading} type="primary" onClick={handleClickQuery}>
            执行查询
          </Button>
        </Space>
      </div>
      {/* {state.modalVisible && (
        <PublishTemplate
          saveTemplateServceId={saveTemplateServceId}
          visible={state.modalVisible}
          value={editorValue}
          close={() => {
            setState(draft => {
              draft.modalVisible = false;
            });
          }}
          fileType={'GREMLIN'}
        />
      )} */}
    </div>
  );
};

export default GremlinQueryPanel;
