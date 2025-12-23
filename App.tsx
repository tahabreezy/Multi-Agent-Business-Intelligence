
import React, { useState, useCallback, useRef } from 'react';
import { AgentType, DebateSession, Verdict } from './types';
import { generateAgentResponse, generateClarifyingQuestions } from './geminiService';
import AgentCard from './components/AgentCard';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [location, setLocation] = useState('');
  const [session, setSession] = useState<DebateSession | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const startDebate = async () => {
    if (!idea || !location) return;
    setIsLoading(true);

    const newSession: DebateSession = {
      idea,
      location,
      responses: [],
      status: 'analyzing',
    };
    setSession(newSession);
    setCurrentStep(1);

    try {
      // Phase 1: INITIAL ANALYSIS (Optimist & Skeptic)
      const opt = await generateAgentResponse(AgentType.OPTIMIST, idea, location);
      const skp = await generateAgentResponse(AgentType.SKEPTIC, idea, location, opt as string);
      
      setSession(prev => prev ? ({
        ...prev,
        responses: [
          { type: AgentType.OPTIMIST, content: opt as string, timestamp: Date.now() },
          { type: AgentType.SKEPTIC, content: skp as string, timestamp: Date.now() }
        ],
        status: 'clarifying'
      }) : null);

      // Phase 2: RECURSIVE REFINEMENT (Generate Questions)
      const qs = await generateClarifyingQuestions(idea, location);
      setQuestions(qs);
      setCurrentStep(2);
    } catch (error) {
      console.error(error);
      setSession(prev => prev ? ({ ...prev, status: 'error' }) : null);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRefinement = async () => {
    if (!session) return;
    setIsLoading(true);
    setSession(prev => prev ? ({ ...prev, status: 'refining', clarifications: answers }) : null);
    setCurrentStep(3);

    try {
      // Phase 3: DATA ANALYSTS (Social & Ad Spend)
      const social = await generateAgentResponse(AgentType.SOCIAL_LISTENER, idea, location);
      const ad = await generateAgentResponse(AgentType.AD_ANALYST, idea, location);

      setSession(prev => prev ? ({
        ...prev,
        responses: [
          ...prev.responses,
          { type: AgentType.SOCIAL_LISTENER, content: social as string, timestamp: Date.now() },
          { type: AgentType.AD_ANALYST, content: ad as string, timestamp: Date.now() }
        ],
        status: 'judging'
      }) : null);
      setCurrentStep(4);

      // Phase 4: FINAL JUDGMENT + SUPREME COURT
      const allContext = session.responses.map(r => r.content).join("\n---\n") + "\nUser Clarifications: " + answers.join("; ");
      const verdict = await generateAgentResponse(AgentType.JUDGE, idea, location, allContext) as Verdict;
      
      // Supreme Court Tie-breaker (o1 model)
      const supremeRuling = await generateAgentResponse(AgentType.SUPREME_COURT, idea, location, JSON.stringify(verdict) + "\n" + allContext);
      verdict.supremeCourtRuling = supremeRuling as string;

      setSession(prev => prev ? ({
        ...prev,
        verdict,
        status: 'completed'
      }) : null);
      setCurrentStep(5);
    } catch (error) {
      console.error(error);
      setSession(prev => prev ? ({ ...prev, status: 'error' }) : null);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSession(null);
    setCurrentStep(0);
    setIdea('');
    setLocation('');
    setQuestions([]);
    setAnswers(['', '', '']);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20 text-white">W</div>
            <h1 className="text-xl font-bold mono tracking-tighter">MABI <span className="text-blue-500 italic">WAR-ROOM v2</span></h1>
          </div>
          {session && (
            <button onClick={reset} className="text-xs text-neutral-500 hover:text-white mono uppercase tracking-widest transition-colors">[ RESET_TERMINAL ]</button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {!session ? (
          <div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Recursive Strategy.</h2>
            <p className="text-neutral-400 mb-8">Deploy our Social-Media Listener and Ad-Spend Analyst hive to battle-test your unit economics.</p>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 mono group-focus-within:text-blue-500 transition-colors">Business Concept</label>
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. A luxury dog perfume subscription box using organic essential oils..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 mono group-focus-within:text-blue-500 transition-colors">Target Location</label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Silicon Valley, USA"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={startDebate}
                disabled={!idea || !location || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-lg font-bold text-sm mono uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 text-white"
              >
                {isLoading ? 'INITIALIZING_HIVE...' : 'INITIALIZE_DEBATE_LOOP'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-sm font-bold mono text-neutral-500 tracking-widest uppercase">ACTIVE_WAR_SESSION</h2>
                <h3 className="text-xl font-bold truncate max-w-md">{idea}</h3>
                <p className="text-sm text-neutral-400 font-mono">GEO_LOCK: {location}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded text-[10px] mono uppercase font-bold border ${
                  session.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>

            {/* Stepper Display */}
            <div className="grid gap-4">
              {/* Optimist & Skeptic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AgentCard 
                  type={AgentType.OPTIMIST} 
                  content={session.responses.find(r => r.type === AgentType.OPTIMIST)?.content || ''} 
                  isThinking={session.status === 'analyzing' && currentStep === 1}
                />
                <AgentCard 
                  type={AgentType.SKEPTIC} 
                  content={session.responses.find(r => r.type === AgentType.SKEPTIC)?.content || ''} 
                  isThinking={session.status === 'analyzing' && currentStep === 1}
                />
              </div>

              {/* Recursive Refinement Form */}
              {session.status === 'clarifying' && questions.length > 0 && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-6 rounded-xl animate-in zoom-in duration-300">
                  <h3 className="text-sm font-bold mono uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                    <span className="animate-ping w-2 h-2 rounded-full bg-blue-500"></span>
                    Recursive Refinement Input Required
                  </h3>
                  <div className="space-y-4">
                    {questions.map((q, i) => (
                      <div key={i}>
                        <label className="block text-xs text-neutral-400 mb-2 italic">Q{i+1}: {q}</label>
                        <input 
                          type="text"
                          value={answers[i]}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[i] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700 rounded p-3 text-sm focus:border-blue-500 outline-none"
                          placeholder="Provide details..."
                        />
                      </div>
                    ))}
                    <button 
                      onClick={submitRefinement}
                      disabled={isLoading || answers.some(a => !a)}
                      className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded text-sm mono font-bold text-white transition-all"
                    >
                      {isLoading ? 'PROCESSING_DATA...' : 'SUBMIT_REFINEMENTS_TO_HIVE'}
                    </button>
                  </div>
                </div>
              )}

              {/* Data Analysts */}
              {(currentStep >= 3) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AgentCard 
                    type={AgentType.SOCIAL_LISTENER} 
                    content={session.responses.find(r => r.type === AgentType.SOCIAL_LISTENER)?.content || ''} 
                    isThinking={session.status === 'refining'}
                  />
                  <AgentCard 
                    type={AgentType.AD_ANALYST} 
                    content={session.responses.find(r => r.type === AgentType.AD_ANALYST)?.content || ''} 
                    isThinking={session.status === 'refining'}
                  />
                </div>
              )}

              {/* Final Judge */}
              {currentStep >= 4 && (
                <AgentCard 
                  type={AgentType.JUDGE} 
                  content={session.verdict ? `FINAL SYNOPSIS: ${session.verdict.summary}` : ''} 
                  isThinking={session.status === 'judging'}
                />
              )}
            </div>

            {session.verdict && (
              <Dashboard verdict={session.verdict} />
            )}

            {session.status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mono">
                [SYSTEM_CRITICAL_ERROR]: DATA_CORRUPTION_OR_API_TIMEOUT. Please reset terminal.
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 py-6 bg-black/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-neutral-600 mono uppercase tracking-widest">
            MABI FRAMEWORK // KERNEL: o1-REASONING_ENGINE // VERSION: 2.1.0-BETA
          </p>
          <div className="flex gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
