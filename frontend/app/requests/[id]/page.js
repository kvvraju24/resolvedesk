import RequestDetail from '@/components/RequestDetail';

export const metadata = { title: 'Request status', description: 'Status, routing and conversation for a ResolveDesk support request.' };

export default async function Page({ params }) {
  const { id } = await params;
  return <RequestDetail id={id} />;
}
