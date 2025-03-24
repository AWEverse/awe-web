import { FC, memo, ReactNode } from "react";
import VideoTopic, { VideoTopicProps } from "./VideoTopic";
import s from "./MixList.module.scss";
import buildClassName from "@/shared/lib/buildClassName";

interface OwnProps {
  children?: ReactNode;
  list?: VideoTopicProps[];
  title?: string;
  description?: string;
  className?: string;
}

const renderList = (list: VideoTopicProps[]) =>
  list.map((item, index) => (
    <VideoTopic key={index} size={"small"} {...item} />
  ));

const MixList: FC<OwnProps> = ({
  children,
  list = [],
  title,
  description,
  className,
}) => {
  return (
    <section className={buildClassName(s.MixListRoot, className)}>
      <h3 className={s.title}>{title}</h3>
      <p className={s.description}>{description}</p>
      <div>{children ?? renderList(list)}</div>
    </section>
  );
};

export default memo(MixList);
