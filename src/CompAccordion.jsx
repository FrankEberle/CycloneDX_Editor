import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export default function CompAccordion({title, id, defaultExpanded, children, ref}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded === true ? true : false);

  React.useImperativeHandle(ref, () => {
    return {
      showFailedValidation: () => {
        setExpanded(true);
      }
    };
  }, []);

  function handleChange(event, isExpanded) {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      
      sx={{width: '100%'}}
      expanded={expanded}
      onChange={handleChange}
    >
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