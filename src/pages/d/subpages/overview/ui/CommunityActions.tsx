import AtSignIcon from "@/shared/common/icons/AtSignIcon";
import FavouriteIcon from "@/shared/common/icons/FavouriteIcon";
import UserMultipleIcon from "@/shared/common/icons/UserMultipleIcon";
import IconExpand from "@/shared/ui/IconExpand";
import { Button } from "@mui/material";

const CommunityActions: React.FC = () => (
  <div className="flex flex-row max-sm:flex-col items-center justify-between gap-2 md:gap-0">
    <section className="flex flex-row items-center gap-2">
      <Button className="rounded-full" size="small">
        Follow
      </Button>
      <Button className="rounded-full" size="small">
        Share
      </Button>
    </section>
    <section className="text-sm self-end">
      <div className="flex items-center gap-1 rounded-lg">
        <IconExpand icon={<AtSignIcon size={28} />} label="@TechInnovators" />
        <IconExpand icon={<FavouriteIcon size={24} />} label="Favourite" />
        <IconExpand
          icon={<UserMultipleIcon size={24} />}
          label="3.5k Members"
        />
      </div>
    </section>
  </div>
);

export default CommunityActions;
