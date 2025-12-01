import { useState } from 'react';

export const useSelect = ({ initialValue = '' }: { initialValue?: string }) => {
  const [value, setValue] = useState<string>(initialValue);

  return { value, changeValue: setValue };
};
