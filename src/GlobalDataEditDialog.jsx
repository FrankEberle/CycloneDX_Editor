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

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import GlobalEdit from './GlobalDataEdit';
import * as CycloneDX from './cyclonedx';
import { useFormValidate } from './hooks';


export default function GlobalDataEditDialog({bom, open, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();
  
  function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      CycloneDX.formDataCopy(bom, new FormData(event.currentTarget));
      saveAction();
    }
  }

  return (
    <Dialog open={open}
      fullScreen={true}
      disableRestoreFocus
    >
      <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeAction}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Edit Global Data
            </Typography>
            <Button autoFocus color="inherit" type='submit' form='global-data-edit-form'>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <form id="global-data-edit-form" onSubmit={onSubmit}>
            <GlobalEdit
              register={register}
              bom={bom}
            />
          </form>
        </DialogContent>
    </Dialog>
  );
}