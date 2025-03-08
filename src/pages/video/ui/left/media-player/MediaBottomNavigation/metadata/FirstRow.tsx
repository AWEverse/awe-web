import buildClassName from "@/shared/lib/buildClassName";
import ActionButton from "@/shared/ui/ActionButton";
import { Avatar } from "@mui/material";
import { FC } from "react";
import s from "./FirstRow.module.scss";

interface OwnProps {}

interface StateProps {}

const FirstRow: FC<OwnProps & StateProps> = () => {
  return (
    <>
      <div className={buildClassName("awe-user", s.firstRow)}>
        <Avatar
          className={buildClassName("awe-avatar", s.firstRow__avatar)}
          src="https://image.api.playstation.com/vulcan/ap/rnd/202109/1518/PQbJo2xmwHkkhaHmpBH0sD5q.png"
        />

        <div className={s.firstRow__meta}>
          <p className="awe-title">Crysis 4 is coming</p>
          <span className="awe-subtitle">2 months ago</span>
        </div>

        <div className={s.firstRow__meta}>
          <p className="awe-subtitle">63K subscribers</p>
          <span className="awe-subtitle">
            16.2m views • 1.5m likes • 4.4k dislikes
          </span>
        </div>
      </div>
    </>
  );
};

export default FirstRow;
