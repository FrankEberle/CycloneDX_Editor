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
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

export default function ValidationDialog({result, closeAction}) {
  if (!result) return null;

  const html = result.information?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') || '';
  const isSuccess = Boolean(result.success);

  return (
    <Dialog
      open={Boolean(result)}
      onClose={closeAction}
      maxWidth={'sm'}
      fullWidth
    >
      <DialogTitle sx={{color: isSuccess ? 'success.main' : 'error.main'}}>
        {isSuccess ? 'Validation Successful' : 'Validation Failed'}
      </DialogTitle>
      <DialogContent sx={{minWidth: '350px'}}>
        <Typography component="div">
          <span dangerouslySetInnerHTML={{__html: html}} />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeAction}
          color={isSuccess ? 'primary' : 'error'}
          variant='contained'
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
