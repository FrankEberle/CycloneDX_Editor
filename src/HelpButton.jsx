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
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export default function HelpButton({helpText}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(e) {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }

  return (
    <>
      <span onClick={handleClick} style={{display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>
        <HelpOutlineIcon fontSize="small" />
      </span>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        onClick={e => e.stopPropagation()}
      >
        <Typography component="div" sx={{p: 2, maxWidth: 400}}>
          <Markdown remarkPlugins={[remarkGfm]}>{helpText}</Markdown>
        </Typography>
      </Popover>
    </>
  );
}
