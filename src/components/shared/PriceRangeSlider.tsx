// PriceRangeInputs.tsx  ← Reusable controlled child component
import { ChangeEvent } from 'react';

interface PriceRangeInputsProps {
  minValue: number;
  maxValue: number | undefined;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number | undefined) => void;
  minLimit?: number;
  maxLimit?: number;
  step?: number;
}

export default function PriceRangeInputs({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minLimit = 0,
  maxLimit = 100_000,
  step = 1000,
}: PriceRangeInputsProps) {
  const effectiveMax = maxValue ?? maxLimit;

  const handleMinSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onMinChange(val);
    // Optional: push max up if min crosses it
    if (maxValue !== undefined && val > maxValue) {
      onMaxChange(val);
    }
  };

  const handleMaxSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onMaxChange(val);
    // Optional: pull min down if max goes below it
    if (val < minValue) {
      onMinChange(val);
    }
  };

  const handleMinInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') {
      onMinChange(minLimit);
      return;
    }
    const val = Number(input);
    if (!Number.isNaN(val)) {
      onMinChange(Math.max(minLimit, val));
    }
  };

  const handleMaxInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') {
      onMaxChange(undefined);
      return;
    }
    const val = Number(input);
    if (!Number.isNaN(val)) {
      onMaxChange(Math.min(maxLimit, val));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* MIN slider + label */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label htmlFor="min-slider" style={{ fontSize: '0.9rem', color: '#555' }}>
            Minimum Price
          </label>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            ₹{minValue.toLocaleString()}
          </span>
        </div>

        <input
          id="min-slider"
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={minValue}
          onChange={handleMinSlider}
          style={{ width: '100%', accentColor: '#0070f3' }}
        />

        <input
          type="number"
          min={minLimit}
          step={step}
          value={minValue}
          onChange={handleMinInput}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
          }}
        />
      </div>

      {/* MAX slider + label */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label htmlFor="max-slider" style={{ fontSize: '0.9rem', color: '#555' }}>
            Maximum Price
          </label>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {maxValue !== undefined ? `₹${maxValue.toLocaleString()}` : '∞'}
          </span>
        </div>

        <input
          id="max-slider"
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={effectiveMax}
          onChange={handleMaxSlider}
          style={{ width: '100%', accentColor: '#ef4444' }}
        />

        <input
          type="number"
          min={minValue}
          step={step}
          placeholder="No limit"
          value={maxValue ?? ''}
          onChange={handleMaxInput}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
          }}
        />
      </div>
    </div>
  );
}