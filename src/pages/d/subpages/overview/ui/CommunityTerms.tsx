import { FC, memo } from "react";
import s from "./CommunityTerms.module.scss";

interface OwnProps {
  communityName: string;
  links: { label: string; href: string }[];
}

const CommunityTerms: FC<OwnProps> = ({ communityName, links }) => (
  <footer className={s.footer}>
    <nav className={s.footerNavigation}>
      {links.map((link, index) => (
        <a
          key={`${link.label}${index}`}
          href={link.href}
          aria-label={link.label}
        >
          {link.label}
        </a>
      ))}
    </nav>
    <p>&copy; 2025 ,{communityName} Community.</p>
  </footer>
);

export default memo(CommunityTerms);
