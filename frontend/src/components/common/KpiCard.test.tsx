import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KpiCard from './KpiCard';

describe('KpiCard Component', () => {
  it('renders title, value, subtitle, and badge correctly', () => {
    render(
      <KpiCard
        title="Latencia Media"
        value="450 ms"
        subtitle="Percentil p95: 800 ms"
        badge="p95"
        icon="⏱️"
      />
    );

    expect(screen.getByText('Latencia Media')).toBeTruthy();
    expect(screen.getByText('450 ms')).toBeTruthy();
    expect(screen.getByText('Percentil p95: 800 ms')).toBeTruthy();
    expect(screen.getByText('p95')).toBeTruthy();
  });

  it('triggers onClick handler when card is clicked', () => {
    const handleClick = vi.fn();
    render(
      <KpiCard
        title="Tasa de Error"
        value="5.0%"
        onClick={handleClick}
        clickHint="Filtrar errores"
      />
    );

    const card = screen.getByTitle('Filtrar errores');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
