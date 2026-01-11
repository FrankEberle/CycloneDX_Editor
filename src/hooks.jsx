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

function useFormValidate() {
  const elements = Array();
  let idx = 0;

  return {
    register: (name) => {
      let currentIdx = idx;
      elements[currentIdx] = {current: null};
      idx += 1;
      return {
        name: name,
        ref: (elem) => {if (elem != null) elements[currentIdx].current = elem},
      };
    },
    validate: () => {
      let isValid = true;
      elements.forEach((elem) => {
        if (elem.current != null) {
          if (! elem.current.validate()) {
            isValid = false;
          }
        }
      });
      return isValid;
    }
  }
}

export {
  useFormValidate,
}