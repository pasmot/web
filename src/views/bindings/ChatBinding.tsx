'use client';

import { useApp } from '../../context/AppContext';
import { ChatPage } from '../ChatPage';

export function ChatBinding() {
  const app = useApp();
  return (
    <ChatPage chat={app.chat} isLoggedIn={app.isLoggedIn} onOpenProduct={app.openProduct} />
  );
}
