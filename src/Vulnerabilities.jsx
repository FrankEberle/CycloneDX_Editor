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

import React from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';


function VulnerabilityEditDialog({vulnerability, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    const data = {
      ...vulnerability,
      ...Object.fromEntries(formData.entries()),
    };
    if (data.state == '-') data.state = '';
    if (data.justification == '-') data.justification = '';
    saveAction(data);
  }

  function getValue(field, defaultValue) {
    if (vulnerability[field] === undefined) {
      return defaultValue;
    }
    return vulnerability[field];
  }

  if (vulnerability === undefined) {
    return <></>;
  }

  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{vulnerability["_id"] === undefined ? "New" : "Edit"} Vulnerability</DialogTitle>
    <DialogContent>
      <form id="vulnerability-form" onSubmit={formSubmit}>
        <Stack>
          <TextField
            label="ID"
            name="id"
            variant="standard"
            size='small'
            sx={{mt: 2}}
            required
            defaultValue={getValue("id", "")}
          />
          <TextField
              select
              label="State"
              name="state"
              variant='standard'
              autoFocus
              sx={{mt: 2}}
              slotProps={{
                  select: {
                      native: true,
                  },
              }}
              defaultValue={getValue("state", "")}
          >
              <option key="-" value="-">Not selected</option>
              { CycloneDX.getVulnAnalysisStates().map((v) => (
                  <option key={v} value={v}>{v}</option>
              ))}
          </TextField>
          <TextField
              select
              label="Justification"
              name="justification"
              variant='standard'
              autoFocus
              sx={{mt: 2}}
              slotProps={{
                  select: {
                      native: true,
                  },
              }}
              defaultValue={getValue("justification", "")}
          >
              <option key="-" value="-">Not selected</option>
              { CycloneDX.getVulnAnalysisJustifications().map((v) => (
                  <option key={v} value={v}>{v}</option>
              ))}
          </TextField>
          <TextField
            label="Detail"
            name="detail"
            variant="standard"
            multiline
            rows={5}
            sx={{mt: 2, mb: 2}}
            size='small'
            defaultValue={getValue("detail", "")}
          />
        </Stack>
      </form>
    </DialogContent>
    <DialogActions>
          <Button
            type="submit"
            form="vulnerability-form"
          >
            Save
          </Button>
          <Button
            onClick={() => closeAction()}
          >
              Cancel
          </Button>
        </DialogActions>
    </Dialog>
  );
}

export default function Vulnerabilities({vulnerabilities, noTitle, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [vulnList, setVulnList] = React.useState([]);

  React.useEffect(() => {
    setVulnList(vulnerabilities);
  }, [vulnerabilities]);

  return (
    <>
      <VulnerabilityEditDialog
        vulnerability={edit}
        saveAction={(vulnerability) => {
          if (vulnerability["_id"] === undefined) {
            vulnerabilities.push(CycloneDX.prepareVulnerability(vulnerability));
          } else {
            CycloneDX.replaceArrayElem(vulnerabilities, vulnerability);
          }
          setEdit(undefined);
          setVulnList([...vulnerabilities]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={['Vulnerability', 'Vulnerabilities']}
        noTitle={noTitle}
        readOnly={readOnly}
        items={vulnList}
        addAction={() => {setEdit({})}}
        editAction={(ref) => {setEdit(CycloneDX.deepCopy(ref))}}
        deleteAction={(idx) => {
          vulnerabilities.splice(idx, 1);
          setVulnList([...vulnerabilities]);
        }}
        colSpec={
          [
            {
              label: 'ID',
              getter: 'id',
              maxWidth: 200,
            },
            {
              label: 'State',
              getter: 'state',
            },
            {
              label: 'Justification',
              getter: 'justification',
            }

          ]
        }
      />
    </>
  )
}