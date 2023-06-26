import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React from 'react';
import $i18n from '../../i18n';
import './index.less';

interface SidebarProps {
  options: any[];
  handleChange: any;
  handleAdd: any;
  handleDelete: any;
  activeId: string;
}

const SideList: React.FunctionComponent<SidebarProps> = props => {
  const { options, handleChange, handleAdd, handleDelete, activeId } = props;
  // React.useEffect(() => {
  //   if (activeId === 'NEW_GI_SERVICE') {
  //     handleChange('NEW_GI_SERVICE');
  //     handleAdd();
  //   }
  // }, [activeId]);

  return (
    <div className="gi-services-sidebar">
      <Card
        bordered={false}
        title={$i18n.get({ id: 'gi-site.components.DataSource.List.CustomDataService', dm: '自定义数据服务' })}
        extra={
          <Button size="small" onClick={handleAdd} icon={<PlusOutlined />} type="dashed">
            {$i18n.get({ id: 'gi-site.components.DataSource.List.Add', dm: '新增' })}
          </Button>
        }
      >
        <ul>
          {/* <li key="plus" onClick={handleAdd} className="plus">
             自定义数据服务 <PlusOutlined />
            </li> */}
          {options.map(opt => {
            const { id } = opt;
            const isActive = id === activeId;
            const classes = isActive ? 'active' : '';

            return (
              <li
                className={classes}
                key={id}
                onClick={() => {
                  handleChange(id);
                }}
              >
                {id}
                <span
                  className="delete"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                >
                  <DeleteOutlined />
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

export default SideList;
