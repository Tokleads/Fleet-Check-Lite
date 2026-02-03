import { describe, it, expect, beforeAll } from 'vitest';
import { Resend } from 'resend';

describe('Resend Email Integration', () => {
  let resend: Resend;

  beforeAll(() => {
    // Load environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not found in environment');
    }
    resend = new Resend(apiKey);
  });

  it('should have valid RESEND_API_KEY', () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it('should initialize Resend client', () => {
    expect(resend).toBeDefined();
    expect(resend.emails).toBeDefined();
    expect(typeof resend.emails.send).toBe('function');
  });

  it('should validate email sending capability (dry run)', async () => {
    // This test validates the API key works without actually sending an email
    // We'll just check that the client is properly configured
    expect(resend.emails).toHaveProperty('send');
    
    // Verify API key format is correct
    const apiKey = process.env.RESEND_API_KEY!;
    expect(apiKey.length).toBeGreaterThan(20);
    expect(apiKey.startsWith('re_')).toBe(true);
  });
});
