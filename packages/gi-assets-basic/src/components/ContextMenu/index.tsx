import Component from './ContextMenu';
import registerMeta from './registerMeta';

/**   index.md 中解析得到默认值，也可用户手动修改 */
const info = {
  id: 'ContextMenu',
  name: '右键菜单',
  category: 'components',
  desc: '右键菜单',
  cover: 'http://xxxx.jpg',
};

export default {
  info,
  component: Component,
  registerMeta,
};