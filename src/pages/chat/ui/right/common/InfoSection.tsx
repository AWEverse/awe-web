import { Avatar, Button } from "@mui/material";
import { FC, memo, ReactNode } from "react";
import s from "./InfoSection.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import InfoAction from "./InfoAction";

interface InfoSectionProps {
  className?: string;
  user?: {
    name?: string;
    username?: string;
    pronouns?: string;
    lastSeen?: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
    location?: string;
    website?: string;
    bio?: string;
  };
  onFollowClick?: () => void;
}

const defaultUser = {
  name: "John Doe",
  username: "volynetstyle",
  pronouns: "he/him",
  lastSeen: "2 hours ago",
  avatarUrl: "https://mui.com/static/images/avatar/1.jpg",
  phone: "+1 555 555-5555",
  email: "john.doe@example.com",
  location: "New York, NY",
  website: "https://johndoe.com",
  bio: "Software developer passionate about open-source projects and technology.",
};

const InfoSection: FC<InfoSectionProps> = ({
  className,
  user = defaultUser,
  onFollowClick,
}) => {
  const {
    name,
    username,
    pronouns,
    lastSeen,
    avatarUrl,
    phone,
    email,
    location,
    website,
    bio,
  } = user;

  return (
    <section
      className={buildClassName(s.InfoSection, className)}
      aria-label="User profile information"
    >
      <Avatar
        className={s.Avatar}
        src={avatarUrl}
        alt={`${name}'s avatar`}
        sx={{ width: 140, height: 140 }}
      />
      <div className={s.UserDetails}>
        <h1>{name}</h1>
        <p>
          @{username} {pronouns && `· ${pronouns}`}
        </p>
        <span className={s.LastSeen}>Last seen {lastSeen}</span>
        {bio && <p className={s.Bio}>{bio}</p>}
      </div>
      <div className={s.ContactInfo}>
        {location && (
          <InfoAction
            startDecorator="📍"
            subtitle="Location"
            title={location}
          />
        )}
        {phone && (
          <InfoAction startDecorator="📞" subtitle="Phone" title={phone} />
        )}
        {email && (
          <InfoAction
            startDecorator="✉️"
            subtitle="Email"
            title={email}
            onClick={() => (window.location.href = `mailto:${email}`)}
          />
        )}
        {website && (
          <InfoAction
            startDecorator="🌐"
            subtitle="Website"
            title={website}
            onClick={() => window.open(website, "_blank")}
          />
        )}
      </div>
      <div className={s.Actions}>
        <Button
          variant="contained"
          onClick={onFollowClick}
          className={s.FollowButton}
          aria-label={`Follow ${name}`}
        >
          Follow
        </Button>
      </div>
    </section>
  );
};

export default memo(InfoSection);
