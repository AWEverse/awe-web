import IconButton from '@/shared/ui/IconButton';
import Img from '@/shared/ui/Image';
import { CloseRounded } from '@mui/icons-material';
import { FC, memo, ReactNode } from 'react';
import s from './CustomTag.module.scss';
import RippleEffect from '@/shared/ui/ripple-effect';

interface OwnProps {
  tagName?: string;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  color?: string;
}

const CustomTag: FC<OwnProps> = props => {
  const { tagName, startDecorator, endDecorator, color } = props;

  return (
    <div className={s.CustomTag} style={{ border: `2px solid ${color}` }}>
      {startDecorator}
      <Img alt="" figureClassName={s.TagImage} src="https://picsum.photos/200" />
      <p className={s.TagName} style={{ color: color }}>
        {tagName}
      </p>
      <IconButton className={s.CloseButton} size="small" variant="rounded">
        <CloseRounded />
      </IconButton>
      {endDecorator}
      <RippleEffect color={color} />
    </div>
  );
};

export default memo(CustomTag);
