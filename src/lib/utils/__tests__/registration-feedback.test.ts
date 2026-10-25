import { describe, expect, it } from 'vitest';
import { registrationFeedback } from '../registration-feedback';

describe('registration feedback', () => {
  it('only reports document analysis when the server confirms pending', () => {
    expect(registrationFeedback(true, 'pending').message).toContain('em análise');
    expect(registrationFeedback(true, 'approved').title).toContain('ativa');
    expect(registrationFeedback(true, 'approved').message).not.toContain('análise');
    expect(registrationFeedback(true).message).not.toContain('análise');
  });
  it('keeps upload failure recovery even if an account is already active', () => {
    expect(registrationFeedback(false, 'approved').message).toContain('complete o envio');
    expect(registrationFeedback(false).message).toContain('Perfil > Documentos');
  });
  it('directs rejected accounts to the rejection reason', () => {
    expect(registrationFeedback(true, 'rejected').message).toContain('motivo');
  });
});
