import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export default function YesNoDialog({open, title, text, yesAction, noAction}) {
  if (! open) {
    return <></>
  }
  return (
    <Dialog
      open={true}
      maxWidth="lg"
      disableRestoreFocus
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={noAction}>No</Button>
        <Button onClick={yesAction}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}