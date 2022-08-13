import SDK_PACKAGE from '@alipay/graphinsight/package.json';
import { produce } from 'immer';
import beautify from 'js-beautify';
import { getAssetPackages } from '../loader';
export function beautifyCode(code: string) {
  return beautify(code, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: -1,
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 120,
    e4x: false,
  });
}
export const getActivePackageName = (activeAssets): string[] => {
  return ['@alipay/gi-assets-basic'];
};

/**
 * get js code for Riddle
 * @param opts  previewer props
 */
const getHtmlAppCode = opts => {
  const { data, id, schemaData, engineId, engineContext, activeAssets } = opts;
  console.log('opts', opts);

  const config = produce(opts.config, draft => {
    try {
      delete draft.node.meta;
      delete draft.node.info;
      delete draft.edge.meta;
      delete draft.edge.info;
    } catch (error) {
      console.warn(error);
    }
  });
  const serviceConfig = produce(opts.serviceConfig, draft => {
    draft.forEach(s => {
      delete s.others;
    });
  });

  try {
  } catch (error) {
    console.log('error', error);
  }
  const engineContextStr = beautifyCode(
    JSON.stringify({
      projectId: id,
      engineId,
      ...engineContext,
    }),
  );
  const configStr = beautifyCode(JSON.stringify(config));

  const dataStr = beautifyCode(JSON.stringify(data));
  const serviceStr = beautifyCode(JSON.stringify(serviceConfig));
  const activePackages = getActivePackageName(activeAssets);
  const allPackages = getAssetPackages();
  const packages = activePackages.map(k => {
    return allPackages.find(c => {
      return k == c.name;
    });
  });
  console.log('packages', packages);

  const GI_SCHEMA_DATA = beautifyCode(JSON.stringify(schemaData));

  const GIAssetsScripts = packages
    .map(pkg => {
      return `<script src="${pkg.url}"></script>`;
    })
    .join('\n  ');
  const GIAssetsLinks = packages
    .map(pkg => {
      const href = pkg.url.replace('min.js', 'css');
      return `<link rel="stylesheet" href="${href}" />`;
    })
    .join('\n  ');
  const packagesStr = beautifyCode(JSON.stringify(Object.values(packages)));

  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>

    <!--- CSS -->
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/alipay/theme-tools/0.3.0/dist/GraphInsight/light.css" />
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/antv/graphin/2.6.5/dist/index.css" />
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/alipay/graphinsight/${SDK_PACKAGE.version}/dist/index.css" /> 
    ${GIAssetsLinks}
 
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
  
    /** 计算逻辑 **/
    const getAssets = () => {
      const packages = ${packagesStr};
      return packages
        .map(item => {
          let assets = window[item.global];
          if (!assets) {
            return null;
          }
          if (assets.hasOwnProperty('default')) {
            assets = assets.default;
          }
          return {
            ...item,
            assets,
          };
        })
        .filter(c => {
          return c;
        });
    };

const getCombinedAssets = () => {
  const assets = getAssets();
  return assets.reduce(
    (acc, curr) => {
      const {services,components,layouts,elements}= curr.assets;
      return {
        components: {
          ...acc.components,
          ...components,
        },
        elements: {
          ...acc.elements,
          ...elements,
        },
        layouts: {
          ...acc.layouts,
          ...layouts,
        },
        services: services
        ? [
            ...acc.services,
            {
              ...services,
            },
          ]
        : acc.services,
      };
    },
    {
      components: {},
      elements: {},
      layouts: {},
      services:[]
    },
  );
};

function looseJsonParse(obj) {
  return Function('"use strict";return (' + obj + ')')();
}
const defaultTransFn = (data, params) => {
  return data;
};
const getServicesByConfig = (serviceConfig, LOCAL_DATA, schemaData) => {
  return serviceConfig.map(s => {
    const { id, content, mode } = s;
    const runtimeContent = content?.split('export default')[1] || content;
    const transFn = looseJsonParse(runtimeContent);
    return {
      id,
      content,
      service: (...params) => {
        return transFn(...params, LOCAL_DATA, schemaData);
      },
    };
  });
};
const getCombineServices = (servers) => {
  if (!servers) {
    return [];
  }
  return servers.reduce((acc, curr) => {
    const { id, services } = curr;
    const sers = Object.keys(services).map(key => {
      const service = services[key];
      return {
        ...service,
        id: id+'/'+key, //根据GI平台规范，服务ID 由 引擎ID+服务函数名 唯一标识
      };
    });
    return [...acc, ...sers];
  }, [] );
};
      /**  由GI平台自动生成的，请勿修改 start **/
      const SERVER_ENGINE_CONTEXT= ${engineContextStr};
      const GI_SERVICES_OPTIONS = ${serviceStr};
      const GI_PROJECT_CONFIG = ${configStr};
      /**  由GI平台自动生成的，请勿修改 end **/
      window.localStorage.setItem( 'SERVER_ENGINE_CONTEXT', JSON.stringify(SERVER_ENGINE_CONTEXT));
      const config = GI_PROJECT_CONFIG;
      const assets = getCombinedAssets();
      const assetServices = getCombineServices(assets.services)
      const services = [...assetServices];
      console.log('services',services)

    const MyGraphSdk = () => {
    
      return  <div style={{ height: '100vh' }}>
        <GISDK.default config={config} assets={assets} services={services}/>
      </div>;
    };
      window.onload = () => {
        ReactDOM.render(<MyGraphSdk />, document.getElementById('root'));
      };
    </script>
    
    <!--- REACT DEPENDENCIES-->
    <script crossorigin src="https://gw.alipayobjects.com/os/lib/react/17.0.2/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://gw.alipayobjects.com/os/lib/react-dom/17.0.2/umd/react-dom.production.min.js"
    ></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!--- Antd DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/lodash/4.17.21/lodash.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antd/4.20.4/dist/antd.min.js"></script>
    <!--- Graphin DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/antv/g6/4.6.4/dist/g6.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antv/graphin/2.6.5/dist/graphin.min.js"></script>
    <!--- G2/G2Plot DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/antv/g2plot/2.4.16/dist/g2plot.min.js"></script>
    <!--- GI DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/alipay/graphinsight/${SDK_PACKAGE.version}/dist/index.min.js"></script>
    ${GIAssetsScripts}
  </body>
</html>
    `;
};

export default getHtmlAppCode;
