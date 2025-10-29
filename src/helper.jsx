function ReadOnly({readOnly, children}) {
  if (readOnly) return (<></>);
  return (
    <>{children}</>
  );
}

function Conditional({show, children}) {
  if (!show) return (<></>);
  return (
    <>{children}</>
  );
}



export {ReadOnly, Conditional}
