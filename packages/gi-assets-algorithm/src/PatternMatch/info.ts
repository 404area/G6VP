import $i18n from '../i18n'; /**   index.md 中解析得到默认值，也可用户手动修改 */
const info = {
  id: 'PatternMatch',
  name: $i18n.get({ id: 'gi-assets-algorithm.src.PatternMatch.info.PatternMatching', dm: '模式匹配' }),
  category: 'algorithm-analysis',
  type: 'GIAC_CONTENT',
  desc: $i18n.get({
    id: 'gi-assets-algorithm.src.PatternMatch.info.SelectGraphicalModelToFind',
    dm: '选定图模式，找到相似结构的子图',
  }),
  cover: 'http://xxxx.jpg',
  icon: 'icon-query-path',
  docs: 'https://www.yuque.com/antv/gi/lggt0bz6w48zsd48',
};
export default info;
