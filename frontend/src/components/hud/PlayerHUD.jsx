import { useState, useEffect } from 'react';
import { playBiteSound, playDrinkSound, playBurpSound } from '../../utils/minecraftAudio';

export default function PlayerHUD({
  heartStatus = 'normal',
  heartRate = 75,
  activeEffects = [],
  hotbarItems = [],
  activeHotbarIndex = 0,
  setActiveHotbarIndex,
  onConsumeItem,
  onOpenInventory
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isConsuming, setIsConsuming] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [crumbParticles, setCrumbParticles] = useState([]);

  const activeItem = hotbarItems[activeHotbarIndex];

  // Determine heart icon & CSS classes
  const getHeartIcon = () => {
    if (heartStatus === 'wither') return '🖤';
    if (heartStatus === 'poison') return '💚';
    if (heartStatus === 'absorption') return '💛';
    return '❤️';
  };

  const getHeartClass = () => {
    let classes = 'mc-heart ';
    if (heartRate > 100) {
      classes += 'heart-fast-beating ';
    } else {
      classes += 'heart-beating ';
    }
    if (heartStatus === 'poison' || heartStatus === 'wither') {
      classes += 'heart-shaking ';
    }
    return classes;
  };

  // Eating / Drinking Action with Sounds and Particles
  const handleEatOrDrink = (itemToEat = activeItem) => {
    if (!itemToEat || isConsuming) return;

    setIsConsuming(true);
    const isDrink = itemToEat.actionType === 'drink';

    // Play 3 crunch / glug sounds
    let bites = 0;
    const biteInterval = setInterval(() => {
      bites++;
      if (isDrink) {
        playDrinkSound(1 + bites * 0.15);
      } else {
        playBiteSound();
      }

      // Spawn flying crumbs
      const newCrumbs = [...Array(5)].map(() => ({
        id: Math.random(),
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 45,
        color: isDrink ? '#00f0ff' : '#d49b6a'
      }));
      setCrumbParticles(newCrumbs);
    }, 260);

    // Finish eating after 1s
    setTimeout(() => {
      clearInterval(biteInterval);
      setCrumbParticles([]);
      playBurpSound();
      setIsConsuming(false);

      // Trigger metabolic effect
      onConsumeItem(itemToEat);

      // Floating combat delta notification
      const deltas = [];
      if (itemToEat.cholesterolDelta) {
        deltas.push(`${itemToEat.cholesterolDelta > 0 ? '+' : ''}${itemToEat.cholesterolDelta} Chol`);
      }
      if (itemToEat.bpDelta) {
        deltas.push(`${itemToEat.bpDelta > 0 ? '+' : ''}${itemToEat.bpDelta} BP`);
      }
      if (itemToEat.bpmDelta) {
        deltas.push(`${itemToEat.bpmDelta > 0 ? '+' : ''}${itemToEat.bpmDelta} BPM`);
      }
      if (itemToEat.sanityDelta) {
        deltas.push(`${itemToEat.sanityDelta > 0 ? '+' : ''}${itemToEat.sanityDelta}% Sanity`);
      }

      const text = `${itemToEat.name}: ${deltas.join(' • ')}`;
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, text }]);

      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2500);
    }, 1000);
  };

  // Keyboard shortcut: Press 'E' to open inventory, '1'-'9' to select slot, 'Space' or 'F' to consume
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'e' || e.key === 'E') {
        onOpenInventory();
      } else if (e.key >= '1' && e.key <= '9') {
        setActiveHotbarIndex(parseInt(e.key, 10) - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        handleEatOrDrink();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenInventory, setActiveHotbarIndex, activeItem, isConsuming]);

  const displayedTooltipItem = hoveredIndex !== null ? hotbarItems[hoveredIndex] : activeItem;
  const displayedTooltipIndex = hoveredIndex !== null ? hoveredIndex : activeHotbarIndex;

  return (
    <>
      {/* Floating Nutrition/Disease Combat Text */}
      <div className="floating-combat-container" aria-hidden="true">
        {floatingTexts.map(item => (
          <div key={item.id} className="floating-combat-pill">
            {item.text}
          </div>
        ))}
      </div>

      {/* Eating/Drinking Crumb Particle Emitter */}
      {crumbParticles.length > 0 && (
        <div className="eating-crumb-emitter" aria-hidden="true">
          {crumbParticles.map(c => (
            <div
              key={c.id}
              className="crumb-particle"
              style={{
                transform: `translate(${c.x}px, ${c.y}px)`,
                backgroundColor: c.color
              }}
            />
          ))}
        </div>
      )}

      {/* Top Right Status Effects Stack (Mini badges) */}
      {activeEffects.length > 0 && (
        <aside className="hud-status-effects" aria-label="Active Status Effects">
          {activeEffects.map((eff) => (
            <div key={eff.id} className={`effect-badge effect-${eff.type}`}>
              <span className="effect-icon-box">{eff.icon}</span>
              <div className="effect-info">
                <span className="effect-name">{eff.name}</span>
                <span className="effect-timer">{eff.duration}</span>
              </div>
            </div>
          ))}
        </aside>
      )}

      {/* Fixed Bottom HUD: Hearts, Armor, Level, and 9-Slot Hotbar */}
      <div className="minimal-game-hud">
        {/* Minecraft-Style Hover/Selection Tooltip ABOVE Hotbar */}
        {displayedTooltipItem && (
          <div 
            className="minecraft-item-tooltip"
            style={{
              left: `calc(50% - 210px + ${displayedTooltipIndex * 46 + 23}px)`
            }}
          >
            <div className="tooltip-item-title">{displayedTooltipItem.name}</div>
            <div className="tooltip-item-meta">
              {displayedTooltipItem.calories} kcal &bull; {displayedTooltipItem.clinicalNote}
            </div>
            <div className="tooltip-item-action">
              {isConsuming ? 'Consuming...' : 'Click slot or press [F] to consume'}
            </div>
          </div>
        )}

        {/* Vitals Row: 10 Hearts & 10 Hunger (Scaled down by 15%) */}
        <div className="hud-vitals-row">
          <div className="hearts-container" title={`Vitals Condition: ${heartStatus} | Rate: ${heartRate} BPM`}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className={getHeartClass()}>
                {getHeartIcon()}
              </span>
            ))}
          </div>

          <div className="hunger-container" title="Cellular Nutrition">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mc-hunger">🍗</span>
            ))}
          </div>
        </div>

        {/* Experience Bar & Heart Rate Number */}
        <div className="hud-exp-row">
          <span className="exp-level-badge">{Math.round(heartRate)}</span>
          <div className="exp-bar-frame">
            <div 
              className="exp-bar-fill" 
              style={{ width: `${Math.min(100, (heartRate / 180) * 100)}%` }} 
            />
          </div>
        </div>

        {/* 9 Hotbar Slots (~420px max width) */}
        <div className="hud-hotbar-frame" role="toolbar" aria-label="Inventory Hotbar">
          {hotbarItems.map((item, index) => {
            const isSelected = activeHotbarIndex === index;
            return (
              <button
                type="button"
                key={index}
                className={`hotbar-slot-btn ${isSelected ? 'slot-selected' : ''}`}
                onClick={() => {
                  if (isSelected && item) {
                    handleEatOrDrink(item);
                  } else {
                    setActiveHotbarIndex(index);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveHotbarIndex(index);
                  if (item) handleEatOrDrink(item);
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                title={item ? `${item.name} (${item.calories} kcal)` : 'Empty slot'}
              >
                <span className="hotbar-slot-icon">{item?.icon || '▫️'}</span>
                <span className="hotbar-slot-num">{index + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
