import React, { useState, useEffect } from 'react';
import { StructuredSopDocument } from '../data/sopParser';
import { 
  CheckSquare, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Flame, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  Timer as TimerIcon
} from 'lucide-react';

interface LabChecklistTimerProps {
  sop: StructuredSopDocument;
}

export const LabChecklistTimer: React.FC<LabChecklistTimerProps> = ({ sop }) => {
  // Completed step keys: "stageIndex-stepNum"
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // 1. Configurable Incubation / Reaction Timer
  const [timer1Seconds, setTimer1Seconds] = useState(60 * 60); // 60 mins default
  const [isTimer1Running, setIsTimer1Running] = useState(false);
  const [timer1Label, setTimer1Label] = useState('Reaction / Incubation');

  // 2. Precision Cooling / Settling Timer
  const [timer2Seconds, setTimer2Seconds] = useState(20 * 60); // 20 mins default
  const [isTimer2Running, setIsTimer2Running] = useState(false);
  const [timer2Label, setTimer2Label] = useState('Cooling / Stabilization');

  // 3. General Bench Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Play audio alert
  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext unallowed
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimer1Running && timer1Seconds > 0) {
      interval = setInterval(() => setTimer1Seconds(s => s - 1), 1000);
    } else if (timer1Seconds === 0 && isTimer1Running) {
      setIsTimer1Running(false);
      playAlertTone();
    }
    return () => clearInterval(interval);
  }, [isTimer1Running, timer1Seconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimer2Running && timer2Seconds > 0) {
      interval = setInterval(() => setTimer2Seconds(s => s - 1), 1000);
    } else if (timer2Seconds === 0 && isTimer2Running) {
      setIsTimer2Running(false);
      playAlertTone();
    }
    return () => clearInterval(interval);
  }, [isTimer2Running, timer2Seconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isStopwatchRunning) {
      interval = setInterval(() => setStopwatchSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleStep = (stageIdx: number, stepNum: number) => {
    const key = `${stageIdx}-${stepNum}`;
    setCompletedSteps(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Calculate total steps
  const totalSteps = sop.procedureStages.reduce((acc, stage) => acc + stage.steps.length, 0);
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Laboratory Bench Workstation
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {sop.documentTitle} — Protocol Execution Checklist
          </h1>
          <p className="text-xs text-slate-500">
            Interactive analytical step verification with configurable timers for incubations, cooling, and reaction monitoring.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-44 text-right">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-600">SOP Compliance</span>
            <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {completedSteps.length} of {totalSteps} protocol steps verified
          </div>
        </div>
      </div>

      {/* BENCHTOP TIMERS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timer 1: Incubation / Reaction */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                <Clock className="w-3.5 h-3.5" />
                {timer1Label}
              </span>
              <span className="font-mono text-[10px]">Timer 1</span>
            </div>
            <div className="my-3 text-center">
              <div className="text-3xl font-black font-mono text-slate-900">
                {formatTimer(timer1Seconds)}
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mb-3 text-[10px]">
              <button onClick={() => setTimer1Seconds(15 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">15m</button>
              <button onClick={() => setTimer1Seconds(30 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">30m</button>
              <button onClick={() => setTimer1Seconds(60 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">1h</button>
              <button onClick={() => setTimer1Seconds(120 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">2h</button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsTimer1Running(!isTimer1Running)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                isTimer1Running ? 'bg-amber-100 text-amber-900' : 'bg-slate-900 text-white'
              }`}
            >
              {isTimer1Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTimer1Running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => { setIsTimer1Running(false); setTimer1Seconds(60 * 60); }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timer 2: Cooling / Desiccator */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-blue-700">
                <Clock className="w-3.5 h-3.5" />
                {timer2Label}
              </span>
              <span className="font-mono text-[10px]">Timer 2</span>
            </div>
            <div className="my-3 text-center">
              <div className="text-3xl font-black font-mono text-blue-900">
                {formatTimer(timer2Seconds)}
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mb-3 text-[10px]">
              <button onClick={() => setTimer2Seconds(5 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">5m</button>
              <button onClick={() => setTimer2Seconds(10 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">10m</button>
              <button onClick={() => setTimer2Seconds(20 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">20m</button>
              <button onClick={() => setTimer2Seconds(45 * 60)} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">45m</button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsTimer2Running(!isTimer2Running)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                isTimer2Running ? 'bg-blue-100 text-blue-900' : 'bg-blue-600 text-white'
              }`}
            >
              {isTimer2Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTimer2Running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => { setIsTimer2Running(false); setTimer2Seconds(20 * 60); }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timer 3: Stopwatch */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
                <TimerIcon className="w-3.5 h-3.5" />
                Analytical Stopwatch
              </span>
              <span className="font-mono text-[10px]">Elapsed Time</span>
            </div>
            <div className="my-3 text-center">
              <div className="text-3xl font-black font-mono text-emerald-950">
                {formatTimer(stopwatchSeconds)}
              </div>
            </div>
            <div className="text-center text-[10px] text-slate-400 font-mono mb-3">
              Precision duration tracker
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                isStopwatchRunning ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-900 text-white'
              }`}
            >
              {isStopwatchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isStopwatchRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => { setIsStopwatchRunning(false); setStopwatchSeconds(0); }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC STAGES & STEPS CHECKLIST */}
      <div className="space-y-6">
        {sop.procedureStages.map((stage, stageIdx) => (
          <div key={stageIdx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                    {stageIdx + 1}
                  </span>
                  Stage {stageIdx + 1}: {stage.stageName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protocol steps for {sop.documentNumber} ({stage.steps.length} steps)
                </p>
              </div>

              <button
                onClick={() => {
                  const stageKeys = stage.steps.map(s => `${stageIdx}-${s.step}`);
                  setCompletedSteps(prev => Array.from(new Set([...prev, ...stageKeys])));
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                Mark Stage Completed
              </button>
            </div>

            <div className="space-y-3">
              {stage.steps.map((s, stepIdx) => {
                const stepKey = `${stageIdx}-${s.step}-${stepIdx}`;
                const isDone = completedSteps.includes(stepKey);

                return (
                  <div
                    key={`checklist-stage-${stageIdx}-step-${s.step}-${stepIdx}`}
                    onClick={() => {
                      setCompletedSteps(prev => 
                        prev.includes(stepKey) ? prev.filter(k => k !== stepKey) : [...prev, stepKey]
                      );
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone 
                        ? 'bg-amber-50/50 border-amber-300 text-slate-900' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="pt-0.5 text-amber-700">
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 fill-amber-600 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          Step 8.{stageIdx + 1}.{s.step}
                        </span>
                        <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {s.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {s.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
