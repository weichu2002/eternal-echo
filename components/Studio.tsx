import React, { useState } from 'react';
import { Chapter, DigitalLegacy, ThemeType, AccessLevel, RoleKeys } from '../types';
import { generateBio } from '../services/aiService';
import { IconFeather, IconLayout } from './Icons';

interface StudioProps {
  onSave: (legacy: DigitalLegacy) => void;
}

const TEMPLATES: { id: ThemeType; name: string; description: string; color: string }[] = [
  { id: 'obsidian', name: '深邃星空', description: '极简、庄严，如同永恒的黑夜。适合沉思与独白。', color: 'from-gray-900 to-black' },
  { id: 'ethereal', name: '云端彼岸', description: '杂志风格，空灵洁白，图文混排。适合记录美好生活。', color: 'from-gray-200 to-white text-gray-800' },
  { id: 'warm', name: '旧时光', description: '拍立得风格，温暖怀旧，手写体。适合家庭与成长的回忆。', color: 'from-amber-900 to-orange-900' },
  { id: 'cyber', name: '数字永生', description: '终端风格，数据流，故障艺术。适合极客与思想者。', color: 'from-blue-900 to-purple-900' },
];

export const Studio: React.FC<StudioProps> = ({ onSave }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('obsidian');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New Role Keys State
  const [roleKeys, setRoleKeys] = useState<RoleKeys>({
    family: '',
    friend: '',
    classmate: ''
  });

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const bio = await generateBio(aiPrompt);
      const newChapter: Chapter = {
        id: Date.now().toString(),
        title: "AI · 记忆重构",
        content: bio,
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Default AI image placeholder
        type: 'text',
        accessLevel: 'public'
      };
      setChapters([...chapters, newChapter]);
    } catch (e) {
      alert("AI 生成失败，请检查控制台。");
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: "",
      content: "",
      type: 'text',
      accessLevel: 'family'
    };
    setChapters([...chapters, newChapter]);
  };

  const handleSaveToVault = () => {
    if (!roleKeys.family || !roleKeys.friend) {
      alert("请至少设置家人和朋友的访问密钥，以便他们日后访问。");
      return;
    }

    const legacy: DigitalLegacy = {
      ownerId: "user-123", 
      ownerName: "Gregorio",
      theme: selectedTheme,
      chapters: chapters,
      roleKeys: roleKeys, // Use specific keys
      triggerCondition: { type: 'inactivity', param: 180 },
      createdAt: Date.now()
    };
    onSave(legacy);
  };

  return (
    <div className="flex flex-col h-full text-gray-100">
      {/* Header with Steps */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif text-neon">遗产工作室</h2>
        <div className="flex space-x-2 bg-black/40 p-1 rounded-lg border border-gray-800">
           <button onClick={() => setStep(1)} className={`px-4 py-1.5 text-sm rounded transition-all ${step === 1 ? 'bg-neon text-black font-bold' : 'text-gray-400 hover:text-white'}`}>1. 风格定调</button>
          <button onClick={() => setStep(2)} className={`px-4 py-1.5 text-sm rounded transition-all ${step === 2 ? 'bg-neon text-black font-bold' : 'text-gray-400 hover:text-white'}`}>2. 记忆编织</button>
          <button onClick={() => setStep(3)} className={`px-4 py-1.5 text-sm rounded transition-all ${step === 3 ? 'bg-neon text-black font-bold' : 'text-gray-400 hover:text-white'}`}>3. 密钥分发</button>
        </div>
      </div>

      <div className="glass-panel flex-1 rounded-xl p-6 overflow-y-auto">
        
        {/* STEP 1: Template Selection */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl mb-2 text-center font-serif">选择您的数字灵魂基调</h3>
            <p className="text-center text-gray-500 mb-8">不同的主题将决定未来的访客如何“阅读”您的一生</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEMPLATES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`cursor-pointer rounded-xl p-8 border-2 transition-all relative overflow-hidden group h-56 flex flex-col justify-end
                    ${selectedTheme === t.id ? 'border-neon scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-gray-800 hover:border-gray-600'}
                    bg-gradient-to-br ${t.color}
                  `}
                >
                  <div className="relative z-10">
                    <h4 className={`text-2xl font-serif font-bold mb-2 ${t.id === 'ethereal' ? 'text-gray-900' : 'text-white'}`}>{t.name}</h4>
                    <p className={`text-sm ${t.id === 'ethereal' ? 'text-gray-700' : 'text-gray-300'}`}>{t.description}</p>
                  </div>
                  {/* Visual Preview Elements based on theme */}
                  {t.id === 'cyber' && <div className="absolute top-0 right-0 p-4 text-xs font-mono text-cyan-500 opacity-50">SYSTEM_READY<br/>0xEF32...</div>}
                  {t.id === 'warm' && <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rotate-12 backdrop-blur-sm border border-white/20"></div>}
                  
                  {selectedTheme === t.id && (
                    <div className="absolute top-4 right-4 bg-neon text-black rounded-full p-1 shadow-lg">
                      <IconLayout className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button onClick={() => setStep(2)} className="bg-neon text-black font-bold px-8 py-3 rounded-full hover:bg-white transition-colors shadow-lg shadow-neon/20">
                确认风格并开始创作 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Content Creation */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left: AI Assistant */}
            <div className="col-span-1 border-r border-gray-800 pr-6 overflow-y-auto">
              <div className="bg-gradient-to-b from-charcoal to-black p-5 rounded-xl border border-gray-800 shadow-xl mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-neon">
                  <IconFeather className="w-5 h-5" /> 
                  AI 传记助手
                </h3>
                <p className="text-xs text-mist mb-4 leading-relaxed">
                  DeepSeek 引擎已就绪。请输入碎片化的记忆（如：某张照片的故事、某段人生的感悟），我将为您排版并润色。
                </p>
                <textarea 
                  className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm focus:border-neon outline-none h-32 transition-colors mb-2"
                  placeholder="例如：2015年夏天，我和那群老友在青海湖边...（AI将为您润色并生成章节）"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="w-full bg-neon-dim hover:bg-neon text-white py-2 rounded transition-colors flex justify-center items-center text-sm font-semibold"
                >
                  {isGenerating ? "正在计算与生成..." : "✨ 生成图文章节"}
                </button>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={addManualChapter}
                  className="w-full border border-gray-700 hover:border-gray-500 text-mist hover:text-white py-3 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> 添加空白章节
                </button>
                
                <div className="bg-gray-900/50 p-4 rounded text-xs text-gray-500 border border-gray-800">
                   当前主题：<span className="text-neon">{TEMPLATES.find(t => t.id === selectedTheme)?.name}</span>
                   <p className="mt-1">预览模式将在保存后开启，系统将自动根据主题应用复杂的排版样式。</p>
                </div>
              </div>
            </div>

            {/* Right: Content List */}
            <div className="col-span-2 space-y-6 overflow-y-auto pb-20 px-2">
              {chapters.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl bg-black/20">
                  <p className="text-lg">您的生命画卷尚为空白</p>
                  <p className="text-sm mt-2">请使用左侧 AI 助手生成，或手动添加图文</p>
                </div>
              ) : (
                chapters.map((chapter, idx) => (
                  <div key={chapter.id} className="bg-charcoal/80 p-6 rounded-xl border border-gray-800 relative group transition-all hover:border-gray-600">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Image Input Area */}
                      <div className="col-span-1">
                        <div className="aspect-square bg-black/40 rounded-lg border border-gray-700 overflow-hidden relative">
                           {chapter.imageUrl ? (
                             <img src={chapter.imageUrl} alt="Chapter" className="w-full h-full object-cover" />
                           ) : (
                             <div className="flex items-center justify-center h-full text-gray-600 text-xs">暂无图片</div>
                           )}
                           <input 
                             type="text"
                             placeholder="粘贴图片 URL..."
                             value={chapter.imageUrl || ''}
                             onChange={(e) => {
                               const newChapters = [...chapters];
                               newChapters[idx].imageUrl = e.target.value;
                               setChapters(newChapters);
                             }}
                             className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-xs p-1 outline-none border-t border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                           />
                        </div>
                      </div>

                      {/* Text Input Area */}
                      <div className="col-span-2 flex flex-col gap-3">
                        <input 
                          value={chapter.title}
                          placeholder="章节标题 (例如：致我的女儿)"
                          onChange={(e) => {
                            const newChapters = [...chapters];
                            newChapters[idx].title = e.target.value;
                            setChapters(newChapters);
                          }}
                          className="bg-transparent text-xl font-serif text-white w-full outline-none placeholder-gray-600 border-b border-transparent focus:border-gray-700 pb-1"
                        />
                        <textarea 
                          value={chapter.content}
                          placeholder="写下您的故事..."
                          onChange={(e) => {
                            const newChapters = [...chapters];
                            newChapters[idx].content = e.target.value;
                            setChapters(newChapters);
                          }}
                          className="w-full bg-transparent text-gray-300 text-sm flex-1 outline-none resize-none placeholder-gray-700 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center mt-4 border-t border-gray-800 pt-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-neon font-semibold">谁可以看？</span>
                        <select 
                          value={chapter.accessLevel}
                          onChange={(e) => {
                            const newChapters = [...chapters];
                            newChapters[idx].accessLevel = e.target.value as AccessLevel;
                            setChapters(newChapters);
                          }}
                          className="bg-black border border-gray-600 rounded px-3 py-1 text-xs text-white focus:border-neon outline-none"
                        >
                          <option value="public">🌐 公开 (所有人)</option>
                          <option value="family">🏠 仅家人 (Family Key)</option>
                          <option value="friend">🍻 仅挚友 (Friend Key)</option>
                          <option value="classmate">🎓 仅同学 (Classmate Key)</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => setChapters(chapters.filter(c => c.id !== chapter.id))}
                        className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-900/20"
                      >
                        删除章节
                      </button>
                    </div>
                  </div>
                ))
              )}
              {chapters.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(3)} className="bg-neon text-black font-bold px-8 py-3 rounded-full hover:bg-white transition-colors">
                    下一步：分发密钥 &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Key Distribution */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <h3 className="text-2xl text-center font-serif text-white mb-2">配置您的分级密钥</h3>
            <p className="text-center text-gray-500 mb-8 text-sm">
              不同的密钥将解锁不同权限的内容。请将这些密钥安全地交给对应的人。
              <br/>系统通过 ESA 边缘网络进行零知识验证，我们不会存储这些明文。
            </p>
            
            <div className="bg-charcoal p-8 rounded-xl border border-gray-700 space-y-6">
              
              {/* Family Key */}
              <div>
                <label className="flex items-center gap-2 text-sm text-neon font-bold mb-2">
                  <span>🏠 家人密钥 (Family Key)</span>
                  <span className="text-xs font-normal text-gray-500">- 可查看所有“仅家人”及公开内容</span>
                </label>
                <input 
                  type="text" 
                  value={roleKeys.family}
                  onChange={(e) => setRoleKeys({...roleKeys, family: e.target.value})}
                  placeholder="设置一个只有家人知道的密码，或系统自动生成..."
                  className="w-full bg-black/50 border border-gray-600 p-4 rounded text-white focus:border-neon outline-none font-mono tracking-wider"
                />
              </div>

              {/* Friend Key */}
              <div>
                <label className="flex items-center gap-2 text-sm text-purple-400 font-bold mb-2">
                  <span>🍻 挚友密钥 (Friend Key)</span>
                  <span className="text-xs font-normal text-gray-500">- 可查看“仅挚友”及公开内容</span>
                </label>
                <input 
                  type="text" 
                  value={roleKeys.friend}
                  onChange={(e) => setRoleKeys({...roleKeys, friend: e.target.value})}
                  placeholder="设置给好朋友的暗号..."
                  className="w-full bg-black/50 border border-gray-600 p-4 rounded text-white focus:border-purple-400 outline-none font-mono tracking-wider"
                />
              </div>

              {/* Classmate Key */}
              <div>
                <label className="flex items-center gap-2 text-sm text-green-400 font-bold mb-2">
                  <span>🎓 同学密钥 (Classmate Key)</span>
                  <span className="text-xs font-normal text-gray-500">- 可查看“仅同学”及公开内容</span>
                </label>
                <input 
                  type="text" 
                  value={roleKeys.classmate}
                  onChange={(e) => setRoleKeys({...roleKeys, classmate: e.target.value})}
                  placeholder="设置给老同学的访问码..."
                  className="w-full bg-black/50 border border-gray-600 p-4 rounded text-white focus:border-green-400 outline-none font-mono tracking-wider"
                />
              </div>

            </div>

            <div className="pt-6 flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-600 text-gray-300 font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                &larr; 返回修改
              </button>
              <button 
                onClick={handleSaveToVault}
                className="flex-1 bg-gradient-to-r from-neon to-blue-600 text-white font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01] transition-transform"
              >
                生成保险库并加密上传
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};