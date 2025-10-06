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
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-blue-600/10 to-purple-600/10 animate-gradient"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce-gentle border border-primary-200 shadow-lg">
              <Shield className="h-4 w-4 animate-pulse" />
              <span>Built on Polkadot Paseo Testnet</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 animate-fade-in">
              End Credential Fraud in
              <br/>
              <span className="gradient-text-animated"> Latin America</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto animate-fade-in stagger-1 leading-relaxed">
              ChainCred uses blockchain technology to create tamper-proof digital credentials that can be verified instantly by anyone, anywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-2">
              <Link to="/university" className="btn-primary text-lg ripple group">
                <span className="flex items-center space-x-2">
                  <span>Issue Credentials</span>
                  <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
              <Link to="/verify" className="btn-secondary text-lg ripple group">
                <span className="flex items-center space-x-2">
                  <span>Verify Now</span>
                  <CheckCircle className="h-5 w-5 group-hover:scale-125 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center group animate-scale-in stagger-${index + 1}`}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
            <span className="gradient-text">Why ChainCred?</span>
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto text-lg animate-fade-in stagger-1">
            Traditional credential verification is slow, expensive, and vulnerable to fraud. We're changing that.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`card text-center group cursor-pointer animate-scale-in stagger-${index + 1}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 text-primary-600 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
            <span className="gradient-text">Choose Your Portal</span>
          </h2>
          <p className="text-center text-slate-600 mb-12 animate-fade-in stagger-1">Select your role to get started</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => {
              const colorClasses = {
                blue: 'from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800',
                green: 'from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:to-green-800',
                purple: 'from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-800',
              };

              return (
                <Link
                  key={index}
                  to={type.link}
                  className={`card bg-gradient-to-br ${colorClasses[type.color]} text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group animate-scale-in stagger-${index + 1} relative overflow-hidden`}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <type.icon className="h-12 w-12 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                  <p className="opacity-90 leading-relaxed">{type.description}</p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Get Started</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-blue-600/10 animate-gradient"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text-animated">Ready to Get Started?</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Join the revolution in credential verification. No fraud, instant results, complete trust.
            </p>
            <Link to="/test" className="btn-primary text-lg inline-flex items-center space-x-2 ripple group animate-bounce-gentle">
              <span>Try the Demo</span>
              <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-8 text-sm text-slate-500 animate-fade-in stagger-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to try</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
