  function ReadOnly({readOnly, children}) {
    if (readOnly) return (<></>);
    return (
      <>{children}</>
    );
  }

  export {ReadOnly}
