## SideTabs 侧边栏容器

```jsx
import TestSDK, { Mock } from '@alipay/gi-assets-testing';
import * as React from 'react';
import Asset from './index.tsx';

const App = props => {
  return (
    <div>
      <TestSDK asset={Asset} type="GICC" />
    </div>
  );
};

export default App;
```