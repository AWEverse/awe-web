import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import styles from './LinkFlaier.module.scss';

interface LinkFlaierProps extends TypographyProps {
  disableWrapper?: boolean;
  flaier: string;
  text: string;
  flaierHref?: string;
  textHref?: string;
}

const LinkFlaier: React.FC<LinkFlaierProps> = ({
  disableWrapper = false, // Change default to false if you want to wrap by default
  flaier,
  text,
  flaierHref = '#',
  textHref = '#',
  ...otherProps
}) => {
  const containerClass = disableWrapper ? styles.containerInline : styles.containerFlex;

  return (
    <Typography className={containerClass} component="div" {...otherProps}>
      <a className={styles.flaier} href={flaierHref}>
        {flaier}
      </a>
      &nbsp;
      <a className={styles.text} href={textHref}>
        {text}
      </a>
    </Typography>
  );
};

export default LinkFlaier;
