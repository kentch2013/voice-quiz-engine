import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicLobby } from '../TopicLobby';
import { TOPICS } from '../../utils/quizGenerator';

describe('TopicLobby Component', () => {
  it('renders all topics from TOPICS directly in the lobby grid', () => {
    render(
      <TopicLobby
        selectedTopicId="math-sprint"
        onSelectTopic={vi.fn()}
        readAloudEnabled={true}
        onToggleReadAloud={vi.fn()}
        onStartSession={vi.fn()}
      />
    );

    // Verify main header title
    expect(screen.getByText('Pick a Quiz Topic')).toBeDefined();

    // Verify all TOPICS are displayed in the grid
    TOPICS.forEach((topic) => {
      expect(screen.getByText(topic.title)).toBeDefined();
    });
  });

  it('does not render grade band filter tabs, buttons, or grade labels', () => {
    render(
      <TopicLobby
        selectedTopicId="math-sprint"
        onSelectTopic={vi.fn()}
        readAloudEnabled={true}
        onToggleReadAloud={vi.fn()}
        onStartSession={vi.fn()}
      />
    );

    // Grade Band filter label and grade band buttons should not exist
    expect(screen.queryByText('Grade Band:')).toBeNull();
    expect(screen.queryByText('K-1')).toBeNull();
    expect(screen.queryByText('2-3')).toBeNull();
    expect(screen.queryByText('4-5')).toBeNull();
    expect(screen.queryByText(/Grade K-1/i)).toBeNull();
  });

  it('handles topic selection, read-aloud toggle, and start session', () => {
    const onSelectTopic = vi.fn();
    const onToggleReadAloud = vi.fn();
    const onStartSession = vi.fn();

    render(
      <TopicLobby
        selectedTopicId="math-sprint"
        onSelectTopic={onSelectTopic}
        readAloudEnabled={true}
        onToggleReadAloud={onToggleReadAloud}
        onStartSession={onStartSession}
      />
    );

    // Click another topic card
    fireEvent.click(screen.getByText('🕒 Clock Reading'));
    expect(onSelectTopic).toHaveBeenCalledWith('clock-reading');

    // Toggle read aloud button
    fireEvent.click(screen.getByText('Read-Aloud: ON'));
    expect(onToggleReadAloud).toHaveBeenCalledTimes(1);

    // Click start quiz session button
    fireEvent.click(screen.getByText(/Start Quiz Session/i));
    expect(onStartSession).toHaveBeenCalledTimes(1);
  });
});
