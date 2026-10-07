'use client';

import { useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getProtocol = () => window.location.protocol === 'https:' ? 'HTTPS' : 'HTTP';
const getServerProtocol = () => '…';

export default function Home() {
  const protocol = useSyncExternalStore(subscribe, getProtocol, getServerProtocol);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    try {
      // La URL relativa conserva el protocolo real de la página.
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setStatus({ type: res.ok ? 'success' : 'error', message: data.message || 'Error de autenticación' });
      if (res.ok) setPassword('');
    } catch {
      setStatus({ type: 'error', message: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-800 font-mono font-bold text-white">01</span>
            <div><p className="font-bold tracking-tight">Laboratorio forense</p><p className="text-xs text-slate-500">Redes · Evidencia digital</p></div>
          </div>
          <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">Entorno de práctica</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <p className="mb-4 text-xs font-bold tracking-[0.2em] text-teal-800">PRÁCTICA 01 / SEGURIDAD EN EL TRANSPORTE</p>
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <section>
            <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Un inicio de sesión.<br /><span className="text-teal-800">Dos formas de viajar.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">Observa qué ocurre con los datos cuando pasan del navegador al servidor. Compara una conexión HTTP con una conexión protegida por HTTPS.</p>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recorrido de la conexión</p>
              <div className="mt-5 flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="rounded-lg bg-slate-100 px-3 py-3">Cliente</span><span aria-hidden="true" className="text-teal-700">→</span>
                <span className="rounded-lg bg-teal-50 px-3 py-3 text-teal-800">{protocol}</span><span aria-hidden="true" className="text-teal-700">→</span>
                <span className="rounded-lg bg-slate-100 px-3 py-3">Servidor</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">El analista y el observador estudian una copia del tráfico en el punto de captura autorizado.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="border-l-2 border-amber-400 pl-4"><p className="font-bold">01 · HTTP</p><p className="mt-1 leading-6 text-slate-500">Datos legibles para quien pueda capturar la conexión.</p></div>
              <div className="border-l-2 border-teal-600 pl-4"><p className="font-bold">02 · HTTPS</p><p className="mt-1 leading-6 text-slate-500">Contenido cifrado entre el navegador y Nginx.</p></div>
            </div>
          </section>
          <section aria-labelledby="login-title" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-7 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Portal de acceso</span>
              <span data-testid="protocol" className={`rounded-full px-3 py-1 text-xs font-bold ${protocol === 'HTTPS' ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>{protocol}</span>
            </div>
            <h2 id="login-title" className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Usa la cuenta de demostración para generar tráfico de prueba.</p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div><label htmlFor="username" className="mb-2 block text-sm font-semibold">Usuario</label>
                <input id="username" name="username" autoComplete="username" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required maxLength={50} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" /></div>
              <div><label htmlFor="password" className="mb-2 block text-sm font-semibold">Contraseña</label>
                <input type="password" id="password" name="password" autoComplete="current-password" placeholder="Contraseña de práctica" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" /></div>
              <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-teal-800 px-4 py-3.5 font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-60">{isLoading ? 'Verificando…' : 'Iniciar sesión →'}</button>
            </form>
            <div aria-live="polite" role="status">{status && <p className={`message ${status.type} mt-5 rounded-xl p-3 text-sm ${status.type === 'success' ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-800'}`}>{status.message}{status.type === 'success' && ' · Cuenta validada. Puedes repetir la prueba.'}</p>}</div>
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-4 text-sm">
              <p className="font-semibold text-slate-700">Cuenta ficticia</p>
              <p className="mt-2 font-mono text-slate-600">admin <span className="text-slate-300">/</span> admin123</p>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">Utiliza únicamente datos de prueba. Este portal valida credenciales de demostración; no crea una sesión persistente.</p>
          </section>
        </div>
        <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500"><span>Servidor · Cliente · Analista forense · Observador</span><span>Laboratorio 01 — HTTP / HTTPS</span></footer>
      </main>
    </div>
  );
}
