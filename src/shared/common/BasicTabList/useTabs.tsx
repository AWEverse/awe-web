type Tab = {
  id: string;
  label: string;
};

export type BaseTabsOptionsType = {
  moduleClassName?: string;
  tabs: Array<Tab>;
};

export type ControlledTabsOptionsType = BaseTabsOptionsType & {
  selectedTab: string;
  onTabChange: (selectedTab: string) => unknown;
};

export type UncontrolledTabsOptionsType = BaseTabsOptionsType & {
  initialSelectedTab?: string;
  onTabChange?: (selectedTab: string) => unknown;
};

export type TabsOptionsType =
  | ControlledTabsOptionsType
  | UncontrolledTabsOptionsType;
