/**
 * Copyright (C) 2026  Frank Eberle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import GitHubIcon from '@mui/icons-material/GitHub';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

import { Conditional } from './helper';
import { ConfirmProvider } from 'material-ui-confirm';
import GlobalStateContext from './GlobalStateContext';
const appVersion = import.meta.env.PACKAGE_VERSION;

export default function AboutDialog({show, closeAction}) {
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.getObj("config", {});

  return (
    <Dialog
      open={show}
      maxWidth={'sm'}
    >
      <DialogTitle>
          About
      </DialogTitle>
      <DialogContent dividers={true} style={{minWidth: '600px'}}>
        <Box sx={{textAlign: "center"}}>
          <h1>CycloneDX Editor</h1>
          <Box sx={{mb: "2em"}}>Version {appVersion}</Box>
          <Conditional show={config.version !== undefined}>
            <Box sx={{mb: "2em"}}>Config Version {config.version}</Box>
          </Conditional>
          <Box>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => {
                window.open("https://github.com/FrankEberle/CycloneDX_Editor", "_blank");
              }}
            >
              View project on GitHub
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeAction}
          variant='contained'
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}