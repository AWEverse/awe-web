import { FC, ReactNode } from "react";

import s from "./HomePage.module.scss";
import ActionCard from "./ActionCard";
import IconButton from "@/shared/ui/IconButton";
import { ArrowDownward } from "@mui/icons-material";

interface OwnProps {}

interface StateProps {}

const HomePage: FC<OwnProps & StateProps> = () => {
  return (
    <div className={s.homePage}>
      <section className={s.section}>
        <header className={s.header}>
          <h1 className={s.title}>
            <b>AWE:</b>
          </h1>
          <div className={s.subtitle}>
            <i>Everything you need. Anytime. Anywhere.</i>
            <i>All your essentials, unified in one platform.</i>
          </div>
        </header>
        <p className={s.description}>
          This is the home page of our application. You can find various
          features and information here.
        </p>

        <div className={s.ActionCardContinue}>
          <IconButton className={s.continueButton}>
            <ArrowDownward />
          </IconButton>
        </div>
      </section>

      <section className={s.section} data-scrollable="true">
        <h2 className={s.title}>
          Ready to take action? Review today's non-essential changes
        </h2>
        <div className={s.cardContainer}>
          <ActionCard
            title="Update Profile"
            description="Add your latest contact info and profile picture."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
          <ActionCard
            title="Review Tasks"
            description="Check your pending tasks for today and mark them as done."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
          <ActionCard
            title="Explore New Features"
            description="Discover what's new in the latest app update."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
          <ActionCard
            title="Connect Accounts"
            description="Link your email and calendar for seamless integration."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
          <ActionCard
            title="Security Check"
            description="Review your security settings and enable 2FA."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
          <ActionCard
            title="Feedback"
            description="Share your thoughts to help us improve the platform."
            onClose={() => {}}
            closeIcon={<span className={s.closeIcon}>×</span>}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
