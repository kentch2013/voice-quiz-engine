import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SvgSpatialScene } from '../SvgSpatialScene';

describe('Batch 3 Widget Components', () => {
  describe('SvgSpatialScene', () => {
    it('renders spatial scene SVG with proper aria label and labels', () => {
      render(
        <SvgSpatialScene
          subject="cat"
          target="table"
          preposition="under"
          subjectEmoji="🐱"
          targetEmoji="🛋️"
        />
      );
      const svg = screen.getByRole('img', { name: /cat under table/i });
      expect(svg).toBeDefined();
      expect(screen.getByText(/Cat & table/i)).toBeDefined();
    });
  });
});
