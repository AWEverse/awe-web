import React from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import ModalClose from '@mui/material/ModalClose';
import Sheet from '@mui/material/Sheet';

const FollowedModal = () => {
  const [open, setOpen] = React.useState(false);
  const dataOpen = open ? 'open' : 'closed';

  return (
    <React.Fragment>
      <Button color="neutral" variant="outlined" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        keepMounted
        aria-describedby="modal-desc"
        aria-labelledby="modal-title"
        data-open={dataOpen}
        open={open}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 500ms ease',
          opacity: 0,
          [`&[data-open="open"]`]: {
            opacity: 1,
          },
        }}
        onClose={() => setOpen(false)}
      >
        <Sheet
          data-open={dataOpen}
          sx={{
            borderRadius: 'md',
            transition: 'all 500ms ease',
            opacity: 0,
            transform: 'scale(0)',
            [`&[data-open="open"]`]: {
              opacity: 1,
              transform: 'scale(1)',
            },
            maxWidth: 500,
            p: 1,
            boxShadow: 'lg',
          }}
          variant="soft"
        >
          <ModalClose sx={{ m: 1 }} variant="plain" />
        </Sheet>
      </Modal>
    </React.Fragment>
  );
};

export default FollowedModal;
