
import React from 'react';
import { AgentType } from '../types';

interface AgentCardProps {
  type: AgentType;
  content: string;
  isThinking?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ type, content, isThinking }) => {
  const getAgentConfig = () => {
    switch (type) {
      case AgentType.OPTIMIST:
        return {
          name: "THE OPTIMIST",
          color: "border-green-500/50 text-green-400",
          bg: "bg-green-500/5",
          icon: "🚀"
        };
      case AgentType.SKEPTIC:
        return {
          name: "THE SKEPTIC",
          color: "border-red-500/50 text-red-400",
          bg: "bg-red-500/5",
          icon: "📉"
        };
      case AgentType.SOCIAL_LISTENER:
        return {
          name: "SOCIAL LISTENER",
          color: "border-pink-500/50 text-pink-400",
          bg: "bg-pink-500/5",
          icon: "📱"
        };
      case AgentType.AD_ANALYST:
        return {
          name: "AD-SPEND ANALYST",
          color: "border-yellow-500/50 text-yellow-400",
          bg: "bg-yellow-500/5",
          icon: "💰"
        };
      case AgentType.JUDGE:
        return {
          name: "THE JUDGE",
          color: "border-blue-500/50 text-blue-400",
          bg: "bg-blue-500/5",
          icon: "⚖️"
        };
      case AgentType.SUPREME_COURT:
        return {
          name: "SUPREME COURT",
          color: "border-purple-500/50 text-purple-400",
          bg: "bg-purple-500/5",
          icon: "🏛️"
        };
    }
  };

  const config = getAgentConfig();

  return (
    <div className={`border ${config.color} ${config.bg} p-4 rounded-lg shadow-xl mb-4 transition-all animate-in fade-in slide-in-from-bottom-2`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{config.icon}</span>
        <h3 className={`font-bold mono text-sm tracking-widest`}>{config.name}</h3>
        {isThinking && (
          <div className="flex gap-1 ml-auto">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
        {content || (isThinking ? "Processing strategic inputs..." : "Standing by...")}
      </div>
    </div>
  );
};

export default AgentCard;
