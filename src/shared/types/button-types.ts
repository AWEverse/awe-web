// `cmn` is  abbreviation for `common`
export type cmn_ButtonSize = 'small' | 'medium' | 'large';
export type cmn_ButtonVariants = 'text' | 'contained' | 'outlined' | 'ghost' | 'link';
export type cmn_ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'warning'
  | 'success'
  | 'error';

export type cmn_ButtonProps = {
  activity?: boolean | 'disabled' | (() => boolean);
  size?: cmn_ButtonSize;
  variant?: cmn_ButtonVariants;
  color?: cmn_ButtonColor;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode;
  tabIndex?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};
