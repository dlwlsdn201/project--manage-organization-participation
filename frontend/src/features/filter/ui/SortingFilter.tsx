import { PlainSelect, useSelect } from '@/shared/ui';

const options = [
  {
    label: 'Option 1',
    value: 'option1',
  },
  {
    label: 'Option 2',
    value: 'option2',
  },
];

export const SortingFilter = () => {
  const { value, changeValue } = useSelect({ initialValue: 'option1' });

  return <PlainSelect options={options} value={value} onChange={changeValue} />;
};
