type ExtendedReturnTypeMap = {
  is: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  getIs: () => boolean;
};

type BaseKeyActions = keyof ExtendedReturnTypeMap;

type SliceStateInterface<N extends string> = {
  [K in `${BaseKeyActions}${N}`]: K extends `${infer Action}${N}`
    ? Action extends BaseKeyActions
      ? ExtendedReturnTypeMap[Action]
      : never
    : never;
};

type SliceStateFactory<Args extends string[]> = SliceStateInterface<Args[number]>;

// Now  will have types like:
// {
//   Menu: {
//     isMenu: boolean;
//     toggleMenu: () => void;
//     openMenu: () => void;
//     closeMenu: () => void;
//     getIsMenu: () => boolean;
//   };
//   Modal: { ... };
//   Sidebar: { ... };
// }

export type { SliceStateInterface, SliceStateFactory };
