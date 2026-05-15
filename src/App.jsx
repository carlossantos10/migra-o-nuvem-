import { useEffect, useState } from 'react';
import nexo from './nexoClient';
import { connect, iAmReady } from '@tiendanube/nexo';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connect(nexo).then(() => {
      setIsConnected(true);
      iAmReady(nexo);
    });
  }, []);

  if (!isConnected) {
    return <div>Conectando...</div>;
  }

  return <Dashboard />;
}