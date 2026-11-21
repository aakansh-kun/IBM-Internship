import { useState, useEffect, useRef } from 'react';
import { playBiteSound, playDrinkSound, playBurpSound, playScannerPowerUpSound } from '../../utils/minecraftAudio';

export default function GameHUD({
  // Game & Health Vitals
  gameHP = 20, // 20 HP = 10 hearts
  hunger = 16, // 20 = 10 hunger chicken legs
  xpLevel = 3,
  xpProgress = 65, // percentage
  heartStatus = 'normal', // 'normal' | 'poison' | 'wither' | 'absorption'
  heartRate = 75,
  sanityLevel = 100,

  // Hotbar & Consumables
  hotbarItems = [],
  activeHotbarIndex = 0,
  setActiveHotbarIndex,
  isConsuming: isConsumingProp,
  setIsConsuming: setIsConsumingProp,
  onConsumeItem,
  onOpenScanner,
  onOpenInventory,
  onOpenSettings,

  // Environment & World state
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather,
  effectIntensity,
  setEffectIntensity,

  // Active Effects
  activeEffects = [],

  // Daily Nutrition Tracker
  dailyCalories = 1420,
  dailyCarbs = 180,
  dailyProtein = 72,
  dailyFat = 54
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [localIsConsuming, setLocalIsConsuming] = useState(false);
  const isConsuming = setIsConsumingProp ? (isConsumingProp ?? false) : localIsConsuming;
  const setIsConsuming = setIsConsumingProp || setLocalIsConsuming;
  const [crumbParticles, setCrumbParticles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [itemToast, setItemToast] = useState(null);
  const toastTimerRef = useRef(null);

  const activeItem = hotbarItems[activeHotbarIndex];
  const isScannerSelected = activeItem?.isScanner || activeItem?.id === 'biometric_scanner' || activeHotbarIndex === 8;

  // Track SHIFT key for nutrition expansion & clean mouse/window blur handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(false);
    };
    const handleClearHover = () => setHoveredIndex(null);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleClearHover);
    document.addEventListener('mouseleave', handleClearHover);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleClearHover);
      document.removeEventListener('mouseleave', handleClearHover);
    };
  }, []);

  // Keyboard shortcut listener: 1-9 for slots, F for use, E for inventory
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        setActiveHotbarIndex(idx);
        setHoveredIndex(null); // Clear any stale hovered item
        const item = hotbarItems[idx];
        if (item) {
          setItemToast(item.name);
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setItemToast(null);
          }, 1500);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        onOpenInventory();
      } else if (e.key === 'f' || e.key === 'F') {
        if (isScannerSelected) {
          playScannerPowerUpSound();
          onOpenScanner();
        } else if (activeItem) {
          handleEatOrDrink(activeItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [activeHotbarIndex, isScannerSelected, activeItem, hotbarItems, onOpenScanner, onOpenInventory, setActiveHotbarIndex]);

  // Eating / Drinking Action with Sounds and Particles
  const handleEatOrDrink = (itemToEat = activeItem) => {
    if (!itemToEat || isConsuming) return;

    if (itemToEat.isScanner) {
      playScannerPowerUpSound();
      onOpenScanner();
      return;
    }

    setIsConsuming(true);
    const isDrink = itemToEat.actionType === 'drink';

    // Play 3 bite sounds
    let bites = 0;
    const biteInterval = setInterval(() => {
      bites++;
      if (isDrink) {
        playDrinkSound(1 + bites * 0.15);
      } else {
        playBiteSound();
      }

      // Flying crumbs
      const crumbs = [...Array(6)].map(() => ({
        id: Math.random(),
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 45,
        color: isDrink ? '#00f0ff' : '#e29e58'
      }));
      setCrumbParticles(crumbs);
    }, 250);

    setTimeout(() => {
      clearInterval(biteInterval);
      setCrumbParticles([]);
      playBurpSound();
      setIsConsuming(false);

      // Trigger consumption callback
      onConsumeItem(itemToEat);

      // Float upward combat text: "+780 kcal"
      const id = Date.now();
      const calorieText = itemToEat.calories > 0 ? `+${itemToEat.calories} kcal` : itemToEat.name;
      const hungerText = itemToEat.hungerRestore > 0 ? ` (+${itemToEat.hungerRestore}🍗)` : '';
      setFloatingTexts(prev => [...prev, { id, text: `${calorieText}${hungerText}` }]);

      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2500);
    }, 1000);
  };

  // Heart rendering
  const getHeartIcon = () => {
    if (heartStatus === 'wither') return '🖤';
    if (heartStatus === 'poison') return '💚';
    if (heartStatus === 'absorption') return '💛';
    return '❤️';
  };

  const getHeartClass = () => {
    let cls = 'mc-heart ';
    if (heartRate > 100) cls += 'heart-fast-beating ';
    else cls += 'heart-beating ';
    if (heartStatus === 'poison' || heartStatus === 'wither') cls += 'heart-shaking ';
    return cls;
  };

  const hoveredItem = hoveredIndex !== null ? hotbarItems[hoveredIndex] : null;

  return (
    <div className="gameplay-hud-root">
      {/* ========================================== */}
      {/* TOP LEFT: World & Atmosphere Quick Badges  */}
      {/* ========================================== */}
      <div className="top-hud-left-badges">
        <button
          type="button"
          className="hud-mini-badge"
          onClick={() => setTimeOfDay(timeOfDay === 'day' ? 'sunset' : timeOfDay === 'sunset' ? 'night' : 'day')}
          title="Time: Day / Sunset / Night"
        >
          <span>{timeOfDay === 'day' ? '☀️ Day' : timeOfDay === 'sunset' ? '🌅 Sunset' : '🌙 Night'}</span>
        </button>

        <button
          type="button"
          className="hud-mini-badge"
          onClick={() => setWeather(weather === 'clear' ? 'rain' : 'clear')}
          title="Weather: Clear / Rain"
        >
          <span>{weather === 'clear' ? '☁️ Clear' : '🌧️ Rain'}</span>
        </button>

        <button
          type="button"
          className="hud-mini-badge badge-clickable"
          onClick={onOpenSettings}
          title="Open Simulation Settings"
        >
          <span>✨ {effectIntensity.toUpperCase()}</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TOP CENTER: 🧠 NEURAL COHERENCE BOSS BAR    */}
      {/* ========================================== */}
      <div className="top-hud-center-bossbar">
        <div className="bossbar-header-row">
          <span className="bossbar-glyph-title">🧠 NEURAL COHERENCE</span>
          <span className="bossbar-percentage">{Math.round(sanityLevel)}%</span>
        </div>
        <div className="bossbar-track">
          <div 
            className="bossbar-fill"
            style={{
              width: `${Math.max(5, Math.min(100, sanityLevel))}%`,
              background: sanityLevel < 40 
                ? 'linear-gradient(90deg, #ef4444, #9333ea)' 
                : 'linear-gradient(90deg, #8b5cf6, #00f0ff)'
            }}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* TOP RIGHT: Privacy & Status Effects Stack  */}
      {/* ========================================== */}
      <div className="top-hud-right-stack">
        <div className="hud-privacy-indicator">
          <span className="privacy-beacon-dot" />
          <span>● PRIVATE SESSION</span>
        </div>

        {/* Status Effects / Symptoms as Potion Badges */}
        {activeEffects.length > 0 && (
          <div className="hud-status-effects-column">
            {activeEffects.map((eff) => (
              <div key={eff.id} className={`hud-potion-badge effect-${eff.type}`}>
                <span className="potion-icon">{eff.icon}</span>
                <div className="potion-text">
                  <div className="potion-name">{eff.name}</div>
                  <div className="potion-timer">{eff.duration}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* CENTER: Dynamic In-Game Crosshair          */}
      {/* ========================================== */}
      <div className="game-center-crosshair">
        {isScannerSelected ? (
          <div 
            className="crosshair-scanner-mode" 
            onClick={() => {
              playScannerPowerUpSound();
              onOpenScanner();
            }}
            title="Press [F] or Click to Target Self"
          >
            <span className="scanner-diamond">◇</span>
            <span className="scanner-prompt">TARGET SELF [F]</span>
          </div>
        ) : (
          <div className="crosshair-default">+</div>
        )}
      </div>

      {/* ========================================== */}
      {/* FLOATING COMBAT TEXT & CRUMB PARTICLES     */}
      {/* ========================================== */}
      <div className="floating-combat-container" aria-hidden="true">
        {floatingTexts.map(item => (
          <div key={item.id} className="floating-combat-pill">
            {item.text}
          </div>
        ))}
      </div>

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

      {/* ========================================== */}
      {/* BOTTOM HUD: Hearts, XP, Hunger, Hotbar     */}
      {/* ========================================== */}
      <div className="game-bottom-hud-container" onMouseLeave={() => setHoveredIndex(null)}>
        {/* Minecraft Item Tooltip: ONLY when cursor is actively hovering a hotbar slot */}
        {hoveredItem ? (
          <div 
            className="minecraft-item-tooltip"
            style={{
              left: `calc(50% - 216px + ${hoveredIndex * 48 + 24}px)`
            }}
          >
            <div className="tooltip-item-title">{hoveredItem.name}</div>
            
            {hoveredItem.isScanner ? (
              <div className="tooltip-scanner-info">
                <span>Diagnostic Array &bull; Press [F] or Right-Click to Scan</span>
              </div>
            ) : isShiftHeld ? (
              /* DETAILED NUTRITION TOOLTIP (ON SHIFT) */
              <div className="tooltip-nutrition-expanded">
                <div className="nutrition-calories-row">
                  <span>Calories:</span>
                  <span className="val-cal">{hoveredItem.calories} kcal</span>
                </div>
                <div className="nutrition-macros-row">
                  <span>Protein: {hoveredItem.protein || 0}g</span>
                  <span>Carbs: {hoveredItem.carbs || 0}g</span>
                  <span>Fat: {hoveredItem.fat || 0}g</span>
                </div>
                {hoveredItem.saturatedFatWarning && (
                  <div className="nutrition-warning-badge">
                    ⚠ High saturated fat &bull; frequent intake may impact CVD factors
                  </div>
                )}
                <div className="nutrition-daily-summary">
                  Daily Intake: {dailyCalories} / 2200 kcal
                </div>
              </div>
            ) : (
              /* COMPACT TOOLTIP */
              <div className="tooltip-compact-info">
                {hoveredItem.hungerRestore > 0 && (
                  <span className="tooltip-hunger-val">+{hoveredItem.hungerRestore} Hunger &bull; </span>
                )}
                <span>{hoveredItem.calories > 0 ? `${hoveredItem.calories} kcal` : ''}</span>
                <div className="tooltip-shift-prompt">Hold [SHIFT] for detailed nutrition</div>
                <div className="tooltip-item-action">
                  {isConsuming ? 'Eating...' : 'Click or press [F] to consume'}
                </div>
              </div>
            )}
          </div>
        ) : itemToast ? (
          /* BRIEF ITEM NAME TOAST (ON NUMBER SELECTION) */
          <div className="minecraft-item-name-toast">
            {itemToast}
          </div>
        ) : null}

        {/* Vitals Row: 10 Hearts & 10 Hunger */}
        <div className="hud-vitals-row">
          {/* 10 Hearts (Game Health) */}
          <div className="hearts-container" title={`Vitals Condition: ${heartStatus} | Rate: ${heartRate} BPM`}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className={getHeartClass()}>
                {getHeartIcon()}
              </span>
            ))}
          </div>

          {/* 10 Hunger Icons (Cellular Nutrition / Game Hunger) */}
          <div className="hunger-container" title={`Hunger: ${hunger} / 20`}>
            {[...Array(10)].map((_, i) => {
              const isFull = i < Math.floor(hunger / 2);
              return (
                <span key={i} className={`mc-hunger ${isFull ? 'hunger-full' : 'hunger-empty'}`}>
                  🍗
                </span>
              );
            })}
          </div>
        </div>

        {/* Experience Bar & Level */}
        <div className="hud-exp-row">
          <span className="exp-level-badge">{xpLevel}</span>
          <div className="exp-bar-frame">
            <div 
              className="exp-bar-fill" 
              style={{ width: `${Math.min(100, xpProgress)}%` }} 
            />
          </div>
        </div>

        {/* 9 Hotbar Slots */}
        <div 
          className="hud-hotbar-frame" 
          role="toolbar" 
          aria-label="Inventory Hotbar"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hotbarItems.map((item, index) => {
            const isSelected = activeHotbarIndex === index;
            return (
              <button
                type="button"
                key={index}
                className={`hotbar-slot-btn ${isSelected ? 'slot-selected' : ''} ${item?.isScanner ? 'slot-scanner' : ''}`}
                onClick={() => {
                  setHoveredIndex(null);
                  if (isSelected) {
                    if (item?.isScanner) {
                      playScannerPowerUpSound();
                      onOpenScanner();
                    } else if (item) {
                      handleEatOrDrink(item);
                    }
                  } else {
                    setActiveHotbarIndex(index);
                    if (item) {
                      setItemToast(item.name);
                      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                      toastTimerRef.current = setTimeout(() => {
                        setItemToast(null);
                      }, 1500);
                    }
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setHoveredIndex(null);
                  setActiveHotbarIndex(index);
                  if (item) {
                    setItemToast(item.name);
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    toastTimerRef.current = setTimeout(() => {
                      setItemToast(null);
                    }, 1500);
                  }
                  if (item?.isScanner) {
                    playScannerPowerUpSound();
                    onOpenScanner();
                  } else if (item) {
                    handleEatOrDrink(item);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="hotbar-slot-icon">{item?.icon || '▫️'}</span>
                <span className="hotbar-slot-num">{index + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
