import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicLobby } from '../TopicLobby';

describe('TopicLobby Batch 1 Modules', () => {
  it('displays all Batch 1 math topics in lobby grid', () => {
    const handleSelectTopic = vi.fn();
    const handleToggleReadAloud = vi.fn();
    const handleStartSession = vi.fn();

    render(
      <TopicLobby
        selectedTopicId="single-digit-addition"
        onSelectTopic={handleSelectTopic}
        readAloudEnabled={true}
        onToggleReadAloud={handleToggleReadAloud}
        onStartSession={handleStartSession}
      />
    );

    expect(screen.getByText('➕ Single-Digit Addition')).toBeDefined();
    expect(screen.getByText('➖ Single-Digit Subtraction')).toBeDefined();
    expect(screen.getByText('🔟 Number Bonds to 10')).toBeDefined();
    expect(screen.getByText('🔢 Skip Counting')).toBeDefined();
    expect(screen.getByText('🐍 Number Snake Game')).toBeDefined();
    expect(screen.getByText('🧊 Place Value Blocks')).toBeDefined();
    expect(screen.getByText('🪙 Coin Identification')).toBeDefined();
  });

  it('allows selecting a Batch 1 topic', () => {
    const handleSelectTopic = vi.fn();

    render(
      <TopicLobby
        selectedTopicId="single-digit-addition"
        onSelectTopic={handleSelectTopic}
        readAloudEnabled={true}
        onToggleReadAloud={vi.fn()}
        onStartSession={vi.fn()}
      />
    );

    const coinTopicCard = screen.getByText('🪙 Coin Identification');
    fireEvent.click(coinTopicCard);

    expect(handleSelectTopic).toHaveBeenCalledWith('coin-identification');
  });
});
