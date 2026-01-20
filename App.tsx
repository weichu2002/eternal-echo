import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Studio } from './components/Studio';
import { Vault } from './components/Vault';
import { Viewer } from './components/Viewer';
import { DigitalLegacy } from './types';
import { esaService } from './services/esaService';
import { IconZap, IconLock, IconFeather } from './components/Icons';

// Hero / Landing Component
const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent -z-10"></div>
      
      <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight animate-fade-in-up">
        Eternal <span className="text-neon drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">Echo</span>
      </h1>
      <h2 className="text-xl md:text-2xl font-serif text-gray-400 mb-12 animate-fade-in-up delay-100">
        基于边缘计算的数字生命遗迹系统
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl animate-fade-in-up delay-200">
        {/* Entry A: Create */}
        <div 
          onClick={() => navigate('/studio')}
          className="flex-1 bg-charcoal/60 border border-gray-700 hover:border-neon p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:bg-charcoal group"
        >
          <div className="bg-gray-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-neon group-hover:text-black transition-colors">
            <IconFeather className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">我是创建者</h3>
          <p className="text-sm text-gray-400">
            设计我的数字遗产，选择主题，加密封存至边缘网络。
          </p>
        </div>

        {/* Entry B: Visit */}
        <div 
          onClick={() => navigate('/viewer')}
          className="flex-1 bg-charcoal/60 border border-gray-700 hover:border-purple-400 p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:bg-charcoal group"
        >
          <div className="bg-gray-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <IconLock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">我是访问者</h3>
          <p className="text-sm text-gray-400">
            使用密钥碎片或通过链接访问已激活的悼念空间。
          </p>
        </div>
      </div>

      <p className="mt-16 text-xs text-gray-600 max-w-lg">
        数据安全声明：所有内容在本地通过 AES-GCM-256 加密，仅密文上传至阿里云 ESA 节点。平台方无法查阅任何内容。
      </p>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-obsidian text-gray-200 font-sans selection:bg-neon selection:text-white bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-white tracking-widest hover:text-neon transition-colors">
              <IconZap className="text-neon w-5 h-5" /> ETERNAL ECHO
            </Link>
            <div className="flex space-x-6 text-sm">
              <Link to="/studio" className={`hover:text-neon transition-colors ${location.pathname.startsWith('/studio') ? 'text-neon' : 'text-gray-400'}`}>创建空间</Link>
              <Link to="/viewer" className={`hover:text-neon transition-colors ${location.pathname === '/viewer' ? 'text-neon' : 'text-gray-400'}`}>访问空间</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-900 py-8 text-center text-gray-600 text-xs">
        <p>Deployed on Alibaba Cloud ESA (Edge Security Acceleration)</p>
        <p className="mt-1">© {new Date().getFullYear()} Eternal Echo. Zero-Knowledge Architecture.</p>
      </footer>
    </div>
  );
};

// Main App Component with State Management for the Session
const AppContent = () => {
  const navigate = useNavigate();
  // State to hold data for the "Immediate Owner Preview" after creation
  const [ownerPreviewData, setOwnerPreviewData] = useState<DigitalLegacy | undefined>(undefined);

  const handleStudioSave = (data: DigitalLegacy) => {
    setOwnerPreviewData(data); // Hold data in memory for preview
    esaService.saveMockPlaintextForDemo(data); // Save mock for visitor unlock demo
    navigate('/vault');
  };

  const handleDeployComplete = () => {
    // Navigate to viewer in "Owner Mode"
    navigate('/viewer-owner');
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Hero />} />
        
        {/* Creation Flow */}
        <Route path="/studio" element={<Studio onSave={handleStudioSave} />} />
        <Route 
          path="/vault" 
          element={
            ownerPreviewData ? (
              <Vault legacyData={ownerPreviewData} onDeployComplete={handleDeployComplete} />
            ) : (
              <div className="text-center mt-20 text-gray-500">
                暂无数据。请先在 <Link to="/studio" className="text-neon">工作室</Link> 中设计。
              </div>
            )
          } 
        />
        
        {/* Owner Preview Mode (Authenticated via Session) */}
        <Route 
          path="/viewer-owner" 
          element={
            ownerPreviewData ? (
              <Viewer isOwnerPreview={true} previewData={ownerPreviewData} />
            ) : (
              <div className="text-center mt-20 text-gray-500">预览会话已过期，请重新创建。</div>
            )
          } 
        />

        {/* Public/Visitor Mode (Requires Keys) */}
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}