import { FC, memo } from "react";
import TextInput from "@/shared/ui/TextInput";

import s from "./EditScreen.module.scss";
import HeaderNavigation from "../../common/HeaderNavigation";
import buildClassName from "@/shared/lib/buildClassName";
import TextArea from "@/shared/ui/TextArea";
import useChatStore from "@/pages/chat/store/state/useChatState";

interface OwnProps {
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const EditScreen: FC<OwnProps> = ({ nodeRef, className }) => {
  const { toggleRightEditingPanel } = useChatStore();

  return (
    <div ref={nodeRef} className={buildClassName(s.EditScreen, className)}>
      <HeaderNavigation
        className={"RightHeaderNavigation"}
        name="Andrii, Edit your profile"
        onPrevClick={toggleRightEditingPanel}
      />

      <section className={s.EditForm}>
        <TextInput label="Name" />
        <TextInput label="Surname" />

        <TextArea label="Description (optional)" />
      </section>

      <article className={s.EditExplanation}>
        <span className="i18n">
          Укажите ключевую информацию о себе, такую как интересы, место
          проживания или профессия. Например: 20 лет, инженер из Англии.
        </span>
      </article>

      <p className={s.EditHeader}>Имя пользователя</p>
      <section className={s.EditForm}>
        <TextInput label="Username (optional)" variant="slide" />
      </section>

      <article className={s.EditExplanation}>
        <span className="i18n">
          Вы можете установить свое публичное имя пользователя в <b>AWE</b>. Это
          имя поможет другим пользователям найти вас и связаться с вами, даже
          если они не знают ваш номер телефона.
          <br />
          <br />
          Пожалуйста, используйте только символы <b>a–z</b>, <b>0–9</b> и
          подчеркивания для создания имени. Имейте в виду, что минимальная длина
          имени составляет <b>5</b> символов.
          <br />
          <br />
          Имя пользователя должно быть уникальным, и вы можете изменить его в
          любое время через настройки профиля. Выбирайте имя, которое отражает
          вашу индивидуальность или интересы.
        </span>
      </article>
    </div>
  );
};

export default memo(EditScreen);
