import { Select } from 'antd';

interface PlainSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const PlainSelect = ({ options, value, onChange }: PlainSelectProps) => {
  return <Select options={options} value={value} onChange={onChange} />;
};
