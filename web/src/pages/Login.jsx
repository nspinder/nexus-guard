import { SignIn } from '@clerk/react';
import { Shield } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">NexusGuard</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Protect yourself from scams and phishing
          </p>
        </div>

        {/* Clerk Sign-In Component */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent border-0 shadow-none',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-slate-400 text-sm',
                socialButtonsBlockButton: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                formFieldInput: 'bg-slate-700/50 border-slate-600 text-white',
                footerActionLink: 'text-blue-400 hover:text-blue-300',
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '📧', label: 'Email Shield' },
            { icon: '📞', label: 'Call Guard' },
            { icon: '🔔', label: 'Alerts' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="text-center p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-slate-400 text-sm">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
