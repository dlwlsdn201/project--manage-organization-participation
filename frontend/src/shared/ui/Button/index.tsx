import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface ButtonProps extends Omit<AntButtonProps, 'loading'> {
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <AntButton
      {...props}
      loading={loading}
      disabled={disabled || loading}
      icon={loading ? <LoadingOutlined /> : props.icon}
    >
      {children}
    </AntButton>
  );
};
