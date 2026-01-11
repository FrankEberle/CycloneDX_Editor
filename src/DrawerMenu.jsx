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
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export default function DrawerButton({options}) {
    const [open, setOpen] = React.useState(false);

    function optionClicked(action) {
        action();
        setOpen(false);
    }

    function OptionSet({set}) {
        return (
            <List>
                {
                  set.map(({label, action, icon}) => {
                      return (
                          <ListItem key={label} disablePadding>
                              <ListItemButton key={label} onClick={() => optionClicked(action)}>
                                  <ListItemIcon>{icon}</ListItemIcon>
                                  <ListItemText primary={label}/>
                              </ListItemButton>
                          </ListItem>
                      )
                  })
                }
            </List>
        );
    }

    return (
        <>
            <IconButton
                id="burger-button"
                onClick={() => setOpen(true) }
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
            >
                <MenuIcon/>
            </IconButton>
            <Drawer open={open} onClose={() => setOpen(false)}>
                <Box role='presentation' sx={{width: 200}}>
                    {
                      options.map((set, idx) => {
                          return (
                              <div key={idx}>
                                  <OptionSet set={set}/>
                                  { idx != (options.length - 1) ? <Divider/> : <></>  }
                              </div>
                          );
                      })
                    }
                </Box>
            </Drawer>

        </>

    );
}