import { Avatar } from "@mui/material";

const CommunityHeader: React.FC = () => (
  <div className="flex items-center gap-4">
    <img
      src="https://i.pravatar.cc/300"
      className="rounded-full w-[120px] h-[120px]"
    />
    <div className="flex flex-col">
      {/* Community type: Mobile = 16px, Desktop = 24px */}
      <p className="font-normal text-base sm:text-2xl">Community</p>
      {/* Community title: Mobile = 24px, Desktop = 36px with a line-height of 1.2 */}
      <p className="font-bold text-4xl sm:text-xl leading-[1.2]">
        TechInnovators
      </p>
      {/* Community description: Mobile = 12px, Desktop = 14px with a line-height of 1.5 */}
      <p className="font-normal text-md sm:text-sm leading-[1.5]">
        A community for discussing anything related to the React UI framework
        and its ecosystem. Join the Reactiflux Discord (reactiflux.com) for
        additional React discussion and help.
      </p>
    </div>
  </div>
);

export default CommunityHeader;
