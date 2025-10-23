import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';


export default function SaveDialog({open, filename, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    saveAction(data);
    closeAction();
  }

  if (! open) {
    return <></>
  }
  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth={true}
      disableRestoreFocus
    >
      <DialogTitle>Save BOM</DialogTitle>
      <DialogContent dividers>
        <form id="bom-save-dialog" onSubmit={formSubmit}>
        <Stack>
          <TextField
            label="Filename"
            name="filename"
            variant="standard"
            sx={{mt: 2}}
            required
            autoFocus
            defaultValue={filename}
          />
        </Stack>
      </form>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          form="bom-save-dialog"
        >
          Save
        </Button>
        <Button onClick={closeAction}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}