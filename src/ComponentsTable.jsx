import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Toolbar from '@mui/material/Toolbar';


export default function ComponentsTable({components}) {
  return (
    <Paper sx={{width: '100%', mb: 2}}>
        <Toolbar/>
        <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="components table">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell>Name</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {components.map((component) => (
                        <TableRow
                            key={component.name + component.version}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                            
                                />
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {component.name}
                            </TableCell>
                            <TableCell>{component.version}</TableCell>
                            <TableCell>{component.type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
}
