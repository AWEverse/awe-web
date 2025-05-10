import { lazy } from "react";

const CalendarModal = lazy(() => import("./modal-calendar"));
const LinkPreviewModal = lazy(() => import("./modal-link-preview"));
const MembersViewModal = lazy(() => import("./modal-members-list"));
const EditAvatarModal = lazy(() => import("./modal-edit-avatar"));

export const modalRegistry = {
  calendar: CalendarModal,
  "link-preview": LinkPreviewModal,
  "members-view": MembersViewModal,
  "edit-avatar": EditAvatarModal,
} as const;

export type ModalType = keyof typeof modalRegistry;

export type ModalCommonProps = {
  onClose: () => void;
};

type GetProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type ModalMap = {
  [K in ModalType]: GetProps<(typeof modalRegistry)[K]> & ModalCommonProps;
};

export type OpenModalFunction = <T extends ModalType>(
  type: T,
  props: Omit<ModalMap[T], "onClose">,
  zIndex?: number
) => void;

export type ModalPropsByType<T extends ModalType> = ModalMap[T];

export default modalRegistry;
