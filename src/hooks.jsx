function useFormValidate() {
  const elements = Array();
  let idx = 0;

  return {
    register: (name) => {
      let currentIdx = idx;
      elements[currentIdx] = {current: null};
      idx += 1;
      return {
        name: name,
        ref: (elem) => {if (elem != null) elements[currentIdx].current = elem},
      };
    },
    validate: () => {
      let isValid = true;
      elements.forEach((elem) => {
        if (elem.current != null) {
          if (! elem.current.validate()) {
            isValid = false;
          }
        }
      });
      return isValid;
    }
  }
}

export {
  useFormValidate,
}