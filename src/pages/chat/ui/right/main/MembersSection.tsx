import { FC, ReactNode } from "react";

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const MembersSection: FC<OwnProps & StateProps> = () => {
  return (
    <>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo expedita quo
      doloremque eos maxime exercitationem recusandae, architecto itaque quidem
      beatae dolorem sequi, odio perspiciatis eum, tempora libero quam maiores
      ab?
    </>
  );
};

export default MembersSection;
