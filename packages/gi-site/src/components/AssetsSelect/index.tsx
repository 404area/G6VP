import { Select } from 'antd';
import * as React from 'react';
import './index.less';
interface AssetsSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: {
    id: string;
    name: string;
    icon?: string;
  }[];
}

const { Option } = Select;
const AssetsSelect: React.FunctionComponent<AssetsSelectProps> = props => {
  const { value, onChange, options } = props;
  return (
    <div>
      <Select onChange={onChange} value={value} className="style-panel-assets-select">
        {options.map((c: any) => {
          const { id, name, icon } = c;
          return (
            <Option value={id} key={id}>
              <div className="style-panel-assets-select-title">
                <img src={icon} width={40} height={40} />
                {name}
              </div>
            </Option>
          );
        })}
      </Select>
    </div>
  );
};

export default AssetsSelect;