import ModelHealth from '@/components/ModelHealth';

export const metadata = { title: 'Model health', description: 'Drift checks: confidence shift, review load and estimated auto-route precision against validation.' };

export default function Page() {
  return <ModelHealth />;
}
