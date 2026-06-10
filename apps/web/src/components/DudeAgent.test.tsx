import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DudeAgent } from './DudeAgent';

describe('DudeAgent', () => {
  it('opens from the corner and sends owner-scoped chat requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Fleet is steady, creator.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<DudeAgent ownerEmail="mr.jwswain@gmail.com" />);

    fireEvent.click(screen.getByRole('button', { name: /open dude agent/i }));
    fireEvent.change(screen.getByLabelText(/message dude/i), {
      target: { value: 'status check' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(screen.getByText('Fleet is steady, creator.')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/dude/chat'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('status check'),
      }),
    );
  });
});
