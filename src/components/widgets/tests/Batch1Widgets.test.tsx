import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SvgTenFrame } from '../SvgTenFrame';
import { SvgPlaceValueBlocks } from '../SvgPlaceValueBlocks';
import { SvgCoin } from '../SvgCoin';
import { SvgEquationCard } from '../SvgEquationCard';

describe('Batch 1 Widget Components', () => {
  describe('SvgTenFrame', () => {
    it('renders ten frame with filled dots', () => {
      render(<SvgTenFrame count={7} total={10} />);
      const svg = screen.getByLabelText(/Ten frame showing 7 of 10/i);
      expect(svg).toBeDefined();
    });
  });

  describe('SvgPlaceValueBlocks', () => {
    it('renders tens rods and unit cubes', () => {
      render(<SvgPlaceValueBlocks tens={3} ones={4} />);
      expect(screen.getByText('3 Tens')).toBeDefined();
      expect(screen.getByText('4 Ones')).toBeDefined();
    });
  });

  describe('SvgCoin', () => {
    it('renders US quarter coin correctly', () => {
      render(<SvgCoin coin="quarter" />);
      const svg = screen.getByLabelText(/Quarter coin worth 25¢/i);
      expect(svg).toBeDefined();
      expect(screen.getByText('25¢')).toBeDefined();
      expect(screen.getByText('QUARTER')).toBeDefined();
    });

    it('renders penny coin correctly', () => {
      render(<SvgCoin coin="penny" />);
      const svg = screen.getByLabelText(/Penny coin worth 1¢/i);
      expect(svg).toBeDefined();
      expect(screen.getByText('1¢')).toBeDefined();
      expect(screen.getByText('PENNY')).toBeDefined();
    });
  });

  describe('SvgEquationCard', () => {
    it('renders visual equation correctly', () => {
      render(<SvgEquationCard operandA={4} operandB={5} operator="+" displayFormat="equation" />);
      expect(screen.getByText('4')).toBeDefined();
      expect(screen.getByText('+')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('?')).toBeDefined();
    });

    it('renders skip counting sequence correctly', () => {
      render(<SvgEquationCard sequence={[5, 10, 15, '___']} displayFormat="sequence" />);
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('10')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
      expect(screen.getByText('___')).toBeDefined();
    });

    it('renders comparison cards correctly', () => {
      render(<SvgEquationCard operandA={14} operandB={29} operator="vs" displayFormat="comparison" />);
      expect(screen.getByText('14')).toBeDefined();
      expect(screen.getByText('VS')).toBeDefined();
      expect(screen.getByText('29')).toBeDefined();
    });
  });
});
