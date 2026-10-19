import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import type { GradeBand, Topic } from '../types/quiz';
import { TOPICS } from '../utils/quizGenerator';

interface TopicLobbyProps {
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  selectedGradeBand: GradeBand;
  onSelectGradeBand: (gradeBand: GradeBand) => void;
  readAloudEnabled: boolean;
  onToggleReadAloud: () => void;
  onStartSession: () => void;
}

export const TopicLobby: React.FC<TopicLobbyProps> = ({
  selectedTopicId,
  onSelectTopic,
  selectedGradeBand,
  onSelectGradeBand,
  readAloudEnabled,
  onToggleReadAloud,
  onStartSession,
}) => {
  const gradeBands: GradeBand[] = ['K-1', '2-3', '4-5'];

  const filteredTopics = TOPICS.filter((topic) =>
    topic.gradeBands.includes(selectedGradeBand)
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles size={16} /> Interactive Learning Lobby
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
          Pick a Quiz Topic
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-md mx-auto">
          Choose a subject, select your grade band, and turn on voice prompts for interactive practice!
        </p>
      </div>

      {/* Grade Band Filter & Read-Aloud Toggle Controls */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Grade Band Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BookOpen size={20} className="text-indigo-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider shrink-0">
            Grade Band:
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            {gradeBands.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => onSelectGradeBand(grade)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedGradeBand === grade
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Read-Aloud Prompt Toggle */}
        <button
          type="button"
          onClick={onToggleReadAloud}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            readAloudEnabled
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {readAloudEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span>
            {readAloudEnabled ? 'Read-Aloud: ON' : 'Read-Aloud: OFF'}
          </span>
        </button>
      </div>

      {/* Topic Selection Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredTopics.map((topic: Topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={`p-6 rounded-3xl border-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-600 shadow-xl ring-4 ring-indigo-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-md'
              }`}
            >
              <div>
                <div className="text-4xl mb-3">{topic.icon}</div>
                <h3 className="text-xl font-black text-indigo-950 mb-1">
                  {topic.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg">
                  Grade {selectedGradeBand}
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    isSelected ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {isSelected ? 'Selected ✓' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Session Button */}
      <button
        type="button"
        onClick={onStartSession}
        className="w-full max-w-sm py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>🚀 Start Quiz Session</span>
      </button>
    </div>
  );
};
