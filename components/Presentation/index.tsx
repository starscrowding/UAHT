import dynamic from 'next/dynamic';

export const Presentation: any = dynamic(() => import('./canva').then(mod => mod.Canva) as any, {
  ssr: false,
});
