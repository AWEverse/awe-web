import './index.css';
import buildClassName from '@/shared/lib/buildClassName';

type OwnProps = {
  content: string;
  className?: string;
};

const DotAnimation: React.FC<OwnProps> = ({ content, className }) => {
  return (
    <div className={buildClassName(className, 'DotAnimationRoot')}>
      <span className={'dotContent'}>{content}</span>
      <span className={'dotAnimation'} />
    </div>
  );
};

export default DotAnimation;
