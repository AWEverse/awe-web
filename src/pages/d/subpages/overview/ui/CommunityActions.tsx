import { Button } from "@mui/material";
import AtSignIcon from "@/shared/common/icons/AtSignIcon";
import FavouriteIcon from "@/shared/common/icons/FavouriteIcon";
import UserMultipleIcon from "@/shared/common/icons/UserMultipleIcon";
import IconExpand from "@/shared/ui/IconExpand";

import "./CommunityActions.scss";

interface CommunityActionsProps {
  communityHandle?: string;
  memberCount?: string;
}

const CommunityActions: React.FC<CommunityActionsProps> = ({
  communityHandle = "@TechInnovators",
  memberCount = "3.5k Members",
}) => (
  <div
    className="community-actions"
    role="region"
    aria-label="Community actions"
  >
    <div className="community-actions__container">
      <div className="community-actions__buttons">
        <Button
          variant="contained"
          size="small"
          className="community-actions__button"
          aria-label="Follow community"
        >
          Follow
        </Button>
        <Button
          variant="outlined"
          size="small"
          className="community-actions__button"
          aria-label="Share community"
        >
          Share
        </Button>
      </div>
      <div className="community-actions__info">
        <IconExpand
          icon={<AtSignIcon size={24} />}
          label={communityHandle}
          aria-label={`Community handle: ${communityHandle}`}
        />
        <IconExpand
          icon={<FavouriteIcon size={24} />}
          label="Favourite"
          aria-label="Add to favourites"
        />
        <IconExpand
          icon={<UserMultipleIcon size={24} />}
          label={memberCount}
          aria-label={`Community members: ${memberCount}`}
        />
      </div>
    </div>
  </div>
);

export default CommunityActions;
