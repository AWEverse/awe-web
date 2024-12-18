import { FC } from 'react';
import s from './ProfileDescription.module.scss';

const ProfileDescription: FC = () => {
  return (
    <>
      <div className={s.Description}>
        <h2 className={s.Title}>Description</h2>
        <p>
          Methodical, inventive, and detail-oriented. A programmer with deep expertise across modern
          web technologies, known for a passion for optimization, clean archite
        </p>
      </div>

      <div className={s.Separator}></div>

      <section className={s.ProfileDescription}>
        <div className={s.Description}>
          <h2 className={s.Title}>About Me</h2>
          <div className={s.Content}>
            <p className={s.Intro}>
              <span className={s.Emoji}>👋</span> Hi there! I'm a passionate programmer with a love
              for solving problems.
            </p>
            <p className={s.Detail}>
              Methodical, <span className={s.Highlight}>inventive</span>, and{' '}
              <span className={s.Highlight}>detail-oriented</span>. I specialize in modern web
              technologies and am always looking to optimize processes.
            </p>
            <p className={s.Extras}>
              <span className={s.Emoji}>🎯</span> Clean architecture? Yes, please!
              <br />
              <span className={s.Emoji}>🔥</span> Always keeping up with the latest tech trends.
              <br />
              <span className={s.Emoji}>💡</span> If it's about innovation, count me in!
            </p>
          </div>
        </div>

        <div className={s.Description}>
          <h2 className={s.Title}>Experience</h2>
          <ul className={s.List}>
            <li className={s.Item}>
              <h3 className={s.Subtitle}>Frontend Developer</h3>
              <p className={s.Detail}>
                <span className={s.Highlight}>Atlassian</span>, San Francisco
                <br />
                <span className={s.Extra}>2021 - Present</span>
                <br />
                <span className={s.Extra}>Description</span>
                <br />
                <span className={s.Extra}>Highlights</span>
                <br />
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default ProfileDescription;
