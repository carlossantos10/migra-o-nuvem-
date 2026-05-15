import { useEffect, useState } from 'react';
import { connect, iAmReady } from '@tiendanube/nexo/helpers';
import nexo from './nexoClient';
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