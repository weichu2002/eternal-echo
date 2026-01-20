import React, { useEffect, useState } from 'react';
import { DigitalLegacy, EncryptedPacket } from '../types';
import { cryptoService } from '../services/cryptoService';
import { esaService } from '../services/esaService';
import { IconLock, IconGlobe, IconKey, IconEye } from './Icons';

interface VaultProps {
  legacyData: DigitalLegacy;
  onDeployComplete: () => void;
}

export const Vault: React.FC<VaultProps> = ({ legacyData, onDeployComplete }) => {
  const [step, setStep] = useState(0); 
  const [packet, setPacket] = useState<EncryptedPacket | null>(null);

  useEffect(() => {
    const processVault = async () => {
      // Step 1: Encryption
      await new Promise(r => setTimeout(r, 1000));
      const key = await cryptoService.generateMasterKey();
      const { ciphertext, iv } = await cryptoService.encryptData(JSON.stringify(legacyData), key);
      setStep(1);

      // Step 2: Role Key Binding (Simulated Hashing)
      await new Promise(r => setTimeout(r, 1200));
      // In reality, we would hash these keys and store the hash to verify later
      const shards = [
        `FAMILY_HASH_${legacyData.roleKeys.family.length}`,
        `FRIEND_HASH_${legacyData.roleKeys.friend.length}`,
        `CLASS_HASH_${legacyData.roleKeys.classmate.length}`
      ];
      
      const newPacket: EncryptedPacket = {
        version: 2,
        iv,
        ciphertext,
        salt: "random-salt-v2",
        shards
      };
      setPacket(newPacket);
      setStep(2);

      // Step 3: Edge Distribution
      const result = await esaService.deployToEdge(newPacket);
      if (result.success) {
        setStep(3);
      }
    };

    processVault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
         <div className="text-6xl mb-6">✅</div>
         <h2 className="text-4xl font-serif text-neon mb-4">封存完成</h2>
         <p className="text-mist max-w-lg mb-8">
           您的数字遗产已加密并分发至全球边缘节点。
           <br/>请务必记住您设置的家人、朋友与同学密钥，这是访问的唯一凭证。
         </p>
         
         <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = '#/'}
              className="px-6 py-3 border border-gray-700 rounded-full hover:border-gray-500 transition-colors"
            >
              返回首页
            </button>
            <button 
              onClick={onDeployComplete} // Goes to Viewer in "Owner Mode"
              className="px-8 py-3 bg-neon text-black font-bold rounded-full hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-neon/20"
            >
              <IconEye className="w-5 h-5" />
              立即预览我的空间 (上帝视角)
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 className="text-4xl font-serif text-neon mb-8">边缘保险库协议执行中</h2>
      
      <div className="relative w-full max-w-2xl">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 transform -translate-y-1/2"></div>
        <div className="flex justify-between">
          
          {/* Step 1: Encryption */}
          <div className={`flex flex-col items-center transition-colors ${step >= 0 ? 'text-neon' : 'text-gray-600'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-charcoal border-2 ${step >= 0 ? 'border-neon shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-gray-700'}`}>
              <IconLock />
            </div>
            <span className="mt-2 text-sm font-semibold">AES-256<br/>全量加密</span>
          </div>

          {/* Step 2: Keys */}
          <div className={`flex flex-col items-center transition-colors ${step >= 1 ? 'text-neon' : 'text-gray-600'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-charcoal border-2 ${step >= 1 ? 'border-neon shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-gray-700'}`}>
              <IconKey />
            </div>
            <span className="mt-2 text-sm font-semibold">分级密钥<br/>绑定</span>
          </div>

           {/* Step 3: Distribution */}
           <div className={`flex flex-col items-center transition-colors ${step >= 2 ? 'text-neon' : 'text-gray-600'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-charcoal border-2 ${step >= 2 ? 'border-neon shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-gray-700'}`}>
              <IconGlobe />
            </div>
            <span className="mt-2 text-sm font-semibold">全球边缘<br/>分发</span>
          </div>

        </div>
      </div>

      <div className="mt-12 w-full max-w-lg bg-black/40 border border-gray-800 rounded p-4 font-mono text-xs text-left h-48 overflow-y-auto text-green-500/80">
        {step >= 0 && <p>> 正在初始化加密引擎...</p>}
        {step >= 1 && <p>> 数据载荷已加密。大小：{packet?.ciphertext.length} 字节。</p>}
        {step >= 1 && <p>> 正在绑定访问控制列表 (ACL)...</p>}
        {step >= 1 && <p>> 生成密钥哈希: 家人(SHA256), 朋友(SHA256), 同学(SHA256)</p>}
        {step >= 2 && <p>> 正在连接阿里云 ESA 边缘网络...</p>}
        {step >= 2 && <p>> 正在复制到节点：ESA-Singapore-01... 完成</p>}
        {step >= 2 && <p>> 正在复制到节点：ESA-Frankfurt-04... 完成</p>}
        {step >= 2 && <p>> 正在复制到节点：ESA-SiliconValley-09... 完成</p>}
        {step >= 3 && <p>> <span className="text-neon">保险库已就绪。状态：FROZEN。</span></p>}
      </div>
    </div>
  );
};