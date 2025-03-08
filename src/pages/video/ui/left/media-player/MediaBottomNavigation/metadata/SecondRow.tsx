import IconExpand from "@/shared/ui/IconExpand";
import { ThumbDownAltRounded, ThumbUpAltRounded } from "@mui/icons-material";
import { FC, ReactNode } from "react";

interface OwnProps {}

interface StateProps {}

const SecondRow: FC<OwnProps & StateProps> = () => {
  return (
    <section>
      <div className="Chip">
        <IconExpand icon={<ThumbUpAltRounded />} label={"5.2. тис."} />
        <IconExpand icon={<ThumbDownAltRounded />} label={"5.2. тис."} />
      </div>
    </section>
  );
};

export default SecondRow;
