import { AddAPhotoOutlined } from '@mui/icons-material';
import { FC, memo } from 'react';
import useChatStore from '@/pages/chat/store/useChatSelector';
import TextInput from '@/shared/ui/TextInput';

import s from './EditScreen.module.scss';
import Img from '@/shared/ui/Image';
import HeaderNavigation from '../../common/HeaderNavigation';
import buildClassName from '@/shared/lib/buildClassName';
import TextArea from '@/shared/ui/TextArea';

interface OwnProps {
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const EditScreen: FC<OwnProps> = ({ nodeRef, className }) => {
  const handleClose = useChatStore(state => state.closeProfileEditing);

  return (
    <div ref={nodeRef} className={buildClassName(s.EditScreen, className)}>
      <HeaderNavigation
        className={'RightHeaderNavigation'}
        name="Andrii, Edit your profile"
        onPrevClick={handleClose}
      />

      <Img
        alt=""
        caption={
          <>
            <AddAPhotoOutlined />
            <p>Add a photo</p>
          </>
        }
        captionClassName={s.ImgCaption}
        className={s.Avatar}
        figureClassName={s.EditAvatar}
        src="https://avatars.githubusercontent.com/u/116294957?v=4"
      />

      <section className={s.EditForm}>
        <TextInput label="Name" />
        <TextInput label="Surname" />

        <TextArea label="Description (optional)" maxLengthIndicator="Max. 200 characters" />
      </section>

      <article className={s.EditExplanation}>
        <span className="i18n">
          Укажите ключевую информацию о себе, такую как интересы, место проживания или профессия.
          Например: 20 лет, инженер из Англии.
        </span>
      </article>

      <p className={s.EditHeader}>Имя пользователя</p>
      <section className={s.EditForm}>
        <TextInput label="Username (optional)" variant="slide" />
      </section>

      <article className={s.EditExplanation}>
        <span className="i18n">
          Вы можете установить свое публичное имя пользователя в <b>AWE</b>. Это имя поможет другим
          пользователям найти вас и связаться с вами, даже если они не знают ваш номер телефона.
          <br />
          <br />
          Пожалуйста, используйте только символы <b>a–z</b>, <b>0–9</b> и подчеркивания для создания
          имени. Имейте в виду, что минимальная длина имени составляет <b>5</b> символов.
          <br />
          <br />
          Имя пользователя должно быть уникальным, и вы можете изменить его в любое время через
          настройки профиля. Выбирайте имя, которое отражает вашу индивидуальность или интересы.
        </span>
      </article>
    </div>
  );
};

export default memo(EditScreen);
