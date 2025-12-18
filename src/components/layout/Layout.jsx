import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}