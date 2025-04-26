import { lazy } from "react";

const CalendarModal = lazy(() => import("./modal-calendar"));
const LinkPreviewModal = lazy(() => import("./modal-link-preview"));
const MembersViewModal = lazy(() => import("./modal-members-list"));
const EditAvatarModal = lazy(() => import("./modal-edit-avatar"));

const modalRegistry = {
  calendar: CalendarModal,
  "link-preview": LinkPreviewModal,
  "members-view": MembersViewModal,
  "edit-avatar": EditAvatarModal,
} as const;

type ModalType = keyof typeof modalRegistry;

type ModalCommonProps = {
  onClose: () => void;
};

type ModalMap = {
  [K in ModalType]: React.ComponentProps<(typeof modalRegistry)[K]>;
} & ModalCommonProps;

type OpenModalFunction = <T extends ModalType>(
  type: T,
  props: ModalMap[T],
  zIndex?: number,
) => void;

export default modalRegistry;
export type { ModalType, ModalMap, ModalCommonProps, OpenModalFunction };
