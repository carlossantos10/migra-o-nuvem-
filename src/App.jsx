import { useEffect, useState } from "react";
import nexo from "./nexoClient";
import Dashboard from "./components/Dashboard";
import "./styles.css";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("store_id");
    const tok = params.get("token");

    if (sid && tok) {
      sessionStorage.setItem("ns_store_id", sid);
      sessionStorage.setItem("ns_token", tok);
      window.history.replaceState({}, "", "/");
      setStoreId(sid);
      setToken(tok);
    } else {
      const savedId = sessionStorage.getItem("ns_store_id");
      const savedTok = sessionStorage.getItem("ns_token");
      if (savedId && savedTok) {
        setStoreId(savedId);
        setToken(savedTok);
      }
    }

    const { connect, iAmReady } = nexo;
    if (connect && iAmReady) {
      connect(nexo).then(() => {
        setIsConnected(true);
        iAmReady(nexo);
      }).catch(() => setIsConnected(true));
    } else {
      setIsConnected(true);
    }
  }, []);

  if (!isConnected) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Conectando...</p>
      </div>
    );
  }

  if (!storeId || !token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <span className="logo-badge">Nuvem</span>
          <h2>Migration Report</h2>
          <p>Para usar este app, instale-o na sua loja pelo Portal de Parceiros.</p>
        </div>
      </div>
    );
  }

  return <Dashboard storeId={storeId} token={token} />;
}