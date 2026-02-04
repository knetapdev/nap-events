'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Subtle background gradient - single, minimal */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              NapEvents
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Iniciar Sesion
            </Link>
            <Link
              href="/auth/register"
              className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-purple-300 font-medium">+500 eventos este mes</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Crea eventos que
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              nadie olvida
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
            Gestiona tickets, controla accesos con QR y coordina tu equipo.
            Todo en una plataforma simple y profesional.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
            >
              Crear Mi Primer Evento
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors"
            >
              Ver como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Eventos creados' },
              { value: '500K+', label: 'Tickets emitidos' },
              { value: '2K+', label: 'Organizadores' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm text-purple-400 font-medium uppercase tracking-wider mb-3">Caracteristicas</p>
          <h2 className="text-3xl md:text-4xl font-bold">Todo lo que necesitas</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🎫',
              title: 'Gestion de Tickets',
              desc: 'Crea entradas FREE, VIP o personalizadas. Control total de precios y stock.'
            },
            {
              icon: '📱',
              title: 'Codigos QR',
              desc: 'Cada ticket genera un QR unico. Validacion instantanea en la entrada.'
            },
            {
              icon: '👥',
              title: 'Equipos',
              desc: 'Asigna roles a tu staff: admins, promotores, personal de puerta.'
            },
            {
              icon: '🔗',
              title: 'Links de Registro',
              desc: 'Crea links personalizados para promociones y campañas.'
            },
            {
              icon: '📊',
              title: 'Analytics',
              desc: 'Metricas en tiempo real. Conoce el pulso de tu evento.'
            },
            {
              icon: '✓',
              title: 'Check-in Seguro',
              desc: 'Sistema anti-fraude. Cada entrada se valida una sola vez.'
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm text-pink-400 font-medium uppercase tracking-wider mb-3">Proceso</p>
          <h2 className="text-3xl md:text-4xl font-bold">Simple y rapido</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { num: '01', title: 'Registrate', desc: 'Crea tu cuenta gratis' },
            { num: '02', title: 'Configura', desc: 'Añade tu evento y tickets' },
            { num: '03', title: 'Comparte', desc: 'Envia links a tus invitados' },
            { num: '04', title: 'Gestiona', desc: 'Controla todo en tiempo real' },
          ].map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-full h-px bg-gradient-to-r from-purple-500/40 to-transparent" />
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-purple-400">{step.num}</span>
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="relative rounded-2xl bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-purple-600/20 border border-purple-500/20 p-12 md:p-16 text-center overflow-hidden">
          {/* Subtle decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para tu proximo evento?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Unete a miles de organizadores que ya confian en NapEvents.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
            >
              Comenzar Gratis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-400">NapEvents</span>
            </div>

            <p className="text-sm text-zinc-600">© 2024 NapEvents. Todos los derechos reservados.</p>

            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-white transition-colors">Terminos</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-white transition-colors">Soporte</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
