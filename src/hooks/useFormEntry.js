import { useCallback, useState } from "react";

export default function useFormEntry(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, setValue, {
    value,
    onChange
  }];
}
