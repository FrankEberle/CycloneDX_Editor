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
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import GridViewIcon from '@mui/icons-material/GridView';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import AutoHideSpeedDial from './AutoHideSpeedDial';


export default function ComponentSpeedDial({addAction, editAction, deleteAction, viewSwitchAction, changeParentAction}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <AutoHideSpeedDial
      ariaLabel='Component Actions'
      sx={{ position: 'absolute', bottom: 20, left: 20 }}
      icon={<SpeedDialIcon />}
      open={isOpen}
      onClick={() => {setIsOpen(!isOpen)}}
    >
      <SpeedDialAction
        key={'add'}
        icon=<AddBoxIcon/>
        slotProps={{
          tooltip: {
            title: 'Add Component',
          },
        }}
        onClick={() => {
          setIsOpen(false);
          addAction();
        }}
      />
      <SpeedDialAction
      sx={{display: editAction === undefined ? 'none' : 'block'}}
        key={'edit'}
        icon=<EditIcon/>
        slotProps={{
          tooltip: {
            title: 'Edit Component',
          },
        }}
        onClick={() => {
          setIsOpen(false);
          editAction();
        }}
      />
      <SpeedDialAction
          sx={{display: deleteAction === undefined ? 'none' : 'block'}}
          key={'delete'}
          icon=<DeleteIcon/>
          slotProps={{
            tooltip: {
              title: 'Delete Component',
            },
          }}
          onClick={() => {
            setIsOpen(false);
            deleteAction();
          }}
        />
      <SpeedDialAction
          sx={{display: changeParentAction === undefined ? 'none' : 'block'}}
          key={'changeParent'}
          icon=<AutoAwesomeMotionIcon/>
          slotProps={{
            tooltip: {
              title: 'Change Parent',
            },
          }}
          onClick={() => {
            setIsOpen(false);
            changeParentAction();
          }}
      />
      <SpeedDialAction
          key={'switchView'}
          icon=<GridViewIcon/>
          slotProps={{
            tooltip: {
              title: 'Switch View',
            },
          }}
          onClick={() => {
            setIsOpen(false);
            viewSwitchAction();
          }}
        />

    </AutoHideSpeedDial>
  );
}