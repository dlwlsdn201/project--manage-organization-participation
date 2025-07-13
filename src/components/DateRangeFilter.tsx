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
    <div className={`relative inline-block ${className}`}>
      <div
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer text-sm text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 min-w-[200px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} />
        <span>{getDisplayText()}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1 p-4">
          <div className="flex flex-col gap-1 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.key}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm text-gray-700 transition-all duration-200 hover:bg-gray-100 ${
                  value.preset === preset.key
                    ? 'bg-indigo-100 text-indigo-800 font-medium'
                    : ''
                }`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {value.preset === 'custom' && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs font-medium text-gray-700">
                  시작일
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs font-medium text-gray-700">
                  종료일
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 border border-slate-200 rounded hover:bg-slate-200 transition-colors"
              onClick={clearFilter}
            >
              초기화
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded hover:shadow-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              적용
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
