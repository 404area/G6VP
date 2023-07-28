import GI_THEME_ANTD from '@antv/gi-theme-antd/package.json';

import deps_externals from './scripts/deps_externals.json';

export const GI_THEME_ANTD_VERSION = GI_THEME_ANTD.version;

/** 是否为本地研发模式 */
//@ts-ignore
export const isDev = process.env.NODE_ENV === 'development';
//@ts-ignore
export const { BUILD_MODE } = process.env;

export const externals = deps_externals.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.name]: `${curr.global}`,
  };
}, {});

export const externalScripts = deps_externals.map(c => {
  return { src: c.url };
});
console.log('externals', externals, BUILD_MODE);
const EXTRA_CONFIG = isDev
  ? {
      externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        antd: 'antd',
        // '@antv/g6': 'G6',
        // '@antv/graphin': 'Graphin',
      },
      scripts: [
        'https://gw.alipayobjects.com/os/lib/react/17.0.2/umd/react.production.min.js',
        'https://gw.alipayobjects.com/os/lib/react-dom/17.0.2/umd/react-dom.production.min.js',
        'https://gw.alipayobjects.com/os/lib/antd/4.24.8/dist/antd.min.js',
        // 'https://gw.alipayobjects.com/os/lib/antv/gi-sdk-app/1.1.0/dist/index.min.js',
        'http://localhost:5500/index.min.js',
        // 'https://gw.alipayobjects.com/os/lib/antv/g6/4.8.8/dist/g6.min.js',
        // // 'https://gw.alipayobjects.com/os/lib/antv/graphin/2.7.13/dist/graphin.min.js',
        // 'http://localhost:5501/graphin.min.js',
      ],
      links: [],
    }
  : {
      externals: {
        ...externals,
      },
      scripts: [...externalScripts],
      links: [
        ...externalScripts.map(c => {
          return { href: c.src.replace('min.js', 'css'), rel: 'stylesheet' };
        }),
      ],
    };

export default {
  // base: '/',
  base: '/',
  publicPath: BUILD_MODE === 'docker' ? '/public/' : '/',
  hash: true,
  favicon: 'https://gw.alipayobjects.com/zos/bmw-prod/b9a0f537-3768-445d-aa39-ff49de82124a.svg',
  history: {
    type: 'hash',
  },
  alias: {
    '@': './src',
  },
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { exact: true, path: '/', redirect: '/home' },
    { exact: true, path: '/workspace/:projectId', component: 'Analysis' },
    { exact: true, path: '/share/:shareId', component: 'Share' },
    { exact: true, path: '/tabs/:type', component: 'Tab' },
    {
      exact: true,
      path: '/app/:id',
      component: 'Applaction',
    },
    {
      exact: true,
      path: '/preview/:id',
      component: 'Preview',
    },
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { exact: true, path: '/workspace', component: 'Workspace' },
        { exact: true, path: '/services', component: 'ServerCenter' },
        { exact: true, path: '/home', component: 'Home' },
        {
          path: '/dataset',
          component: '@/layouts/SideNav',
          routes: [
            {
              exact: true,
              path: 'list',
              component: 'Dataset/List',
            },
            {
              exact: true,
              path: 'list/:id',
              component: 'Dataset/Detail',
            },
            {
              exact: true,
              path: 'create',
              component: 'Dataset/Create',
            },
            {
              exact: true,
              path: 'case',
              component: 'Dataset/Case',
            },
            {
              exact: true,
              path: 'SYSTEM_DIRECT_CONNECT',
              component: 'Dataset/SystemDirectConnect',
            },
            {
              exact: true,
              path: 'delete',
              component: 'Dataset/Delete',
            },
          ],
        },
        {
          path: '/workbook',
          component: '@/layouts/SideNav',
          routes: [
            {
              exact: true,
              path: 'project',
              component: 'Workspace/Projects',
            },
            {
              exact: true,
              path: 'create',
              component: 'Workbook/Create',
            },
            {
              exact: true,
              path: 'template',
              component: 'Template/index',
            },
            {
              exact: true,
              path: 'template/:id',
              component: 'Template/Detail',
            },
            {
              exact: true,
              path: 'report',
              component: 'Share',
            },
          ],
        },
        {
          path: '/open',
          component: '@/layouts/SideNav',
          routes: [
            {
              exact: true,
              path: 'solution',
              component: 'Solution',
            },
            {
              exact: true,
              path: 'assets-manage',
              component: 'Assets',
            },
            {
              exact: true,
              path: 'assets-list',
              component: 'AssetsList',
            },
            {
              exact: true,
              path: 'engines',
              component: 'ServerCenter',
            },
            {
              exact: true,
              path: 'g6v5demo',
              component: 'G6V5Demo',
            },
            {
              exact: true,
              path: 'user',
              component: 'Share',
            },
          ],
        },
        { component: '404' },
      ],
    },
  ],
  ...EXTRA_CONFIG,
  request: {
    dataField: '',
  },
  // ...EXTRA_CONFIG,
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
  chainWebpack(memo, { type }) {
    memo.module
      .rule('mjs$')
      .test(/\.mjs$/)
      .include.add(/node_modules/)
      .end()
      .type('javascript/auto');
  },
};
