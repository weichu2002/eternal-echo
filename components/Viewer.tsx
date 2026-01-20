import React, { useEffect, useState } from 'react';
import { EncryptedPacket, DigitalLegacy, VaultStatus, ThemeType, AccessLevel, RoleKeys, Chapter } from '../types';
import { esaService } from '../services/esaService';
import { IconLock, IconKey, IconZap, IconFeather } from './Icons';

interface ViewerProps {
  isOwnerPreview?: boolean; 
  previewData?: DigitalLegacy; 
}

// --- THEME ENGINE RENDERERS ---

// 1. OBSIDIAN THEME (Minimalist, Dark, Centered)
const ObsidianRenderer = ({ data, filteredChapters }: { data: DigitalLegacy, filteredChapters: Chapter[] }) => (
  <div className="bg-obsidian text-gray-300 min-h-screen font-serif selection:bg-white selection:text-black pb-20">
    <header className="pt-20 pb-16 text-center border-b border-white/10 mx-auto max-w-3xl px-6">
      <div className="text-xs tracking-[0.3em] text-gray-500 mb-4 uppercase">The Digital Legacy of</div>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">{data.ownerName}</h1>
      <div className="h-1 w-20 bg-white mx-auto mb-6"></div>
      <p className="text-gray-500 italic">"在永恒的黑夜中，只有记忆是唯一的星光。"</p>
    </header>
    <div className="max-w-2xl mx-auto px-6 space-y-20 mt-16">
      {filteredChapters.map((chapter) => (
        <article key={chapter.id} className="animate-fade-in-up">
          {chapter.imageUrl && (
            <div className="mb-8 rounded-sm overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
              <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-auto" />
            </div>
          )}
          <h2 className="text-3xl text-white mb-6 leading-tight">{chapter.title}</h2>
          <div className="text-lg leading-loose font-light text-gray-400 whitespace-pre-wrap">
            {chapter.content}
          </div>
          <div className="mt-4 text-xs text-gray-600 flex items-center gap-2">
            <span>●</span>
            <span>{chapter.accessLevel === 'public' ? '公开' : `${chapter.accessLevel} Only`}</span>
          </div>
        </article>
      ))}
    </div>
  </div>
);

// 2. ETHEREAL THEME (Magazine, Light, Masonry-feel)
const EtherealRenderer = ({ data, filteredChapters }: { data: DigitalLegacy, filteredChapters: Chapter[] }) => (
  <div className="bg-[#f8f9fa] text-gray-900 min-h-screen font-sans pb-20">
    <div className="max-w-6xl mx-auto px-4 pt-12">
      <header className="flex flex-col md:flex-row justify-between items-end border-b-2 border-black pb-8 mb-12">
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black leading-none">{data.ownerName}</h1>
          <p className="text-xl mt-2 text-gray-500 font-serif">Life Chronicle & Memory Archive</p>
        </div>
        <div className="text-right text-sm font-mono mt-4 md:mt-0">
          EST. {new Date(data.createdAt).getFullYear()} <br/>
          ETERNAL ECHO EDITION
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {filteredChapters.map((chapter, idx) => (
          <article 
            key={chapter.id} 
            className={`flex flex-col mb-12 animate-fade-in-up ${idx % 3 === 0 ? 'md:col-span-8' : 'md:col-span-4'}`}
          >
            {chapter.imageUrl && (
              <div className="mb-4 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-64 md:h-80 object-cover" />
              </div>
            )}
            <div className="border-t border-black pt-2 mt-auto">
              <h2 className={`font-bold mb-3 leading-tight ${idx % 3 === 0 ? 'text-4xl' : 'text-2xl'}`}>{chapter.title}</h2>
              <div className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {chapter.content}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

// 3. WARM THEME (Scrapbook, Organic)
const WarmRenderer = ({ data, filteredChapters }: { data: DigitalLegacy, filteredChapters: Chapter[] }) => (
  <div className="bg-[#e6dcc8] text-[#4a3b2a] min-h-screen font-serif pb-20 overflow-x-hidden">
    <div className="max-w-4xl mx-auto px-4 pt-20 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4c5ad] rounded-full blur-3xl -z-10 opacity-50"></div>
      
      <header className="text-center mb-20">
        <div className="inline-block border-4 border-[#4a3b2a] p-2 mb-6 rotate-2">
           <div className="border border-[#4a3b2a] px-8 py-4 bg-[#f0eadd]">
             <h1 className="text-4xl md:text-5xl font-bold tracking-widest">{data.ownerName}</h1>
           </div>
        </div>
        <p className="text-[#8c7b66] font-handwriting text-lg">我们的故事，写在旧时光里。</p>
      </header>

      <div className="space-y-24">
        {filteredChapters.map((chapter, idx) => (
          <article key={chapter.id} className={`relative flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
            {/* Visual Part */}
            <div className="w-full md:w-1/2 relative group">
               {chapter.imageUrl ? (
                 <div className={`relative p-2 bg-white shadow-lg transform transition-transform duration-500 hover:scale-105 hover:z-10 ${idx % 2 === 0 ? '-rotate-3' : 'rotate-2'}`}>
                    <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-auto" />
                    <div className="text-center font-mono text-xs text-gray-400 mt-2">Fig. {idx + 1}</div>
                 </div>
               ) : (
                 <div className="h-64 bg-[#dccbb5] flex items-center justify-center rotate-1 shadow-inner">
                    <span className="opacity-30 text-4xl">❝</span>
                 </div>
               )}
               {/* Tape Effect */}
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-100/40 backdrop-blur-sm shadow-sm rotate-1"></div>
            </div>

            {/* Text Part */}
            <div className="w-full md:w-1/2">
               <h2 className="text-3xl font-bold mb-4 decoration-wavy underline decoration-[#c9b79c]">{chapter.title}</h2>
               <div className="text-lg leading-loose font-medium opacity-90 whitespace-pre-wrap font-sans">
                 {chapter.content}
               </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

// 4. CYBER THEME (Glitch, Neon, Terminal)
const CyberRenderer = ({ data, filteredChapters }: { data: DigitalLegacy, filteredChapters: Chapter[] }) => (
  <div className="bg-black text-cyan-400 min-h-screen font-mono pb-20 selection:bg-cyan-500 selection:text-black">
    {/* CRT Scanline Effect Overlay */}
    <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
    
    <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
      <header className="border-b border-cyan-900/50 pb-8 mb-12 flex justify-between items-end">
        <div>
          <div className="text-xs text-cyan-700 mb-1">:: IDENTITY_RECONSTRUCTED ::</div>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {data.ownerName}
          </h1>
        </div>
        <div className="text-right text-xs text-cyan-800">
          UPTIME: ETERNAL<br/>
          STATUS: ONLINE
        </div>
      </header>

      <div className="space-y-16">
        {filteredChapters.map((chapter) => (
          <article key={chapter.id} className="border-l-2 border-cyan-900 pl-6 relative hover:border-cyan-400 transition-colors duration-300">
            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black border border-cyan-500 rounded-full"></div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {chapter.imageUrl && (
                 <div className="w-full md:w-1/3 order-first md:order-last">
                    <div className="relative border border-cyan-500/30 p-1">
                      <img src={chapter.imageUrl} className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-1 right-1 bg-black text-cyan-500 text-[10px] px-1">IMG_SRC</div>
                    </div>
                 </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl text-purple-400 mb-4 font-bold flex items-center">
                  <span className="mr-2 text-cyan-600">&gt;</span> 
                  {chapter.title}
                </h2>
                <div className="text-cyan-100/80 leading-relaxed whitespace-pre-wrap border border-cyan-900/30 bg-cyan-900/10 p-4 rounded">
                  {chapter.content}
                </div>
                <div className="mt-2 text-xs text-cyan-800">
                   PERMISSION_LEVEL: [{chapter.accessLevel.toUpperCase()}]
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

// --- MAIN VIEWER COMPONENT ---

export const Viewer: React.FC<ViewerProps> = ({ isOwnerPreview, previewData }) => {
  const [status, setStatus] = useState<VaultStatus>(VaultStatus.UNINITIALIZED);
  const [data, setData] = useState<DigitalLegacy | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unlock Logic
  const [inputKey, setInputKey] = useState('');
  const [keyType, setKeyType] = useState<keyof RoleKeys>('family'); // Default attempt
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Content Filter
  const [accessRole, setAccessRole] = useState<'owner' | AccessLevel | null>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Owner Preview (God Mode)
      if (isOwnerPreview && previewData) {
        setData(previewData);
        setAccessRole('owner'); // Owner sees everything
        setStatus(VaultStatus.ACTIVE);
        setLoading(false);
        return;
      }

      // 2. Visitor Mode
      const currentStatus = await esaService.checkPulse();
      setStatus(currentStatus);
      setLoading(false);
    };
    init();
  }, [isOwnerPreview, previewData]);

  const handleUnlock = async () => {
    if (!inputKey) return;
    setIsUnlocking(true);
    setErrorMsg('');

    setTimeout(async () => {
      const packet = await esaService.retrieveFromEdge();
      if (packet) {
        try {
           const mockDataStr = localStorage.getItem('mock-legacy-plaintext');
           if (mockDataStr) {
             const legacy: DigitalLegacy = JSON.parse(mockDataStr);
             
             // --- MOCK KEY VERIFICATION LOGIC ---
             // Check if input matches specific role keys defined in the legacy data
             let validRole: AccessLevel | null = null;

             if (inputKey === legacy.roleKeys.family) validRole = 'family';
             else if (inputKey === legacy.roleKeys.friend) validRole = 'friend';
             else if (inputKey === legacy.roleKeys.classmate) validRole = 'classmate';
             
             if (validRole) {
               setData(legacy);
               setAccessRole(validRole);
               setStatus(VaultStatus.ACTIVE);
             } else {
               setErrorMsg("密钥无效。请确认您选择了正确的身份类型并输入了正确的密钥。");
             }
           } else {
             setErrorMsg("数据已损坏 (Code 404)");
           }
        } catch (e) {
           setErrorMsg("解密失败");
        }
      } else {
        setErrorMsg("未找到保险库数据");
      }
      setIsUnlocking(false);
    }, 1500);
  };

  // Helper to filter content based on role
  const getFilteredChapters = () => {
    if (!data || !accessRole) return [];
    if (accessRole === 'owner') return data.chapters;

    return data.chapters.filter(ch => {
       if (ch.accessLevel === 'public') return true;
       if (accessRole === 'family') return ch.accessLevel === 'family'; // Family sees Family + Public
       if (accessRole === 'friend') return ch.accessLevel === 'friend'; // Friend sees Friend + Public
       if (accessRole === 'classmate') return ch.accessLevel === 'classmate'; // Classmate sees Classmate + Public
       return false;
    });
  };

  // --- RENDER STATES ---

  if (loading) return <div className="flex h-full items-center justify-center text-neon animate-pulse">正在连接 ESA 边缘节点...</div>;

  if (status === VaultStatus.UNINITIALIZED && !data) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <IconZap className="w-12 h-12 mb-4 opacity-20" />
        <p>在此频段未检测到 Eternal Echo 信号。</p>
      </div>
    );
  }

  // LOCKED SCREEN
  if (status === VaultStatus.FROZEN && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 animate-fade-in relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
        
        <div className="bg-charcoal/80 p-8 rounded-2xl border border-neon/30 backdrop-blur-xl max-w-md w-full shadow-2xl relative z-10">
          <div className="text-6xl mb-6 animate-pulse-slow">🔒</div>
          <h1 className="text-2xl font-serif text-white mb-2">此空间已折叠</h1>
          <p className="text-mist text-sm mb-8">
            请输入即时密钥展开空间。<br/>内容将根据您的密钥身份进行重构。
          </p>
          
          <div className="space-y-4">
            <div className="flex bg-black/50 rounded p-1 border border-gray-700">
               <button onClick={() => setKeyType('family')} className={`flex-1 py-1 text-xs rounded transition-colors ${keyType === 'family' ? 'bg-neon text-black font-bold' : 'text-gray-500'}`}>家人</button>
               <button onClick={() => setKeyType('friend')} className={`flex-1 py-1 text-xs rounded transition-colors ${keyType === 'friend' ? 'bg-purple-400 text-black font-bold' : 'text-gray-500'}`}>朋友</button>
               <button onClick={() => setKeyType('classmate')} className={`flex-1 py-1 text-xs rounded transition-colors ${keyType === 'classmate' ? 'bg-green-400 text-black font-bold' : 'text-gray-500'}`}>同学</button>
            </div>

            <div className="relative">
              <input 
                type="password" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={`请输入${keyType === 'family' ? '家人' : keyType === 'friend' ? '挚友' : '同学'}密钥...`}
                className="w-full bg-black/50 border border-gray-600 rounded p-3 pl-10 text-white focus:border-neon outline-none font-mono text-sm"
              />
              <IconKey className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            </div>
            
            {errorMsg && <p className="text-red-500 text-xs animate-shake">{errorMsg}</p>}

            <button 
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="w-full bg-neon text-black font-bold py-3 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              {isUnlocking ? '正在边缘节点验证 ACL...' : '解锁记忆'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW (Theme Engine Active)
  if (data) {
    const filtered = getFilteredChapters();
    
    // Select Renderer based on Theme
    switch (data.theme) {
      case 'ethereal': return <EtherealRenderer data={data} filteredChapters={filtered} />;
      case 'warm': return <WarmRenderer data={data} filteredChapters={filtered} />;
      case 'cyber': return <CyberRenderer data={data} filteredChapters={filtered} />;
      case 'obsidian':
      default: return <ObsidianRenderer data={data} filteredChapters={filtered} />;
    }
  }

  return null;
};