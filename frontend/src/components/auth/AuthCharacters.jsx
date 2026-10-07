import React, { useEffect, useRef, useState } from 'react';

// ============================================================
// AuthCharacters: login/signup page ke cartoon characters
//
// - Aankhein aur chehra mouse cursor ki taraf dekhte hain
// - Poora body cursor ki taraf thoda jhukta hai
// - Har character ek 'mood' dikhata hai (prop se aata hai):
//     'idle'  -> normal (smile)
//     'shy'   -> password type ho raha hai, aankhein band
//     'sad'   -> error aaya, udaas chehra
//     'happy' -> button par mouse / submit ho raha hai, uchhal-kood
// ============================================================

// SVG ka size (andar ke saare numbers isi 380 x 320 ke canvas me hain)
const VIEW_W = 380;
const VIEW_H = 320;
const GROUND = 300; // sab characters isi line par khade hain

// Har mood me har character ka mouth kaisa hoga
const MOUTHS = {
  idle: { orange: 'smile', purple: 'flat', black: 'none', yellow: 'line' },
  happy: { orange: 'open', purple: 'smile', black: 'smile', yellow: 'smile' },
  sad: { orange: 'frown', purple: 'frown', black: 'frown', yellow: 'frown' },
  shy: { orange: 'flat', purple: 'flat', black: 'none', yellow: 'line' },
};

// ---------- Chhote helper functions ----------

// Cursor kis taraf hai? Result: x aur y, dono -1 se +1 ke beech.
// Cursor door ho to value bada (1 ke paas), paas ho to chhota (0 ke paas).
function getLook(cursor, center) {
  if (!cursor) return { x: 0, y: 0 };
  const dx = cursor.x - center.x;
  const dy = cursor.y - center.y;
  const dist = Math.hypot(dx, dy) || 1;
  const strength = Math.min(dist / 160, 1);
  return { x: (dx / dist) * strength, y: (dy / dist) * strength };
}

// Mouth ki alag-alag shapes
function Mouth({ type, x, y, color = '#1a1a1a' }) {
  const line = { fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinecap: 'round' };
  if (type === 'smile') return <path d={`M ${x - 12} ${y} Q ${x} ${y + 12} ${x + 12} ${y}`} {...line} />;
  if (type === 'frown') return <path d={`M ${x - 12} ${y + 8} Q ${x} ${y - 4} ${x + 12} ${y + 8}`} {...line} />;
  if (type === 'open') {
    return (
      <path
        d={`M ${x - 13} ${y} Q ${x} ${y + 26} ${x + 13} ${y} Z`}
        fill="#7a1f00"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    );
  }
  if (type === 'line') return <line x1={x - 12} y1={y} x2={x + 12} y2={y} {...line} />;
  if (type === 'flat') return <line x1={x - 7} y1={y} x2={x + 7} y2={y} {...line} />;
  return null; // 'none'
}

// Ek aankh. white=true ho to safed gola + kaali putli, warna sirf chhota kaala dot.
function Eye({ x, y, r, look, closed, white = true, lineColor = '#1a1a1a', delay = 0 }) {
  // Aankh band (shy mood): ek chhota arc
  if (closed) {
    return (
      <path
        d={`M ${x - r} ${y} Q ${x} ${y - r * 1.3} ${x + r} ${y}`}
        fill="none"
        stroke={lineColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  }
  const pupilR = white ? r * 0.5 : r;
  const move = white ? r - pupilR - 1 : 3; // putli kitna hil sakti hai
  const px = x + look.x * move;
  const py = y + look.y * move;
  return (
    <g className="ac-blink" style={{ animationDelay: `${delay}s` }}>
      {white && <circle cx={x} cy={y} r={r} fill="#fff" />}
      <circle cx={px} cy={py} r={pupilR} fill="#1a1a1a" />
    </g>
  );
}

// ---------- Main component ----------

export default function AuthCharacters({ mood = 'idle' }) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState(null); // mouse ki position (SVG ke canvas me)

  // Mouse kahan hai, ye poori window me track karo
  useEffect(() => {
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect || !rect.width) return;
        // Screen ki position ko SVG canvas ki position me badlo
        setCursor({
          x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
          y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
        });
      });
    };
    const onLeave = () => setCursor(null); // mouse window se bahar gaya

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const shy = mood === 'shy';
  const mouths = MOUTHS[mood] || MOUTHS.idle;

  // Har character ka data: shape ka center (cursor ka angle nikalne ke liye),
  // kitna jhukega (lean), chehra kitna hilega (face)
  const config = {
    purple: { center: { x: 177, y: 112 }, lean: 14, face: 9 },
    black: { center: { x: 247, y: 182 }, lean: 9, face: 6 },
    yellow: { center: { x: 318, y: 228 }, lean: 7, face: 5 },
    orange: { center: { x: 128, y: 250 }, lean: 3, face: 5 },
  };

  // Har character ke liye: cursor ki taraf look, aur uska transform
  const parts = {};
  Object.keys(config).forEach((name) => {
    const c = config[name];
    const look = shy ? { x: 0, y: 0 } : getLook(cursor, c.center); // sharmate hue seedhe/neeche
    parts[name] = {
      look,
      // Body ko cursor ki taraf jhukao (shy me seedha)
      bodyStyle: {
        transform: `skewX(${-look.x * c.lean}deg)`,
        transformOrigin: 'center bottom',
        transformBox: 'fill-box',
      },
      // Chehre ko cursor ki taraf thoda khiskao
      faceStyle: {
        transform: `translate(${look.x * c.face}px, ${look.y * (c.face * 0.6)}px)`,
      },
    };
  });

  // Mood ke hisaab se animation class (khush = uchhalna, udaas = hilna)
  const moodClass = mood === 'happy' ? 'ac-bounce' : mood === 'sad' ? 'ac-shake' : '';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full max-w-md select-none"
      role="img"
      aria-label="Friendly cartoon characters"
    >
      {/* Animations ki CSS (is component ke andar hi rakhi hai) */}
      <style>{`
        .ac-body { transition: transform 0.25s ease-out; }
        .ac-face { transition: transform 0.2s ease-out; }
        .ac-blink {
          transform-box: fill-box;
          transform-origin: center;
          animation: ac-blink 5s infinite;
        }
        .ac-bounce {
          animation: ac-bounce 0.7s ease-in-out infinite;
        }
        .ac-shake {
          animation: ac-shake 0.5s ease-in-out 1;
        }
        @keyframes ac-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }
        @keyframes ac-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        @keyframes ac-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ac-blink, .ac-bounce, .ac-shake { animation: none; }
        }
      `}</style>

      {/* 1. PURPLE: lamba rectangle (sabse peeche) */}
      <g className={moodClass} style={{ animationDelay: '0.1s' }}>
        <g className="ac-body" style={parts.purple.bodyStyle}>
          <rect x="125" y="70" width="105" height={GROUND - 70} fill="#5b2eff" />
          <g className="ac-face" style={parts.purple.faceStyle}>
            <Eye x={155} y={112} r={7} look={parts.purple.look} closed={shy} lineColor="#fff" delay={0.4} />
            <Eye x={200} y={112} r={7} look={parts.purple.look} closed={shy} lineColor="#fff" delay={0.4} />
            <Mouth type={mouths.purple} x={178} y={138} color="#fff" />
          </g>
        </g>
      </g>

      {/* 2. BLACK: beech ka rectangle */}
      <g className={moodClass} style={{ animationDelay: '0.2s' }}>
        <g className="ac-body" style={parts.black.bodyStyle}>
          <rect x="212" y="150" width="72" height={GROUND - 150} fill="#1c1c1e" />
          <g className="ac-face" style={parts.black.faceStyle}>
            <Eye x={233} y={182} r={9} look={parts.black.look} closed={shy} lineColor="#fff" delay={1.2} />
            <Eye x={262} y={182} r={9} look={parts.black.look} closed={shy} lineColor="#fff" delay={1.2} />
            <Mouth type={mouths.black} x={248} y={208} color="#fff" />
          </g>
        </g>
      </g>

      {/* 3. YELLOW: goli top wala pill */}
      <g className={moodClass} style={{ animationDelay: '0.3s' }}>
        <g className="ac-body" style={parts.yellow.bodyStyle}>
          <path d={`M 282 ${GROUND} V 235 A 36 36 0 0 1 354 235 V ${GROUND} Z`} fill="#f2c21b" />
          <g className="ac-face" style={parts.yellow.faceStyle}>
            <Eye x={305} y={228} r={4.5} white={false} look={parts.yellow.look} closed={shy} delay={2.1} />
            <Eye x={331} y={228} r={4.5} white={false} look={parts.yellow.look} closed={shy} delay={2.1} />
            <Mouth type={mouths.yellow} x={318} y={252} />
          </g>
        </g>
      </g>

      {/* 4. ORANGE: aadha gola (sabse aage) */}
      <g className={moodClass} style={{ animationDelay: '0s' }}>
        <g className="ac-body" style={parts.orange.bodyStyle}>
          <path d={`M 20 ${GROUND} A 110 110 0 0 1 240 ${GROUND} Z`} fill="#ff7a2f" />
          <g className="ac-face" style={parts.orange.faceStyle}>
            <Eye x={105} y={246} r={5.5} white={false} look={parts.orange.look} closed={shy} delay={3} />
            <Eye x={150} y={246} r={5.5} white={false} look={parts.orange.look} closed={shy} delay={3} />
            <Mouth type={mouths.orange} x={128} y={266} />
          </g>
        </g>
      </g>
    </svg>
  );
}
