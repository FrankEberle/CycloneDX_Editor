import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

import ComponentEdit from './ComponentEdit';


export default function ComponentEditDialog({isOpen, close, component}) {
  return (
    <Dialog open={isOpen} fullScreen={true} maxWidth="1200">
      <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={close}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {component["_id"] === undefined ? "New Component" : "Edit Component"}
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <ComponentEdit
            component={component}
          />
        </DialogContent>
    </Dialog>
  );
}