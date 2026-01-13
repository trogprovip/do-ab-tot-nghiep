'use client';

import React, { useEffect } from 'react';

interface AntdProviderProps {
  children: React.ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  useEffect(() => {
    // Chỉ load CSS của Ant Design khi component được mount
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/antd@5.22.0/dist/reset.css';
    document.head.appendChild(link);

    return () => {
      // Cleanup khi component unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return <>{children}</>;
}
