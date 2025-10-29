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


export default function EditTable({items, title, colSpec, readOnly, addAction, editAction, deleteAction}) {
  /*
  {
    label: "",
    getter: "",
    maxWidth: "",
  }
  */

  console.log("items %o", items);

  const [del, setDel] = React.useState(undefined);
  
  if (readOnly === undefined) readOnly = false;

  return (
    <Box>
      <YesNoDialog 
        open={del !== undefined}
        title="Confirmation"
        text={`Are you sure to delete the ${title[0]}?`}
        yesAction={() => {
          deleteAction(del);
          setDel(undefined);
        }}
        noAction={() => {
          setDel(undefined);
        }}
      />
      <TableContainer sx={{mt: 3}}>
        <Table size='small' sx={{tableLayout: 'fixed'}}>
          <TableHead>
            <TableRow sx={{borderBottomStyle: 'double', borderBottomColor: 'divider'}}>
              <TableCell colSpan={readOnly ? colSpec.length : colSpec.length + 1}>{title[1]}</TableCell>
            </TableRow>
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
            <Conditional show={items.length > 0}>
            { items.map((item, idx) => {
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
                      <IconButton aria-label="Delete" onClick={() => {setDel(idx)}}><DeleteIcon/></IconButton>
                    </TableCell>
                  </Conditional>
                </TableRow>
            );
            })}
          </Conditional>
          <Conditional show={items.length == 0}>
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
