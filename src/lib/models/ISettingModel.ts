export interface ISettingInfo {
  id: string | number;
  index: number;
  name: string;
}

export interface ISettingModel {
  id: string | number;
  name: string;
  value: string;
  info: ISettingInfo;
}
