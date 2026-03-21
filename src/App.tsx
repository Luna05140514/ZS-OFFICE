import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Info, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';

type Distance = '1m' | '2m' | '4m';

interface EyePrescription {
  sphereSign: '+' | '-';
  sphereValue: string;
  cylinderValue: string;
}

export default function App() {
  const [distanceMode, setDistanceMode] = useState<'1m' | '2m' | '4m' | 'custom'>('1m');
  const [customDistance, setCustomDistance] = useState<string>('');
  const [rightEye, setRightEye] = useState<EyePrescription>({ sphereSign: '-', sphereValue: '', cylinderValue: '' });
  const [leftEye, setLeftEye] = useState<EyePrescription>({ sphereSign: '-', sphereValue: '', cylinderValue: '' });

  const calculateResult = (eye: EyePrescription, mode: string, custom: string) => {
    const sVal = parseFloat(eye.sphereValue) || 0;
    const sphere = eye.sphereSign === '+' ? sVal : -sVal;
    const cylinder = -(parseFloat(eye.cylinderValue) || 0);

    if (eye.sphereValue === '') return null;

    // 取得距離數值
    let d = 0;
    if (mode === 'custom') {
      d = parseFloat(custom);
    } else {
      d = parseInt(mode);
    }

    if (isNaN(d) || d <= 0) return null;

    // 導數 (1/d)
    const reciprocal = 1 / d;
    
    // 二十度 (0.20D)
    const constantAdjustment = 0.20;

    // Formula: S = X + (1/d) + 0.20
    let rawS = sphere + reciprocal + constantAdjustment;
    
    // 四捨五入至 0.25D
    const roundedS = Math.round(rawS * 4) / 4;
    const roundedC = Math.round(cylinder * 4) / 4;
    
    return {
      sphere: rawS.toFixed(2),
      sphereRounded: roundedS.toFixed(2),
      cylinder: cylinder.toFixed(2),
      cylinderRounded: roundedC.toFixed(2)
    };
  };

  const rightResult = useMemo(() => calculateResult(rightEye, distanceMode, customDistance), [rightEye, distanceMode, customDistance]);
  const leftResult = useMemo(() => calculateResult(leftEye, distanceMode, customDistance), [leftEye, distanceMode, customDistance]);

  const reset = () => {
    setRightEye({ sphereSign: '-', sphereValue: '', cylinderValue: '' });
    setLeftEye({ sphereSign: '-', sphereValue: '', cylinderValue: '' });
    setCustomDistance('');
    setDistanceMode('1m');
  };

  const formatValue = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Calculator size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">蔡司辦公鏡度數轉換器</h1>
          </div>
          <button 
            onClick={reset}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="重置"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          
          {/* Results Section - Now at the top for mobile priority */}
          <div className="order-1">
            <div className="bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 p-6 md:p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold opacity-70 uppercase tracking-[0.2em]">眼位度數結果</h2>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium">即時計算</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                {/* Right Result */}
                <ResultDisplay 
                  label="右眼 (O.D.)" 
                  result={rightResult} 
                  formatValue={formatValue}
                />

                {/* Left Result */}
                <ResultDisplay 
                  label="左眼 (O.S.)" 
                  result={leftResult} 
                  formatValue={formatValue}
                />
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] opacity-50 leading-relaxed italic">
                * 球面 = 遠用球面 + (1/d) + 0.20D。大字為建議度數 (0.25D 單位)。
              </div>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="order-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Info size={16} className="text-blue-600" />
                  遠用處方輸入
                </h2>
                <button 
                  onClick={reset}
                  className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:opacity-70"
                >
                  清除重置
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-8">
                {/* Right Eye */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">R</span>
                    <h3 className="text-sm font-medium text-gray-700">右眼 (O.D.)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PrescriptionInput 
                      label="球面 (S)"
                      value={rightEye.sphereValue}
                      sign={rightEye.sphereSign}
                      onValueChange={(v) => setRightEye(prev => ({ ...prev, sphereValue: v }))}
                      onSignChange={(s) => setRightEye(prev => ({ ...prev, sphereSign: s as '+' | '-' }))}
                      allowSignToggle
                    />
                    <PrescriptionInput 
                      label="散光 (C)"
                      value={rightEye.cylinderValue}
                      sign="-"
                      onValueChange={(v) => setRightEye(prev => ({ ...prev, cylinderValue: v }))}
                      onSignChange={() => {}}
                    />
                  </div>
                </div>

                {/* Left Eye */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">L</span>
                    <h3 className="text-sm font-medium text-gray-700">左眼 (O.S.)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PrescriptionInput 
                      label="球面 (S)"
                      value={leftEye.sphereValue}
                      sign={leftEye.sphereSign}
                      onValueChange={(v) => setLeftEye(prev => ({ ...prev, sphereValue: v }))}
                      onSignChange={(s) => setLeftEye(prev => ({ ...prev, sphereSign: s as '+' | '-' }))}
                      allowSignToggle
                    />
                    <PrescriptionInput 
                      label="散光 (C)"
                      value={leftEye.cylinderValue}
                      sign="-"
                      onValueChange={(v) => setLeftEye(prev => ({ ...prev, cylinderValue: v }))}
                      onSignChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Distance Selection */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700">
                工作距離 (Working Distance)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['1m', '2m', '4m'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistanceMode(d)}
                    className={`py-2 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 ${
                      distanceMode === d 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-sm font-bold">{d === '1m' ? '一米' : d === '2m' ? '兩米' : '四米'}</span>
                    <span className="text-[10px] opacity-70">{d}</span>
                  </button>
                ))}
                <div className={`relative rounded-xl border-2 transition-all p-1 flex flex-col gap-0.5 ${
                  distanceMode === 'custom' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-100 bg-white'
                }`}>
                  <button 
                    onClick={() => setDistanceMode('custom')}
                    className="absolute inset-0 z-0"
                  />
                  <span className={`text-[9px] font-bold uppercase tracking-wider relative z-10 text-center ${
                    distanceMode === 'custom' ? 'text-blue-600' : 'text-gray-400'
                  }`}>自選 (m)</span>
                  <input 
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    value={customDistance}
                    onChange={(e) => {
                      setCustomDistance(e.target.value);
                      setDistanceMode('custom');
                    }}
                    className={`w-full bg-transparent border-none outline-none text-center font-bold text-sm relative z-10 ${
                      distanceMode === 'custom' ? 'text-blue-700 placeholder:text-blue-300' : 'text-gray-500 placeholder:text-gray-300'
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Tips Card */}
            <div className="bg-gray-100 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600" />
                距離參考
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-gray-500">
                <p>• 1m: 閱讀/精細工作</p>
                <p>• 2m: 辦公桌/螢幕</p>
                <p>• 4m: 會議室/室內</p>
                <p>• 自選: 0.5m 間隔</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PrescriptionInput({ 
  label, 
  value, 
  sign, 
  onValueChange, 
  onSignChange, 
  allowSignToggle = false 
}: { 
  label: string, 
  value: string, 
  sign: string, 
  onValueChange: (v: string) => void, 
  onSignChange: (s: string) => void,
  allowSignToggle?: boolean
}) {
  const handleBlur = () => {
    if (!value) return;
    // Smart parse: if input is an integer >= 10 and no dot, divide by 100
    if (!value.includes('.') && parseFloat(value) >= 10) {
      const parsed = (parseFloat(value) / 100).toFixed(2);
      onValueChange(parsed);
    } else if (value !== '') {
      onValueChange(parseFloat(value).toFixed(2));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex group">
        {allowSignToggle ? (
          <button
            onClick={() => onSignChange(sign === '+' ? '-' : '+')}
            className={`w-10 flex items-center justify-center rounded-l-xl border-2 border-r-0 transition-all font-bold text-base ${
              sign === '+' 
                ? 'bg-blue-50 border-blue-100 text-blue-600' 
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {sign}
          </button>
        ) : (
          <div className="w-10 flex items-center justify-center rounded-l-xl border-2 border-r-0 bg-gray-50 border-gray-100 text-gray-400 font-bold text-base">
            {sign}
          </div>
        )}
        <input
          type="number"
          step="0.25"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="0.00"
          className="flex-1 px-3 py-2 bg-white border-2 border-gray-100 rounded-r-xl focus:border-blue-500 outline-none transition-all text-sm font-semibold placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}

function ResultDisplay({ label, result, formatValue }: { label: string, result: { sphere: string, sphereRounded: string, cylinder: string, cylinderRounded: string } | null, formatValue: (v: string) => string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</div>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-start gap-8"
          >
            <div className="flex-1">
              <div className="text-[9px] opacity-40 uppercase mb-1">球面 (S)</div>
              <div className="text-3xl font-bold tabular-nums tracking-tighter">
                {formatValue(result.sphereRounded)}
              </div>
              <div className="text-[9px] opacity-40 font-medium mt-0.5">
                精確: {formatValue(result.sphere)}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[9px] opacity-40 uppercase mb-1">散光 (C)</div>
              <div className="text-3xl font-bold tabular-nums tracking-tighter">
                {formatValue(result.cylinderRounded)}
              </div>
              <div className="text-[9px] opacity-40 font-medium mt-0.5">
                精確: {formatValue(result.cylinder)}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="text-xs font-medium italic"
          >
            等待輸入...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
