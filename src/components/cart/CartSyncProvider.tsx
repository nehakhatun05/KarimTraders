'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store';

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { loadFromDatabase, isSyncing } = useCartStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once when user becomes authenticated
    if (status === 'authenticated' && session?.user?.id && !hasSynced.current && !isSyncing) {
      hasSynced.current = true;
      loadFromDatabase(session.user.id);
    }
    
    // Reset sync flag when user logs out
    if (status === 'unauthenticated') {
      hasSynced.current = false;
    }
  }, [status, session?.user?.id, loadFromDatabase, isSyncing]);

  return <>{children}</>;
}
