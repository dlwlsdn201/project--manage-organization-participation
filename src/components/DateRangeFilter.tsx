import React, { useState, useEffect } from 'react';
import { DateRangeFilter as DateRangeFilterType } from '../types';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from 'date-fns';

interface DateRangeFilterProps {
  value: DateRangeFilterType;
  onChange: (filter: DateRangeFilterType) => void;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  className = '',
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (value.startDate) {
      setCustomStartDate(format(value.startDate, 'yyyy-MM-dd'));
    }
    if (value.endDate) {
      setCustomEndDate(format(value.endDate, 'yyyy-MM-dd'));
    }
  }, [value.startDate, value.endDate]);

  const presets = [
    {
      key: 'thisMonth' as const,
      label: '이번 달',
      getRange: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      key: 'lastMonth' as const,
      label: '지난 달',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      },
    },
    {
      key: 'last3Months' as const,
      label: '최근 3개월',
      getRange: () => ({
        startDate: startOfMonth(subMonths(new Date(), 2)),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      key: 'thisYear' as const,
      label: '올해',
      getRange: () => ({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      }),
    },
    {
      key: 'custom' as const,
      label: '사용자 지정',
      getRange: () => ({}),
    },
  ];

  const handlePresetSelect = (preset: (typeof presets)[0]) => {
    if (preset.key === 'custom') {
      onChange({
        ...value,
        preset: 'custom',
      });
    } else {
      const range = preset.getRange();
      onChange({
        ...value,
        preset: preset.key,
        startDate: range.startDate,
        endDate: range.endDate,
      });
    }
    setIsOpen(false);
  };

  const handleCustomDateChange = () => {
    const startDate = customStartDate ? new Date(customStartDate) : undefined;
    const endDate = customEndDate ? new Date(customEndDate) : undefined;

    onChange({
      ...value,
      preset: 'custom',
      startDate,
      endDate,
    });
  };

  const getDisplayText = () => {
    if (value.preset && value.preset !== 'custom') {
      const preset = presets.find((p) => p.key === value.preset);
      return preset?.label || '기간 선택';
    }

    if (value.startDate && value.endDate) {
      return `${format(value.startDate, 'yyyy.MM.dd')} - ${format(value.endDate, 'yyyy.MM.dd')}`;
    }

    if (value.startDate) {
      return `${format(value.startDate, 'yyyy.MM.dd')} ~`;
    }

    if (value.endDate) {
      return `~ ${format(value.endDate, 'yyyy.MM.dd')}`;
    }

    return '기간 선택';
  };

  const clearFilter = () => {
    onChange({});
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className={`date-range-filter ${className}`}>
      <div className="date-filter-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={16} />
        <span>{getDisplayText()}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </div>

      {isOpen && (
        <div className="date-filter-dropdown">
          <div className="preset-options">
            {presets.map((preset) => (
              <button
                key={preset.key}
                className={`preset-option ${value.preset === preset.key ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {value.preset === 'custom' && (
            <div className="custom-date-inputs">
              <div className="date-input-group">
                <label>시작일</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                />
              </div>
              <div className="date-input-group">
                <label>종료일</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                />
              </div>
            </div>
          )}

          <div className="filter-actions">
            <button className="btn btn-secondary btn-sm" onClick={clearFilter}>
              초기화
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsOpen(false)}
            >
              적용
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
