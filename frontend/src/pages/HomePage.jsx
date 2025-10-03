import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Zap, Globe, University, UserCheck, Search } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Tamper-Proof',
      description: 'Credentials stored on blockchain cannot be forged or altered',
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Verify credentials in seconds, not weeks',
    },
    {
      icon: Globe,
      title: 'Cross-Border',
      description: 'Works seamlessly across Latin American institutions',
    },
    {
      icon: CheckCircle,
      title: 'Trustworthy',
      description: 'Cryptographic proof of authenticity',
    },
  ];

  const userTypes = [
    {
      icon: University,
      title: 'Universities',
      description: 'Issue tamper-proof digital credentials to graduates',
      link: '/university',
      color: 'blue',
    },
    {
      icon: UserCheck,
      title: 'Students',
      description: 'View and share your verified credentials',
      link: '/student',
      color: 'green',
    },
    {
      icon: Search,
      title: 'Employers',
      description: 'Instantly verify candidate credentials',
      link: '/verify',
      color: 'purple',
    },
  ];

  const stats = [
    { value: '30-40%', label: 'Credential Fraud Rate' },
    { value: '2-4 weeks', label: 'Traditional Verification Time' },
    { value: '<5 sec', label: 'ChainCred Verification Time' },
    { value: '$1M+', label: 'Annual Cost to Employers' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-blue-700 opacity-10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="h-4 w-4" />
              <span>Built on Polkadot Paseo Testnet</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
              End Credential Fraud in
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent"> Latin America</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              ChainCred uses blockchain technology to create tamper-proof digital credentials that can be verified instantly by anyone, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/university" className="btn-primary text-lg">
                Issue Credentials
              </Link>
              <Link to="/verify" className="btn-secondary text-lg">
                Verify Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why ChainCred?</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Traditional credential verification is slow, expensive, and vulnerable to fraud. We're changing that.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Choose Your Portal</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => {
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              };

              return (
                <Link
                  key={index}
                  to={type.link}
                  className={`card bg-gradient-to-br ${colorClasses[type.color]} text-white transform hover:scale-105 transition-all duration-300`}
                >
                  <type.icon className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                  <p className="opacity-90">{type.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join the revolution in credential verification. No fraud, instant results, complete trust.
          </p>
          <Link to="/test" className="btn-primary text-lg inline-flex items-center space-x-2">
            <span>Try the Demo</span>
            <Zap className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
