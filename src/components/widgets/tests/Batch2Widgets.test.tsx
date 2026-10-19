import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SvgColorSwatch } from '../SvgColorSwatch';

describe('Batch 2 Widget Components', () => {
  describe('SvgColorSwatch', () => {
    it('renders color swatch SVG with proper color and aria label', () => {
      render(<SvgColorSwatch colorName="purple" hexColor="#8b5cf6" label="Purple Swatch" />);
      const svg = screen.getByLabelText(/Color swatch for purple/i);
      expect(svg).toBeDefined();
      expect(screen.getByText('Purple Swatch')).toBeDefined();
    });
  });
});
