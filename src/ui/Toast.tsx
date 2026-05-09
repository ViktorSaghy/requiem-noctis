import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}

interface Props {
  message: ToastMessage | null;
}

export function Toast({ message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(
      () => setVisible(false),
      message.duration ?? 3000
    );

    return () => clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className={`toast toast-${message.type}`}>
      <div className="toast-content">{message.text}</div>
    </div>
  );
}
