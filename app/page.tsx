import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-linear-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
            NapEvents
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-2 text-white hover:text-orange-300 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Gestiona tus eventos
            <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              de forma profesional
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            La plataforma completa para crear, gestionar y controlar el acceso a tus eventos.
            Vende entradas, genera códigos QR y obtén reportes en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 shadow-2xl"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Ver Características
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: '1000+', label: 'Eventos Creados' },
            { number: '50K+', label: 'Entradas Vendidas' },
            { number: '500+', label: 'Organizadores' },
            { number: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-xl text-slate-300">
            Herramientas profesionales para gestionar tus eventos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: '🎫',
              title: 'Gestión de Entradas',
              description: 'Crea entradas FREE, VIP y personalizadas. Control total de precios y disponibilidad.',
            },
            {
              icon: '📱',
              title: 'Códigos QR',
              description: 'Genera códigos QR únicos para cada entrada. Validación rápida en el check-in.',
            },
            {
              icon: '👥',
              title: 'Equipos y Roles',
              description: 'Asigna roles a tu equipo: administradores, promotores, staff y más.',
            },
            {
              icon: '🔗',
              title: 'Enlaces Compartibles',
              description: 'Genera enlaces personalizados para registro gratuito o promociones especiales.',
            },
            {
              icon: '📊',
              title: 'Reportes en Tiempo Real',
              description: 'Visualiza estadísticas y métricas de tus eventos al instante.',
            },
            {
              icon: '🔐',
              title: 'Control de Acceso',
              description: 'Check-in rápido y seguro con validación de tickets en tiempo real.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 hover:border-orange-500/50"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-slate-300">
            Crea tu evento en minutos
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { step: '1', title: 'Regístrate', description: 'Crea tu cuenta gratis en segundos' },
            { step: '2', title: 'Crea tu Evento', description: 'Configura fecha, lugar y tipos de entrada' },
            { step: '3', title: 'Comparte', description: 'Envía enlaces de registro a tus invitados' },
            { step: '4', title: 'Gestiona', description: 'Controla el acceso y visualiza estadísticas' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-orange-500/20 to-cyan-500/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Únete a cientos de organizadores que confían en NapEvents
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 shadow-2xl"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-white/10">
        <div className="text-center text-slate-400">
          <p>&copy; 2026 NapEvents. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
