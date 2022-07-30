import { GraphinData } from '@antv/graphin';
import React from 'react';
export interface ServerComponentProps {}

export interface IInputData {
  uid: string;
  name: string;
  data: GraphinData;
  transfunc: string;
  enable: boolean;
}

export type ITableType = 'nodes' | 'edges';

export interface IColumns {
  title: string;
  dataIndex: string;
  key: string;
  render?: (data: GraphinData) => any;
}

export interface IState {
  activeKey: number;
  inputData: IInputData[];
  data: GraphinData;
  transfunc: string;
  transData: GraphinData;
  tableData: object[];
  transColumns: object[];
}