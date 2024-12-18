import React from 'react';
import { Chip, ChipProps, Typography, chipClasses } from '@mui/material';
import { DoneAllRounded, CheckRounded } from '@mui/icons-material';

interface MessageTimeSendProps {
  onlyAbsolute?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  isSent: boolean;
  timestamp: string;
  unread?: boolean;
}

const DefaultChip: React.FC<ChipProps> = props => {
  return (
    <Chip
      size="sm"
      sx={{
        px: 0.25,
        zIndex: 10,
        backgroundColor: 'transparent',
        float: 'right',
        flexWrap: 'wrap',
        ...(props.sx || {}),

        [`& .${chipClasses.label}`]: {
          display: 'flex',
          gap: 0.25,
        },
      }}
      variant="soft"
    >
      {props.children}
    </Chip>
  );
};

const MessageTimeSend: React.FC<MessageTimeSendProps> = ({
  isSent,
  timestamp,
  unread,
  startDecorator,
  endDecorator,
  onlyAbsolute = false,
}) => {
  const stateIcon =
    isSent &&
    (!unread ? <CheckRounded fontSize="small" sx={{ p: 0.15 }} /> : <DoneAllRounded fontSize="small" sx={{ p: 0.15 }} />);

  const content = (
    <Typography
      component="span"
      level="body-xs"
      sx={{
        display: 'inline-flex',
        alignItems: 'start',
        fontStyle: 'italic',
        flexWrap: 'wrap',
        whiteSpace: 'wrap',
        color: 'text.primary',
        px: 0.25,
        gap: 0.3,
        fontWeight: 'normal',
      }}
    >
      {startDecorator}
      {timestamp}
      {stateIcon}
      {endDecorator}
    </Typography>
  );

  return (
    <span>
      {!onlyAbsolute && (
        <DefaultChip
          sx={{
            ...(isSent && { pr: 0 }),
            visibility: 'hidden',
          }}
        >
          {content}
        </DefaultChip>
      )}
      <DefaultChip
        sx={{
          ...(onlyAbsolute
            ? {
                borderRadius: 'md',
                bgcolor: 'background.level2',

                m: 'calc((var(--Message-RoundedSize) - (var(--Message-RoundedSize) / 1.5)))',
              }
            : {
                pr: 1,
              }),

          ...(isSent && { pr: 0 }),
          position: 'absolute',
          right: 1,
          bottom: 0,
          alignItems: 'end',
        }}
      >
        {content}
      </DefaultChip>
    </span>
  );
};

export default MessageTimeSend;
