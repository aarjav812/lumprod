import { Spinner } from './ui';

export default function AppLoadingScreen({ message = 'Loading Lumiere...' }) {
  return (
    <div className="app-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loading-screen__glow" aria-hidden="true" />
      <div className="app-loading-screen__content">
        <p className="app-loading-screen__brand">Lumiere 2026</p>
        <Spinner size="large" label={message} />
        <p className="app-loading-screen__message">{message}</p>
      </div>
    </div>
  );
}
