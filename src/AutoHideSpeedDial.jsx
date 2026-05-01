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

export default function AutoHideSpeedDial(props) {
  const [visible, setVisible] = React.useState(true);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(true), 800);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SpeedDial
      {...props}
      sx={{ ...props.sx, transition: 'opacity 0.3s', opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    />
  );
}
