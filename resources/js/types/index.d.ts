export interface PageProps extends Record<string, any> {
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export {};

declare module '@/Layouts/AppLayout' {
  import { FC, ReactNode } from 'react';
  const AppLayout: FC<{ children: ReactNode; title?: string }>;
  export default AppLayout;
}

declare module '*.tsx' {
  const value: any;
  export default value;
}