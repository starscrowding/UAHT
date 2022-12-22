import dynamic from 'next/dynamic';

export const QRCode: any = dynamic(() => import('react-qr-code').then(mod => mod) as any, {
  ssr: false,
});
