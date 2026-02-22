import React from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import YesNoDialog from './YesNoDialog';
import { Conditional } from './helper';
import { TextField } from '@mui/material';



export default function StrTable({items, title, readOnly}) {
  const [itemsList, setItemsList] = React.useState(items);
  const [delIdx, setDelIdx] = React.useState(undefined);
  const [editIdx, setEditIdx] = React.useState(undefined);

  function handleSubmit(event) {
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    if (editIdx == -1) {
      items.push(formData.editString);
    } else {
      items[editIdx] = formData.editString;
    }
    setItemsList([...items]);
    setEditIdx(undefined);
    event.preventDefault();
    event.stopPropagation();
  }

  React.useEffect(() => {
    setItemsList(items);
  }, [items]);

  return (
    <>
      <Conditional show={editIdx !== undefined}>
        <Dialog
          open={editIdx !== undefined}
          fullWidth
          maxWidth="sm"
          disableRestoreFocus
        >
          <DialogTitle>{(editIdx == -1 ? "New" : "Edit") + ` ${title}`}</DialogTitle>
          <DialogContent>
            <DialogContentText></DialogContentText>
              <form onSubmit={handleSubmit} id="edit_string">
                <TextField
                  autoFocus
                  required
                  name="editString"
                  label={title}
                  defaultValue={items[editIdx]}
                  margin="dense"
                  fullWidth
                />
              </form>
            <DialogActions>
            <Button type="submit" form="edit_string">Save</Button>
            <Button onClick={() => {setEditIdx(undefined)}}>Cancel</Button>
          </DialogActions>
          </DialogContent>
        </Dialog>
      </Conditional>

      <YesNoDialog 
        open={delIdx !== undefined}
        title="Confirmation"
        text={"Are you sure to delete the URL"}
        yesAction={() => {
          items.splice(delIdx, 1);
          setItemsList([...items]);
          setDelIdx(undefined);
        }}
        noAction={() => {
          setDelIdx(undefined);
        }}
      />

      <TableContainer>
        <Table size='small' sx={{tableLayout: 'fixed'}}>
          <TableHead>
            <TableRow>
              <TableCell>
                {title}
              </TableCell>
              <Conditional show={! readOnly}>
                <TableCell align='right'>
                  <IconButton aria-label="Add" onClick={() => {setEditIdx(-1)}}><AddIcon/></IconButton>
                </TableCell>
              </Conditional>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemsList.map((url, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell>
                    {url}
                  </TableCell>
                  <Conditional show={! readOnly}>
                    <TableCell align='right'>
                      <IconButton aria-label="Edit" onClick={() => {setEditIdx(idx)}}><EditIcon/></IconButton>
                      <IconButton aria-label="Delete" onClick={() => {setDelIdx(idx)}}><DeleteIcon/></IconButton>
                    </TableCell>
                  </Conditional>
                </TableRow>
              );
            })}
            <Conditional show={itemsList.length == 0}>
              <TableRow>
                <TableCell colSpan={readOnly ? 1 : 2}>No entries</TableCell>
              </TableRow>
            </Conditional>

          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}