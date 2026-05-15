import { useEffect, useState } from 'react';
import nexo from './nexoClient';
import { connect, iAmReady, getSessionToken, getStoreInfo } from '@tiendanube/nexo';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState(null);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    connect(nexo).then(async () => {
      try {
        const sessionToken = await getSessionToken(nexo);
        const storeInfo = await getStoreInfo(nexo);
        setToken(sessionToken);
        setStoreId(storeInfo.id);
      } catch (e) {
        console.error('Erro ao obter token/store:', e);
      }
      setIsConnected(true);
      iAmReady(nexo);
    });
  }, []);

  if (!isConnected) return <div>Conectando...</div>;

  return <Dashboard storeId={storeId} token={token} />;
}