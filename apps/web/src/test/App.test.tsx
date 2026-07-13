import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the public brand text', () => {
    render(<App />);
    expect(screen.getByText('3000 Studios.vip')).toBeInTheDocument();
  });
});
