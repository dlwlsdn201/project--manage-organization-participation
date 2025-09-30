import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface DefaultButtonProps extends Omit<AntButtonProps, 'loading'> {
  loading?: boolean;
  children: React.ReactNode;
}

export const DefaultButton: React.FC<DefaultButtonProps> = ({
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
