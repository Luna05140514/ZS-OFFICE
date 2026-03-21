import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Info, RefreshCw, ArrowRight, CheckCircle2, Plus, Minus } from 'lucide-react';

type Distance = '1m' | '2m' | '4m';

interface EyePrescription {
  sphereSign: '+' | '-';
  sphereValue: string;
  cylinderValue: string;
}

export default function App() {
  const [distanceMode, setDistanceMode] = useState<'1m' | '2m' | '4m' | 'custom'>('1m');
  const [customDistance, setCustomDistance] = useState<string>('0.5');
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
    setCustomDistance('0.5');
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
          <div className="order-1 space-y-4">
            <div className="bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 py-3 px-6 md:py-4 md:px-8 text-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold opacity-70 uppercase tracking-[0.2em]">眼位度數結果</h2>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium">即時換算</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                {/* Right Result */}
                <ResultDisplay 
                  label="右" 
                  result={rightResult} 
                  formatValue={formatValue}
                />

                {/* Left Result */}
                <ResultDisplay 
                  label="左" 
                  result={leftResult} 
                  formatValue={formatValue}
                />
              </div>
            </div>

            {/* Distance Selection - Moved here */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="grid grid-cols-4 gap-2">
                {(['1m', '2m', '4m'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistanceMode(d)}
                    className={`py-2 px-1 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                      distanceMode === d 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{d === '1m' ? '一米' : d === '2m' ? '兩米' : '四米'}</span>
                    <span className="text-[9px] opacity-70">{d}</span>
                  </button>
                ))}
                <div className={`relative rounded-xl border-2 transition-all p-1 flex flex-col items-center justify-center gap-1 ${
                  distanceMode === 'custom' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-100 bg-white'
                }`}>
                  <span className={`text-[9px] font-bold uppercase tracking-tight relative z-10 text-center leading-none ${
                    distanceMode === 'custom' ? 'text-blue-600' : 'text-gray-400'
                  }`}>自選 (m)</span>
                  
                  <div className="flex items-center justify-between w-full relative z-10 px-0.5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const val = parseFloat(customDistance) || 0;
                        setCustomDistance(Math.max(0.5, val - 0.5).toFixed(1));
                        setDistanceMode('custom');
                      }}
                      className={`p-0.5 rounded-md transition-colors ${
                        distanceMode === 'custom' ? 'hover:bg-blue-200 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Minus size={10} strokeWidth={3} />
                    </button>
                    
                    <span className={`font-bold text-[11px] tabular-nums ${
                      distanceMode === 'custom' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {customDistance}
                    </span>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const val = parseFloat(customDistance) || 0;
                        setCustomDistance((val + 0.5).toFixed(1));
                        setDistanceMode('custom');
                      }}
                      className={`p-0.5 rounded-md transition-colors ${
                        distanceMode === 'custom' ? 'hover:bg-blue-200 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setDistanceMode('custom')}
                    className="absolute inset-0 z-0"
                  />
                </div>
              </div>
            </section>
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
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 text-center">
                    <div className="text-[11px] font-black text-blue-600 tracking-tighter leading-none">右</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <PrescriptionInput 
                      label="S"
                      value={rightEye.sphereValue}
                      sign={rightEye.sphereSign}
                      onValueChange={(v) => setRightEye(prev => ({ ...prev, sphereValue: v }))}
                      onSignChange={(s) => setRightEye(prev => ({ ...prev, sphereSign: s as '+' | '-' }))}
                      allowSignToggle
                    />
                    <PrescriptionInput 
                      label="C"
                      value={rightEye.cylinderValue}
                      sign="-"
                      onValueChange={(v) => setRightEye(prev => ({ ...prev, cylinderValue: v }))}
                      onSignChange={() => {}}
                    />
                  </div>
                </div>

                {/* Left Eye */}
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 text-center">
                    <div className="text-[11px] font-black text-indigo-600 tracking-tighter leading-none">左</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <PrescriptionInput 
                      label="S"
                      value={leftEye.sphereValue}
                      sign={leftEye.sphereSign}
                      onValueChange={(v) => setLeftEye(prev => ({ ...prev, sphereValue: v }))}
                      onSignChange={(s) => setLeftEye(prev => ({ ...prev, sphereSign: s as '+' | '-' }))}
                      allowSignToggle
                    />
                    <PrescriptionInput 
                      label="C"
                      value={leftEye.cylinderValue}
                      sign="-"
                      onValueChange={(v) => setLeftEye(prev => ({ ...prev, cylinderValue: v }))}
                      onSignChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 flex items-end justify-between">
          <p className="text-[10px] font-medium text-gray-400 italic tracking-wider">
            * 計算結果僅供參考
          </p>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest">
            製作者 ＴＯＮＹ
          </p>
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
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{label}</label>
      <div className="flex group flex-1">
        {allowSignToggle ? (
          <button
            onClick={() => onSignChange(sign === '+' ? '-' : '+')}
            className={`w-10 flex items-center justify-center rounded-l-xl border-2 border-r-0 transition-all font-bold text-sm ${
              sign === '+' 
                ? 'bg-blue-50 border-blue-100 text-blue-600' 
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {sign}
          </button>
        ) : (
          <div className="w-10 flex items-center justify-center rounded-l-xl border-2 border-r-0 bg-gray-50 border-gray-100 text-gray-400 font-bold text-sm">
            {sign}
          </div>
        )}
        <input
          type="number"
          step="0.25"
          min="0"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="0.00"
          className="w-full px-2 py-1.5 bg-white border-2 border-gray-100 rounded-r-xl focus:border-blue-500 outline-none transition-all text-sm font-semibold placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}

function ResultDisplay({ label, result, formatValue }: { label: string, result: { sphere: string, sphereRounded: string, cylinder: string, cylinderRounded: string } | null, formatValue: (v: string) => string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 shrink-0">
        <div className="text-[11px] font-black opacity-50 uppercase tracking-tighter text-center">
          {label}
        </div>
      </div>
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold opacity-40 shrink-0">S</span>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold tabular-nums tracking-tighter leading-none">
                    {formatValue(result.sphereRounded)}
                  </div>
                  <div className="text-[8px] opacity-30 font-medium mt-1">
                    {formatValue(result.sphere)}
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold opacity-40 shrink-0">C</span>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold tabular-nums tracking-tighter leading-none">
                    {formatValue(result.cylinderRounded)}
                  </div>
                  <div className="text-[8px] opacity-30 font-medium mt-1">
                    {formatValue(result.cylinder)}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="text-[10px] font-medium italic"
            >
              等待輸入...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
