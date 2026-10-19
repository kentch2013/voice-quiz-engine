import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdaptiveKeypad } from '../AdaptiveKeypad';
import type { QuizOption } from '../../../types/quiz';

describe('AdaptiveKeypad Component', () => {
  it('renders numeric keypad with digits, delete, and submit controls', () => {
    const onKeyPress = vi.fn();
    const onDelete = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <AdaptiveKeypad
        type="numeric"
        value=""
        onKeyPress={onKeyPress}
        onDelete={onDelete}
        onSubmit={onSubmit}
      />
    );

    // Verify touch keypad title
    expect(screen.getByText('Touch Keypad')).toBeDefined();

    // Verify numeric buttons 0-9
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeDefined();
    }

    // Click '5'
    fireEvent.click(screen.getByText('5'));
    expect(onKeyPress).toHaveBeenCalledWith('5');

    // Click delete button
    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);

    // Submit button should be disabled when value is empty
    const enterBtn = screen.getByLabelText('Enter');
    expect(enterBtn.getAttribute('disabled')).toBeDefined();

    // Rerender with value
    rerender(
      <AdaptiveKeypad
        type="numeric"
        value="5"
        onKeyPress={onKeyPress}
        onDelete={onDelete}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByLabelText('Enter'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders alphabet keypad with A-Z letters', () => {
    const onKeyPress = vi.fn();
    const onDelete = vi.fn();
    const onSubmit = vi.fn();

    render(
      <AdaptiveKeypad
        type="alphabet"
        value="A"
        onKeyPress={onKeyPress}
        onDelete={onDelete}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText('Alphabet Keypad')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('Z')).toBeDefined();

    fireEvent.click(screen.getByText('B'));
    expect(onKeyPress).toHaveBeenCalledWith('B');

    fireEvent.click(screen.getByText('Clear'));
    expect(onDelete).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders choice keypad with provided options', () => {
    const onOptionSelect = vi.fn();
    const options: QuizOption[] = [
      { id: 'opt1', label: 'Option 1', value: '1' },
      { id: 'opt2', label: 'Option 2', value: '2' },
    ];

    render(
      <AdaptiveKeypad
        type="choice"
        options={options}
        onKeyPress={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
        onOptionSelect={onOptionSelect}
      />
    );

    expect(screen.getByText('Select an option')).toBeDefined();
    expect(screen.getByText('Option 1')).toBeDefined();
    expect(screen.getByText('Option 2')).toBeDefined();

    fireEvent.click(screen.getByText('Option 1'));
    expect(onOptionSelect).toHaveBeenCalledWith(options[0]);
  });

  it('renders null when type is none', () => {
    const { container } = render(
      <AdaptiveKeypad
        type="none"
        onKeyPress={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
