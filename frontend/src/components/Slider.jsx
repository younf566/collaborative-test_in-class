import { useRef, useEffect } from 'react';

export default function Slider({ value, min = 0, max = 10, step = 1, onChange, ...props }) {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      sliderRef.current.style.setProperty('--value', `${percentage}%`);
    }
  }, [value, min, max]);

  return (
    <input
      ref={sliderRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}