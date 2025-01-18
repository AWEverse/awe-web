import ThreadCard from "@/entities/thread-card";
import ActionButton from "@/shared/ui/ActionButton";
import React, { FC, ReactNode } from "react";

import s from "./TopSection.module.scss";

interface OwnProps {}

interface StateProps {}

const TopSection: FC<OwnProps & StateProps> = () => {
  return (
    <section className={s.TopSection}>
      <ThreadCard
        userAvatarSrc={"https://mui.com/static/images/avatar/2.jpg"}
        userName={"Andrii Volynets"}
        userTitle={"2 часа назад"}
        userSubtitle={
          "Потрепанная посылка прибыла, её загадочное послание намекает на забытое приключение. "
        }
        userAvatars={[
          {
            src: "https://mui.com/static/images/avatar/2.jpg",
            alt: " ",
          },
          {
            src: "https://mui.com/static/images/avatar/2.jpg",
            alt: " ",
          },
          {
            src: "https://mui.com/static/images/avatar/2.jpg",
            alt: " ",
          },
        ]}
        metaText={
          "Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) and [3 others](https://twitter.com/andrii_volynets) in [4 comments](https://twitter.com/andrii_volynets)"
        }
      />

      <div>
        <ActionButton variant="outlined">Media</ActionButton>
        <ActionButton variant="outlined">Gallery</ActionButton>
        <ActionButton variant="outlined">Videos</ActionButton>
        <ActionButton variant="outlined">Dialogs</ActionButton>
        <ActionButton variant="outlined">Forums</ActionButton>
      </div>

      <ActionButton
        size="custom-large"
        endDecorator={renderLink({ children: "View All" })}
      >
        Latest thread
      </ActionButton>
    </section>
  );
};

type LinkProps = React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

const renderLink = ({ children = "View All", ...props }: LinkProps) => {
  return (
    <a {...props} href="https://twitter.com/andrii_volynets">
      {children}
    </a>
  );
};

export default TopSection;
