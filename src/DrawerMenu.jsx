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