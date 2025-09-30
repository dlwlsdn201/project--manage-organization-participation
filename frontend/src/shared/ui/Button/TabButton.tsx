import { ReactNode } from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}

export const TabButton = ({ isActive, onClick, children }: TabButtonProps) => {
  return (
    <button
      className={`px-3 mobile:px-6 py-2 mobile:py-3 font-medium text-sm mobile:text-base transition-all duration-200 border-b-2 flex items-center justify-center ${
        isActive
          ? 'text-primary-500 border-primary-500 bg-slate-50'
          : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
