import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders Apex Citadel text', () => {
    render(<App />);
    expect(screen.getByText('Apex Citadel')).toBeInTheDocument();
  });
});
