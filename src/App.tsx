import { useGameEngine } from './hooks/useGameEngine';
import { TopicLobby } from './components/TopicLobby';
import { ProgressBar } from './components/ProgressBar';
import { GameBoard } from './components/GameBoard';
import { AdaptiveKeypad } from './components/keypad/AdaptiveKeypad';
import { SummaryModal } from './components/SummaryModal';
import type { QuizOption } from './types/quiz';

export function App() {
  const {
    status,
    selectedTopicId,
    setSelectedTopicId,
    selectedGradeBand,
    setSelectedGradeBand,
    readAloudEnabled,
    setReadAloudEnabled,
    currentItem,
    currentIndex,
    totalQuestions,
    results,
    questionTimeLeft,
    showSilenceNudge,
    showExpiredAnswer,
    restartCountdown,
    keypadInput,
    setKeypadInput,
    session,
    language,
    setLanguage,
    voiceRecognition,
    tts,
    startGame,
    submitAnswer,
    returnToLobby,
  } = useGameEngine();

  const handleKeypadKeyPress = (char: string) => {
    if (keypadInput.length < 10) {
      setKeypadInput((prev) => prev + char);
    }
  };

  const handleKeypadDelete = () => {
    setKeypadInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadSubmit = () => {
    if (!keypadInput) return;
    submitAnswer(keypadInput, 'keypad');
  };

  const handleOptionSelect = (option: QuizOption) => {
    submitAnswer(option.value, 'choice');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between py-6">
      <header className="px-4 text-center mb-2 flex items-center justify-between max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-2">
          🎙️ Universal Voice Quiz Engine
        </h1>
        {status === 'playing' && (
          <button
            type="button"
            onClick={returnToLobby}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-200 rounded-xl border border-slate-300 transition-all cursor-pointer"
          >
            ← Lobby
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
        {status === 'lobby' && (
          <TopicLobby
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            selectedGradeBand={selectedGradeBand}
            onSelectGradeBand={setSelectedGradeBand}
            readAloudEnabled={readAloudEnabled}
            onToggleReadAloud={() => setReadAloudEnabled(!readAloudEnabled)}
            onStartSession={startGame}
          />
        )}

        {(status === 'playing' || status === 'completed') && (
          <>
            <ProgressBar
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              results={results}
            />

            {currentItem && status === 'playing' && (
              <>
                <GameBoard
                  item={currentItem}
                  timeLeft={questionTimeLeft}
                  showSilenceNudge={showSilenceNudge}
                  showExpiredAnswer={showExpiredAnswer}
                  transcript={voiceRecognition.transcript}
                  interimTranscript={voiceRecognition.interimTranscript}
                  isListening={voiceRecognition.isListening}
                  volumeLevel={voiceRecognition.volumeLevel}
                  isSpeechDetected={voiceRecognition.isSpeechDetected}
                  keypadInput={keypadInput}
                  language={language}
                  onLanguageChange={setLanguage}
                  onOptionSelect={handleOptionSelect}
                  onReadAloud={() =>
                    tts.speak(currentItem.ttsPrompt || currentItem.prompt)
                  }
                />

                <AdaptiveKeypad
                  type={currentItem.keypad?.type || 'numeric'}
                  options={currentItem.keypad?.options || []}
                  value={keypadInput}
                  onKeyPress={handleKeypadKeyPress}
                  onDelete={handleKeypadDelete}
                  onSubmit={handleKeypadSubmit}
                  onOptionSelect={handleOptionSelect}
                />
              </>
            )}
          </>
        )}

        {status === 'completed' && (
          <SummaryModal
            session={session}
            restartCountdown={restartCountdown}
            onPlayAgain={startGame}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 mt-6">
        Universal Voice Quiz Engine • Kid-friendly Interactive Learning
      </footer>
    </div>
  );
}

export default App;
