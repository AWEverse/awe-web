import { Avatar } from "@mui/material";
import "./CommunityHeader.scss";

interface CommunityHeaderProps {
  avatarUrl?: string;
  communityType?: string;
  communityName?: string;
  description?: string;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  avatarUrl = "https://i.pravatar.cc/300",
  communityType = "Community",
  communityName = "TechInnovators",
  description = "A community for discussing anything related to the React UI framework and its ecosystem. Join the Reactiflux Discord (reactiflux.com) for additional React discussion and help.",
}) => (
  <header className="community-header" role="banner">
    <img
      src="https://edc-cdn.net/assets/images/default-user-bg.svg"
      className="community-header__background"
      data-bg="https://edc-cdn.net/assets/images/default-user-bg.svg"
    ></img>
    <div className="community-header__container">
      <Avatar
        src={avatarUrl}
        alt={`${communityName} avatar`}
        className="community-header__avatar"
      />
      <div className="community-header__content">
        <span className="community-header__type">{communityType}</span>
        <h1 className="community-header__title">{communityName}</h1>
        <p className="community-header__description">{description}</p>
      </div>
    </div>
  </header>
);

export default CommunityHeader;
