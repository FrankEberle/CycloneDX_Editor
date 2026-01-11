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
import SpeedDial from '@mui/material/SpeedDial';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import GlobalEdit from "./GlobalDataEdit"
import GlobalDataEditDialog from './GlobalDataEditDialog';

export default function GlobalDataView({bom, show}) {
  const [openDialog, setOpenDialog] = React.useState(false);
  if (! show) {
    return <></>;
  }
  return (
    <>
      <SpeedDial
        ariaLabel='Global Data Actions'
        sx={{ position: 'absolute', bottom: 20, left: 20 }}
        icon={<EditIcon />}
        open={false}
        onClick={() => {setOpenDialog(true)}}
      />
      <GlobalDataEditDialog
        open={openDialog}
        bom={bom}
        saveAction={() => {setOpenDialog(false)}}
        closeAction={() => {setOpenDialog(false)}}
        
      />
      <Box sx={{display: show ? 'flex' : 'none', mt: 1, p: 2, flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto', visibility: 'visible'}}>
        <GlobalEdit
          bom={bom}
          readOnly={true}
        />
      </Box>
    </>
  );
}