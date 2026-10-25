import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('react-native', async () => await vi.importActual('react-native-web'));
import { Input } from '../Input';
import { Button } from '../Button';
import { FormField } from '@/components/forms/FormField';
import { DurationInput } from '@/components/forms/DurationInput';
import { useState } from 'react';
import { durationParts } from '@/lib/utils/duration-input';

afterEach(cleanup);
describe('shared controls on web', () => {
  it('associates label and validation error with the input', () => {
    render(<FormField label="E-mail" error="Confira o e-mail"><Input /></FormField>);
    const input = screen.getByRole('textbox', { name: 'E-mail' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Confira o e-mail');
    expect(screen.getByRole('alert')).toHaveTextContent('Confira o e-mail');
  });
  it('keeps a loading button named and disabled without re-submitting', () => {
    const submit = vi.fn();
    render(<Button loading onPress={submit}>Enviar e concluir</Button>);
    const button = screen.getByRole('button', { name: 'Enviar e concluir' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
  });
  it('retains caller focus and blur callbacks', () => {
    const onFocus = vi.fn(); const onBlur = vi.fn();
    render(<Input accessibilityLabel="Título" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByRole('textbox', { name: 'Título' });
    fireEvent.focus(input); fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
  it('keeps duration units and feedback understandable while editing', () => {
    function Form() { const [value, setValue] = useState(durationParts(180)); return <DurationInput value={value} onChange={setValue} />; }
    render(<Form />);
    expect(screen.getByRole('textbox', { name: 'Horas' })).toHaveValue('3');
    fireEvent.change(screen.getByRole('textbox', { name: 'Minutos' }), { target: { value: '30' } });
    expect(screen.getByText('Duração total: 3h 30min.')).toBeInTheDocument();
    expect(screen.getByText('Duração total: 3h 30min.')).toHaveAttribute('aria-live', 'polite');
    fireEvent.change(screen.getByRole('textbox', { name: 'Minutos' }), { target: { value: '60' } });
    expect(screen.getByText(/Use de 0 a 59/)).toBeInTheDocument();
  });
});
