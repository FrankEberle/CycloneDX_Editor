import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export default function CompAccordion({title, id, defaultExpanded, children}) {
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{width: '100%'}}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={id+"-content"}
        id={id}
      >
        <Typography component="span">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}