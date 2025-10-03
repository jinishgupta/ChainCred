import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { config } from './config/wagmi';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UniversityPage from './pages/UniversityPage';
import StudentPage from './pages/StudentPage';
import VerifyPage from './pages/VerifyPage';
import TestPage from './pages/TestPage';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/university" element={<UniversityPage />} />
                <Route path="/student" element={<StudentPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/verify/:id" element={<VerifyPage />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-slate-200 py-6">
              <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
                <p>© 2025 ChainCred. Built on Polkadot Paseo Testnet.</p>
                <p className="mt-1">Blockchain-based credential verification for Latin America</p>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
