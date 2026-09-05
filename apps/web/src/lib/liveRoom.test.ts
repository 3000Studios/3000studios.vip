import { describe, expect, it } from 'vitest';
import { CASH_APP_URL, cashAppTipUrl } from './liveRoom';

describe('cashAppTipUrl', () => {
  it('opens the cashtag without an amount', () => {
    expect(cashAppTipUrl()).toBe(CASH_APP_URL);
  });

  it('appends a dollar amount', () => {
    expect(cashAppTipUrl(10)).toBe(`${CASH_APP_URL}/10`);
  });
});
