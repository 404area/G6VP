import registerMeta from './registerMeta';
import registerTransform from './registerTransform';
const registerShape = Graphin => {
  // graphinEdge 已经在内部注册成功
};

/**   index.md 中解析得到默认值，也可用户手动修改 */
const info = {
  id: 'SimpleEdge',
  category: 'edge',
  name: '官方边',
  desc: 'SimpleEdge',
  cover: 'http://xxxx.jpg',
  type: 'EDGE',
  docs: 'https://www.yuque.com/antv/gi/ce260nnvfvagqszi',
};

export default {
  info,
  registerShape,
  registerMeta,
  registerTransform,
};
