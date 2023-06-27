import { utils } from '@antv/gi-sdk';
import $i18n from '../../i18n';

const registerMeta = ({ services }) => {
  const schema = {
    renderMode: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.RenderingMode', dm: '渲染模式' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: [
          {
            value: 'page',
            label: $i18n.get({ id: 'basic.components.Watermark.registerMeta.EntirePage', dm: '整个页面' }),
          },
          {
            value: 'canvas',
            label: $i18n.get({ id: 'basic.components.Watermark.registerMeta.CanvasOnly', dm: '仅画布' }),
          },
        ],
      },
      default: 'page',
    },
    watermarkServiceId: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.WatermarkService', dm: '水印服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: utils.getServiceOptions(services, 'WatermarkService'),
      },
      default: 'GI/WatermarkService',
    },
    width: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.Width', dm: '宽度' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      default: 120,
    },
    height: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.Height', dm: '高度' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      default: 64,
    },
    rotate: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.RotationAngle', dm: '旋转角度' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        min: -90,
        max: 90,
      },
      default: -22,
    },
    zIndex: {
      title: 'z-index',
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      default: 9,
    },
    fontSize: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.FontSize', dm: '字体大小' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        min: 0,
      },
      default: 16,
    },
    fontColor: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.FontColor', dm: '字体颜色' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'ColorInput',
      default: 'rgba(0,0,0,.15)',
    },
    gap: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.Spacing', dm: '间距' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Offset',
      'x-component-props': {
        min: 0,
        max: 400,
      },
      default: [100, 100],
    },
    offset: {
      title: $i18n.get({ id: 'basic.components.Watermark.registerMeta.Offset', dm: '偏移量' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Offset',
      'x-component-props': {
        min: 0,
        max: 400,
      },
      default: [50, 50],
    },
  };

  return schema;
};

export default registerMeta;
