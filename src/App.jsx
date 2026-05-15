import { useEffect, useState } from 'react';
import nexo from './nexoClient';
import { connect, iAmReady, getStoreInfo } from '@tiendanube/nexo';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    connect(nexo).then(async () => {
      try {
        const storeInfo = await getStoreInfo(nexo);
        setStoreId(storeInfo.id);
      } catch (e) {
        console.error('Erro ao obter storeInfo:', e);
      }
      setIsConnected(true);
      iAmReady(nexo);
    });
  }, []);

  if (!isConnected) return <div>Conectando...</div>;

  return <Dashboard storeId={storeId} />;
}