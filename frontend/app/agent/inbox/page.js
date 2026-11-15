import Inbox from '@/components/Inbox';

export const metadata = { title: 'Review inbox', description: 'Requests the classifier was not confident about, waiting for an agent to review.' };

export default function Page() {
  return <Inbox />;
}
