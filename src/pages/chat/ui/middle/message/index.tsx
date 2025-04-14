import {
  ApiMessage,
  IAlbum,
  MessageListType,
} from "@/@types/api/types/messages";
import {
  ObserveFn,
  useIsIntersecting,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import { REM } from "@/lib/utils/mediaDimensions";
import { ThreadId } from "@/types";
import { FC, memo, ReactNode, useRef, useState } from "react";

import "./index.scss";
import { useScrollProvider } from "@/shared/context";
import MessageText from "./private/ui/views/MessageText";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import { EMouseButton } from "@/lib/core";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import buildClassName from "@/shared/lib/buildClassName";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

type PositionEntity = "Group" | "Document" | "List";
type Position = "IsFirst" | "IsLast";

type MessagePositionProperties = {
  [K in `${Position}${PositionEntity}`]: boolean;
};

type MetaPosition = "in-text" | "standalone" | "none";
type ReactionsPosition = "inside" | "outside" | "none";
type QuickReactionPosition = "in-content" | "in-meta";
type ReplyPosition = "in-content" | "in-meta" | "outside";

const NBSP = "\u00A0";
const ANIMATION_DURATION = 250;
const APPEARANCE_DELAY = 10;
const NO_MEDIA_CORNERS_THRESHOLD = 18;
const QUICK_REACTION_SIZE = 1.75 * REM;
const EXTRA_SPACE_FOR_REACTIONS = 2.25 * REM;
const BOTTOM_FOCUS_SCROLL_THRESHOLD = 5;
const THROTTLE_MS = 300;
const RESIZE_ANIMATION_DURATION = 400;

class Purposes {
  static readonly READING = "reading";
  static readonly PLAYING = "playing";
  static readonly LOADING = "loading";
}

export const MessageStatuses = [
  "delivered",
  "error",
  "paused",
  "partial-sent",
  "read",
  "sending",
  "sent",
  "viewed",
] as const;
export type MessageStatusType = (typeof MessageStatuses)[number];

export const Directions = ["incoming", "outgoing"] as const;
export type DirectionType = (typeof Directions)[number];

type OwnProps = {
  isOwn: boolean;
  message: ApiMessage;
  album?: IAlbum;
  withAvatar?: boolean;
  withSenderName?: boolean;
  threadId: ThreadId;
  messageListType: MessageListType;
  noComments: boolean;
  noReplies: boolean;
  isJustAdded: boolean;
  memoFirstUnreadIdRef: { current: number | undefined };
  accessibleList: () => boolean;
} & MessagePositionProperties;

interface StateProps {}

const markdownContent = `
**Наступ на Запоріжжя, підрив дамби, Гуляйполе і знання з географії**

![World Icon](https://example.com/world-icon.png)

Мережею ширяться повідомлення різного характеру, які помилково поєднують між собою, вводячи суспільство в оману та деструктив. Тож по порядку:

![Yellow Dot](https://example.com/yellow-dot.png)

**Наступ на Запоріжжя.** Вже близько місяця суспільство чує про "великий" наступ на Запоріжжя, який може початися в районі Василівки, а саме в Кам'янському. Абсолютно невідомо, на чому грунтується дана заява, адже такого великого накопичення в районі Василівки, як про це говорять — не спостерігається. Там певний час перебувають дві десантно-штурмові дивізії, одна з яких частково була перекинута в інший район, а також засвітився новий полк, зібраний зі зброду. На сьогодні великої активності в районі Кам'янська не прослідковується, а якщо там щось і почнеться, то до цього варто готуватися фізично, а не лякати щоденними заявами населення міста Запоріжжя. Так само незмінною є ситуація в Роботиному, де не прослідковується ніяких загострень.

![Yellow Dot](https://example.com/yellow-dot.png)

**Підрив дамби у Василівці.** Вчора мережею активно почала ширитися заява, що московити хочуть підірвати дамбу у н.п. Василівка. Однак, ми так і не зрозуміли, як можна це зробити з дамбою, яка вже до цього була підірвана у 2022 році і де майже немає води.

![Yellow Dot](https://example.com/yellow-dot.png)

**Окремо про "наступ на Запоріжжя" в контексті області і згадки активностей в районі Гуляйполя.** Ці події пов'язують через незнання географії та з просуванням кацапів в районі Рівнополя-Новодарівки та спроб прорватися зі Старомайорська в Макарівку. По-перше, Рівнопіль, Новодарівка та Макарівка — це Донецька область і географічно далеко не південь. По-друге, ці два населені пункти аж ніяк не в районі Гуляйполя і навіщо згадувати цей населений пункт — невідомо. По-третє, взагалі не зрозуміло, навіщо в цьому контексті згадувати Запорізьку область, яка дійсно проходить прям біля Рівнополя, але не є підставою для заяв про "наступ на Запоріжжя". Про обстановку в даному районі ми [писали окремо](https://t.me/DeepStateUA/20699) вчора.

![Exclamation](https://example.com/exclamation.png)

Інформаційне поле — це дуже важлива складова впливу на суспільство. У кожного своя мета, але варто пам'ятати про відповідальність, яку кожен бере, роблячи якісь заяви. Приєднуйтесь до збору, допомагаємо нашим бійцям — це буде корисно і набагато краще для всіх: [https://send.monobank.ua/jar/2y2T1i5wph](https://send.monobank.ua/jar/2y2T1i5wph)
`;

const ChatMessage: FC<OwnProps & StateProps> = ({ isOwn, message }) => {
  const { content, isJustAdded } = message;

  const messageRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  const {
    observeIntersectionForReading,
    observeIntersectionForLoading,
    observeIntersectionForPlaying,
  } = useScrollProvider();

  const renderContent = (): ReactNode => {
    return <MessageText>{markdownContent}</MessageText>;
  };

  const renderAvatar = () => {
    return <div>Avatar</div>;
  };

  const renderTitle = () => {
    return <div>Title</div>;
  };

  const renderMessageText = () => {
    return <MessageText>{markdownContent}</MessageText>;
  };

  const isLoading = useIsIntersecting(
    messageRef,
    observeIntersectionForLoading,
  );
  const isReading = useIsIntersecting(
    bottomMarkerRef,
    observeIntersectionForReading,
  );

  return (
    <>
      <div
        data-ctx
        ref={messageRef}
        className={buildClassName("Message", isOwn ? "own" : "other")}
      >
        {renderContent()}
        <div
          ref={bottomMarkerRef}
          className="Message__bottom"
          date-purpose={Purposes.READING}
          data-meta={NBSP}
        />
        <svg
          viewBox="0 0 11 20"
          width="11"
          height="20"
          className={buildClassName("MessageTail", isOwn ? "own" : "other")}
          data-purpose="message-tail"
        >
          <use href="#message-tail-filled"></use>
        </svg>
      </div>
    </>
  );
};

export default memo(ChatMessage);
