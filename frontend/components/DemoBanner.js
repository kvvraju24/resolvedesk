'use client';
import { useAuth } from './Providers';

// Shown only when the API reports demo mode: shared accounts can read everything submitted.
export default function DemoBanner() {
  const { demo } = useAuth();
  if (!demo) return null;
  return (
    <div className="demo-banner" role="note">
      <strong>Public demo.</strong> Anyone can sign in with the shared demo accounts and read what you submit.
      Do not enter personal or confidential information.
    </div>
  );
}
