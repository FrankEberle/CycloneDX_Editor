import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import YesNoDialog from './YesNoDialog';
import { Conditional } from './helper';


export default function EditTable({items, title, colSpec, noTitle, noTopMargin, readOnly, addAction, editAction, deleteAction, filter, filterCol}) {
  /*
  {
    label: "",
    getter: "",
    maxWidth: "",
  }
  */
  const [del, setDel] = React.useState(undefined);
  let filteredItems = Array();
  for (let i = 0; i < items.length; i++) {
    if (filter === undefined) {
      filteredItems.push(items[i]);
    } else {
      if (! filter.includes(items[i][filterCol])) {
        filteredItems.push(items[i]);
      }
    }
  }

  if (filter !== undefined) {
    filteredItems.slice(0);
  }
  if (readOnly === undefined) readOnly = false;
  return (
    <Box>
      <YesNoDialog 
        open={del !== undefined}
        title="Confirmation"
        text={`Are you sure to delete the ${title[0]}?`}
        yesAction={() => {
          let delIdx;
          for (let i = 0; i < items.length; i++) {
            if (items[i]._id == del) {
              delIdx = i;
              break;
            }
          }
          deleteAction(delIdx);
          setDel(undefined);
        }}
        noAction={() => {
          setDel(undefined);
        }}
      />
      <TableContainer sx={{mt: noTitle || noTopMargin ? 0 : 3}}>
        <Table size='small' sx={{tableLayout: 'fixed'}}>
          <TableHead>
            <Conditional show={!noTitle}>
              <TableRow sx={{borderBottomStyle: 'double', borderBottomColor: 'divider'}}>
                <TableCell colSpan={readOnly ? colSpec.length : colSpec.length + 1}>{title[1]}</TableCell>
              </TableRow>
            </Conditional>
            <TableRow>
              { colSpec.map((cs) => {
                  let sx = {fontStyle: "italic"}
                  if (cs["maxWidth"] !== undefined) {
                    sx["maxWidth"] = cs.maxWidth;
                  }
                  return (
                  <TableCell sx={sx}>{cs.label}</TableCell>
                  );
                }
              )}
              <Conditional show={!readOnly}>
                <TableCell align='right'><IconButton aria-label="Add" onClick={addAction}><AddIcon/></IconButton></TableCell>
              </Conditional>
            </TableRow>
          </TableHead>          
          <TableBody>
            <Conditional show={filteredItems.length > 0}>
            { filteredItems.map((item, idx) => {
              return (
                <TableRow key={item._id} hover>
                  {
                    colSpec.map((cs) => {
                      let value = "";
                      if (typeof(cs.getter) == "string") {
                        value = item[cs.getter];
                      } else {
                        value = cs.getter(item);
                      }
                      return (
                        <>
                          <TableCell>{value}</TableCell>
                        </>
                      );
                    })
                  }
                  <Conditional show={!readOnly}>
                    <TableCell align='right'>
                      <IconButton aria-label="Edit" onClick={() => {editAction(item)}}><EditIcon/></IconButton>
                      <IconButton aria-label="Delete" onClick={() => {setDel(item._id)}}><DeleteIcon/></IconButton>
                    </TableCell>
                  </Conditional>
                </TableRow>
            );
            })}
          </Conditional>
          <Conditional show={filteredItems.length == 0}>
            <TableRow>
              <TableCell colSpan={readOnly ? colSpec.length : colSpec.length + 1}>No entries</TableCell>
            </TableRow>
          </Conditional>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
