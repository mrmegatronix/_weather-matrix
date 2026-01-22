import React from 'react';

interface ClockProps {
  time: Date;
}

const Clock: React.FC<ClockProps> = ({ time }) => {
  let hoursRaw = time.getHours();
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
  hoursRaw = hoursRaw % 12;
  hoursRaw = hoursRaw ? hoursRaw : 12; 
  const hours = hoursRaw.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  // Use modulo for blinking effect. 
  const isEvenSecond = time.getSeconds() % 2 === 0;

  const dateStr = time.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  const dateChars = dateStr.split('');

  return (
    <div className="flex flex-col items-end w-max">
      {/* Time Row - Defines the width */}
      <div className="flex items-baseline justify-end leading-none font-bold font-heading text-white drop-shadow-2xl relative">
        <span className="text-[6.5rem] tracking-tighter">{hours}</span>
        <span 
          className="text-[5.5rem] mx-2 -mt-4 transition-opacity duration-150 ease-in-out text-[#D4AF37]" 
          style={{ opacity: isEvenSecond ? 1 : 0.2 }}
        >
          :
        </span>
        <span className="text-[6.5rem] tracking-tighter">{minutes}</span>
        <span className="text-4xl text-[#D4AF37] ml-4 self-start mt-6">{ampm}</span>
      </div>

      {/* Date Row - Spreads characters to match exact width of the Time container */}
      <div className="w-full border-t-4 border-[#D4AF37] mt-2 pt-2">
        <div className="flex justify-between items-center w-full">
            {dateChars.map((char, index) => (
            <span key={index} className="text-2xl font-bold text-[#D4AF37] drop-shadow-md">
                {char === ' ' ? '\u00A0' : char}
            </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Clock;