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
import GlobalStateContext from "./GlobalStateContext";

export default function GlobalStateProvider({children}) {
  const [data, setData] = React.useState({modified: false});

  const globalState = {
    get: (key, defaultValue) => {
      return data[key] === undefined ? defaultValue : data[key];
    },
    getObj: (key) => {
      return data[key] === undefined ? {} : data[key];
    },
    getBool: (key) => {
      return data[key] === undefined ? false : data[key];
    },
    has: (key) => {
      return data[key] !== undefined ? true : false;
    },
    set: (key, value) => {
      data[key] = value;
      setData({...data});
    }
  }

  return (
    <>
      <GlobalStateContext.Provider value={globalState}>
        {children}
      </GlobalStateContext.Provider>
    </>
  );
}