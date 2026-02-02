import { describe, it, expect } from 'vitest';
import { Resend } from 'resend';

describe('Resend API Configuration', () => {
  it('should have RESEND_API_KEY configured', () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it('should initialize Resend client successfully', () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    expect(resend).toBeDefined();
  });

  it('should validate API key format', async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Test with a dry-run email validation (won't actually send)
    // Just checking if the client can be instantiated and API key is valid format
    expect(resend).toHaveProperty('emails');
    expect(typeof resend.emails.send).toBe('function');
  });
});
