
import React from 'react';
import { Verdict } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, RadarProps } from 'recharts';

interface DashboardProps {
  verdict: Verdict;
}

const Dashboard: React.FC<DashboardProps> = ({ verdict }) => {
  const radarData = [
    { subject: 'Viability', A: verdict.viabilityScore * 10 },
    { subject: 'Market Fit', A: 75 },
    { subject: 'Scalability', A: 85 },
    { subject: 'Social Pulse', A: 70 },
    { subject: 'Risk Factor', A: (10 - verdict.viabilityScore) * 10 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Result Summary Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-blue-500">Verdict</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm mono">
            SCORE: {verdict.viabilityScore}/10
          </span>
        </h2>
        <p className="text-neutral-400 mb-6 italic">"{verdict.summary}"</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg">
            <h4 className="text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-1">Social Sentiment</h4>
            <p className="text-xs text-neutral-300">{verdict.socialSentiment}</p>
          </div>
          <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <h4 className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-1">Estimated CAC</h4>
            <p className="text-xs text-neutral-300">{verdict.estimatedCAC}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Critical Risks</h4>
            <ul className="text-sm space-y-1">
              {verdict.keyRisks.map((r, i) => (
                <li key={i} className="flex gap-2 text-neutral-300">
                  <span className="text-red-500">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Strategic Opportunities</h4>
            <ul className="text-sm space-y-1">
              {verdict.keyOpportunities.map((o, i) => (
                <li key={i} className="flex gap-2 text-neutral-300">
                  <span className="text-green-500">•</span> {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Risk-Opportunity Analysis</h3>
        <div className="w-full h-[256px] relative" style={{ minWidth: '100%', minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supreme Court Ruling */}
      {verdict.supremeCourtRuling && (
        <div className="md:col-span-2 bg-purple-900/10 border border-purple-500/30 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
            🏛️ Supreme Court Ruling (o1-Reasoning)
          </h3>
          <p className="text-sm text-neutral-200 leading-relaxed italic">{verdict.supremeCourtRuling}</p>
        </div>
      )}

      {/* Sources Card */}
      <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Market Grounding Sources</h3>
        <div className="flex flex-wrap gap-2">
          {verdict.sources && verdict.sources.length > 0 ? (
            verdict.sources.map((source, i) => (
              <a
                key={i}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-blue-400 rounded-lg border border-neutral-700 flex items-center gap-2 transition-colors"
              >
                <span className="truncate max-w-[200px]">{source.title}</span>
                <span className="opacity-50">↗</span>
              </a>
            ))
          ) : (
            <span className="text-neutral-600 text-sm">No external sources identified in this run.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
