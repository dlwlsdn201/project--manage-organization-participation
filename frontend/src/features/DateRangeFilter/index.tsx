import { useState, useEffect } from 'react';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
}: DateRangeFilterProps) {
  const [preset, setPreset] = useState<string>('custom');

  const handlePresetChange = (value: string) => {
    setPreset(value);

    const now = dayjs();
    let newStartDate: Date | null = null;
    let newEndDate: Date | null = null;

    switch (value) {
      case 'thisMonth':
        newStartDate = now.startOf('month').toDate();
        newEndDate = now.endOf('month').toDate();
        break;
      case 'lastMonth':
        newStartDate = now.subtract(1, 'month').startOf('month').toDate();
        newEndDate = now.subtract(1, 'month').endOf('month').toDate();
        break;
      case 'last3Months':
        newStartDate = now.subtract(3, 'month').startOf('month').toDate();
        newEndDate = now.endOf('month').toDate();
        break;
      case 'thisYear':
        newStartDate = now.startOf('year').toDate();
        newEndDate = now.endOf('year').toDate();
        break;
      case 'custom':
      default:
        newStartDate = null;
        newEndDate = null;
        break;
    }

    onDateChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleRangeChange = (dates: unknown) => {
    if (dates && Array.isArray(dates)) {
      onDateChange({
        startDate: dates[0] ? dates[0].toDate() : null,
        endDate: dates[1] ? dates[1].toDate() : null,
      });
      setPreset('custom');
    } else {
      onDateChange({ startDate: null, endDate: null });
      setPreset('custom');
    }
  };

  useEffect(() => {
    // 현재 선택된 날짜 범위에 맞는 프리셋 찾기
    if (!startDate && !endDate) {
      setPreset('custom');
      return;
    }

    const now = dayjs();
    const start = startDate ? dayjs(startDate) : null;
    const end = endDate ? dayjs(endDate) : null;

    if (
      start?.isSame(now.startOf('month')) &&
      end?.isSame(now.endOf('month'))
    ) {
      setPreset('thisMonth');
    } else if (
      start?.isSame(now.subtract(1, 'month').startOf('month')) &&
      end?.isSame(now.subtract(1, 'month').endOf('month'))
    ) {
      setPreset('lastMonth');
    } else if (
      start?.isSame(now.subtract(3, 'month').startOf('month')) &&
      end?.isSame(now.endOf('month'))
    ) {
      setPreset('last3Months');
    } else if (
      start?.isSame(now.startOf('year')) &&
      end?.isSame(now.endOf('year'))
    ) {
      setPreset('thisYear');
    } else {
      setPreset('custom');
    }
  }, [startDate, endDate]);

  return (
    <div className="flex items-center gap-4">
      <Select
        value={preset}
        onChange={handlePresetChange}
        style={{ width: 120 }}
        placeholder="날짜 범위 선택"
      >
        <Option value="custom">사용자 정의</Option>
        <Option value="thisMonth">이번 달</Option>
        <Option value="lastMonth">지난 달</Option>
        <Option value="last3Months">최근 3개월</Option>
        <Option value="thisYear">올해</Option>
      </Select>

      <RangePicker
        value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
        onChange={handleRangeChange}
        placeholder={['시작일', '종료일']}
        format="YYYY-MM-DD"
      />
    </div>
  );
}
