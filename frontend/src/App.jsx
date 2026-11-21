import { useState, useEffect } from 'react';
import GameHUD from './components/hud/GameHUD';
import AdvancementToast from './components/hud/AdvancementToast';
import MinecraftVoxelWorld from './components/canvas/MinecraftVoxelWorld';
import MinecraftInventory from './components/inventory/MinecraftInventory';

// Minecraft Mod Diagnostic Screens
import ScannerMenuModal from './components/scanner/ScannerMenuModal';
import CardiacScannerModal from './components/scanner/CardiacScannerModal';
import NeuralScannerModal from './components/scanner/NeuralScannerModal';
import LabAnalyzerModal from './components/scanner/LabAnalyzerModal';
import AICoreModal from './components/scanner/AICoreModal';
import SimulationSettingsModal from './components/scanner/SimulationSettingsModal';

import { MINECRAFT_ITEMS } from './data/minecraftItems';
import { playTotemSound, playXpSound } from './utils/minecraftAudio';

function App() {
  // ========================================================
  // 1. GAMEPLAY MODALS STATE (DIEGETIC MOD LAYERS)
  // ========================================================
  const [isScannerMenuOpen, setIsScannerMenuOpen] = useState(false);
  const [isCardiacScannerOpen, setIsCardiacScannerOpen] = useState(false);
  const [isNeuralScannerOpen, setIsNeuralScannerOpen] = useState(false);
  const [isLabAnalyzerOpen, setIsLabAnalyzerOpen] = useState(false);
  const [isAICoreOpen, setIsAICoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // ========================================================
  // 2. IN-GAME VITALS & PROGRESSION
  // ========================================================
  const [gameHP, setGameHP] = useState(20); // 20 HP = 10 hearts
  const [hunger, setHunger] = useState(16); // 20 = 10 hunger icons
  const [xpLevel, setXpLevel] = useState(3);
  const [xpProgress, setXpProgress] = useState(45); // 0-100%
  const [activeAdvancement, setActiveAdvancement] = useState(null);
  const [unlockedAdvancements, setUnlockedAdvancements] = useState(new Set());

  // Physiological Vitals & Telemetry
  const [heartStatus, setHeartStatus] = useState('normal'); // 'normal' | 'poison' | 'wither' | 'absorption'
  const [heartRate, setHeartRate] = useState(75);
  const [sanityLevel, setSanityLevel] = useState(100);

  // Daily Educational Nutrition Tracking
  const [dailyCalories, setDailyCalories] = useState(1420);
  const [dailyCarbs, setDailyCarbs] = useState(180);
  const [dailyProtein, setDailyProtein] = useState(72);
  const [dailyFat, setDailyFat] = useState(54);

  // Shader & Atmosphere Effect Controls
  const [effectIntensity, setEffectIntensity] = useState('immersive'); // 'off' | 'low' | 'immersive'
  const [darknessActive, setDarknessActive] = useState(false);
  const [nauseaActive, setNauseaActive] = useState(false);
  const [horrorActive, setHorrorActive] = useState(false);

  // Environment & Sky States
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'sunset' | 'night'
  const [weather, setWeather] = useState('clear'); // 'clear' | 'rain'

  // Hotbar & Active Item (Slot 9 is the Biometric Scanner)
  const [activeHotbarIndex, setActiveHotbarIndex] = useState(0);
  const [isConsuming, setIsConsuming] = useState(false);
  const [hotbarItems, setHotbarItems] = useState([
    MINECRAFT_ITEMS.find(i => i.id === 'nether_burger') || MINECRAFT_ITEMS[0],
    MINECRAFT_ITEMS.find(i => i.id === 'redstone_energy') || MINECRAFT_ITEMS[1],
    MINECRAFT_ITEMS.find(i => i.id === 'gapple') || MINECRAFT_ITEMS[2],
    MINECRAFT_ITEMS.find(i => i.id === 'milk_bucket') || MINECRAFT_ITEMS[3],
    MINECRAFT_ITEMS.find(i => i.id === 'ender_pizza') || MINECRAFT_ITEMS[4],
    MINECRAFT_ITEMS.find(i => i.id === 'sculk_extract') || MINECRAFT_ITEMS[5],
    MINECRAFT_ITEMS.find(i => i.id === 'pufferfish_venom') || MINECRAFT_ITEMS[6],
    MINECRAFT_ITEMS.find(i => i.id === 'omega_salmon') || MINECRAFT_ITEMS[7],
    MINECRAFT_ITEMS.find(i => i.id === 'biometric_scanner') || MINECRAFT_ITEMS[MINECRAFT_ITEMS.length - 1]
  ]);

  // Active Potion Effects Stack
  const [activeEffects, setActiveEffects] = useState([
    { id: 'regen', icon: '✨', name: 'Regeneration I', duration: '3:00', type: 'regen' }
  ]);

  // ========================================================
  // 3. CLINICAL DATA & ML PREDICTION STATE
  // ========================================================
  const [cardiacData, setCardiacData] = useState({
    age: 45,
    sex: 1,
    resting_bp: 120,
    diastolic_bp: 80,
    cholesterol: 205,
    ldl: 115,
    glucose: 95,
    resting_hr: 75,
    height_cm: 175,
    weight_kg: 74,
    symptoms: [],
    smoking: false,
    physical_activity: true,
    family_history: false
  });
  const [cardiacResult, setCardiacResult] = useState(null);
  const [cardioLoading, setCardioLoading] = useState(false);

  // Neurological State
  const [neuroResult, setNeuroResult] = useState(null);
  const [neuroLoading, setNeuroLoading] = useState(false);

  // Sync heart rate with resting pulse
  useEffect(() => {
    if (cardiacData.resting_hr) {
      setHeartRate(cardiacData.resting_hr);
    }
  }, [cardiacData.resting_hr]);

  // ========================================================
  // 4. GLOBAL KEYBOARD LISTENERS (ESC, E, etc.)
  // ========================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        // Close any active modal and return immediately to the Minecraft world!
        setIsScannerMenuOpen(false);
        setIsCardiacScannerOpen(false);
        setIsNeuralScannerOpen(false);
        setIsLabAnalyzerOpen(false);
        setIsAICoreOpen(false);
        setIsSettingsOpen(false);
        setIsInventoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close all scanner modals helper
  const closeAllModals = () => {
    setIsScannerMenuOpen(false);
    setIsCardiacScannerOpen(false);
    setIsNeuralScannerOpen(false);
    setIsLabAnalyzerOpen(false);
    setIsAICoreOpen(false);
    setIsSettingsOpen(false);
    setIsInventoryOpen(false);
  };

  // Switch scanner modules
  const handleSelectScannerModule = (moduleId) => {
    setIsScannerMenuOpen(false);
    if (moduleId === 'cardio') setIsCardiacScannerOpen(true);
    else if (moduleId === 'neuro') setIsNeuralScannerOpen(true);
    else if (moduleId === 'labs') setIsLabAnalyzerOpen(true);
    else if (moduleId === 'ai_core') setIsAICoreOpen(true);
    else if (moduleId === 'settings') setIsSettingsOpen(true);
  };

  // ========================================================
  // 5. XP PROGRESSION & ADVANCEMENTS
  // ========================================================
  const triggerAdvancement = (id, icon, title, desc) => {
    if (unlockedAdvancements.has(id)) return;
    setUnlockedAdvancements(prev => new Set([...prev, id]));
    setActiveAdvancement({ icon, title, desc });
    playTotemSound();

    setTimeout(() => {
      setActiveAdvancement(null);
    }, 4500);
  };

  const handleAwardXP = (amount, reason) => {
    playXpSound();
    setXpProgress(prev => {
      const next = prev + amount * 6;
      if (next >= 100) {
        setXpLevel(lvl => lvl + 1);
        return next - 100;
      }
      return next;
    });

    if (reason === 'Completed Cardiac Scan') {
      triggerAdvancement('cardio_1', '❤️', 'Know Your Heart', 'Complete your first cardiac scan.');
    } else if (reason === 'Completed Neural Scan') {
      triggerAdvancement('neuro_1', '🧠', 'Mind Mapper', 'Complete a neurological assessment.');
    } else if (reason === 'Analyzed Lab Report') {
      triggerAdvancement('labs_1', '🧪', 'Lab Technician', 'Analyze your first medical report.');
    } else if (reason === 'Read AI Explanation') {
      triggerAdvancement('ai_1', '✨', 'Ask the Core', 'Consult the AI Core intelligence.');
    }
  };

  // Status effects management
  const addEffect = (effect) => {
    setActiveEffects(prev => {
      const filtered = prev.filter(e => e.id !== effect.id);
      return [...filtered, effect];
    });
  };

  const clearAllEffects = () => {
    setActiveEffects([]);
    setHeartStatus('normal');
    setDarknessActive(false);
    setNauseaActive(false);
    setHorrorActive(false);
    setSanityLevel(100);
  };

  const handleSetHotbarItem = (slotIndex, item) => {
    setHotbarItems(prev => {
      const copy = [...prev];
      copy[slotIndex] = item;
      return copy;
    });
    setIsInventoryOpen(false);
  };

  // ========================================================
  // 6. CONSUMPTION / NUTRITION GAME MECHANIC
  // ========================================================
  const handleConsumeItem = (item) => {
    if (!item) return;

    if (item.clearsAll) {
      clearAllEffects();
      return;
    }

    if (item.clearsDebuffs) {
      clearAllEffects();
      setHeartStatus('absorption');
      playTotemSound();
    }

    // Replenish in-game hunger
    if (item.hungerRestore) {
      setHunger(prev => Math.min(20, prev + item.hungerRestore));
    }

    // Track daily educational macros
    if (item.calories) setDailyCalories(prev => prev + item.calories);
    if (item.carbs) setDailyCarbs(prev => prev + item.carbs);
    if (item.protein) setDailyProtein(prev => prev + item.protein);
    if (item.fat) setDailyFat(prev => prev + item.fat);

    // Physiological deltas
    const updatedVitals = {
      ...cardiacData,
      cholesterol: Math.max(100, Math.min(550, (cardiacData.cholesterol || 205) + (item.cholesterolDelta || 0))),
      resting_bp: Math.max(70, Math.min(240, (cardiacData.resting_bp || 120) + (item.bpDelta || 0))),
      resting_hr: Math.max(50, Math.min(210, (cardiacData.resting_hr || 75) + (item.bpmDelta || 0))),
      glucose: item.sugarDelta !== undefined && item.sugarDelta > 0 ? (cardiacData.glucose || 95) + item.sugarDelta : (cardiacData.glucose || 95)
    };
    setCardiacData(updatedVitals);

    const newSanity = Math.max(0, Math.min(100, sanityLevel + (item.sanityDelta || 0)));
    setSanityLevel(newSanity);

    if (item.triggersDarkness || newSanity < 30) setDarknessActive(true);
    if (item.triggersNausea) setNauseaActive(true);
    if (item.triggersHorror || newSanity < 40) setHorrorActive(true);

    if (item.statusEffects && item.statusEffects.length > 0) {
      item.statusEffects.forEach(eff => addEffect(eff));
    }

    // Re-evaluate model if vitals changed
    if (item.cholesterolDelta || item.bpDelta || item.bpmDelta) {
      runCardioPrediction(updatedVitals);
    }
  };

  // ========================================================
  // 7. BACKEND PREDICTION PIPELINES
  // ========================================================
  const runCardioPrediction = async (vitals) => {
    setCardioLoading(true);
    try {
      const payload = {
        age: Number(vitals.age) || 45,
        sex: Number(vitals.sex) !== undefined ? Number(vitals.sex) : 1,
        resting_bp: Number(vitals.resting_bp) || 120,
        diastolic_bp: Number(vitals.diastolic_bp) || 80,
        cholesterol: Number(vitals.cholesterol) || 205,
        ldl: Number(vitals.ldl) || 115,
        glucose: Number(vitals.glucose) || 95,
        resting_hr: Number(vitals.resting_hr) || 75,
        height_cm: Number(vitals.height_cm) || 175,
        weight_kg: Number(vitals.weight_kg) || 74,
        symptoms: vitals.symptoms || [],
        smoking: Boolean(vitals.smoking),
        physical_activity: vitals.physical_activity !== false,
        family_history: Boolean(vitals.family_history)
      };

      const res = await fetch('http://localhost:8000/api/predict/cardio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setCardiacResult(data);

        // Feedback to heart status icon
        const pct = data.risk_percentage || 0;
        if (pct > 65 || (data.red_flag && data.red_flag.is_urgent)) {
          setHeartStatus('wither');
          addEffect({ id: 'wither_alert', icon: '💀', name: 'Wither III (Critical Risk)', duration: '2:00', type: 'wither' });
        } else if (pct > 35) {
          setHeartStatus('poison');
          addEffect({ id: 'poison_alert', icon: '🧪', name: 'Poison II (Elevated Burden)', duration: '1:30', type: 'poison' });
        } else {
          setHeartStatus(heartStatus === 'absorption' ? 'absorption' : 'normal');
        }
      } else {
        throw new Error();
      }
    } catch {
      // Offline fallback calculation
      const score = (vitals.cholesterol > 240 ? 0.35 : 0) + (vitals.resting_bp > 135 ? 0.35 : 0) + (vitals.resting_hr > 100 ? 0.2 : 0);
      const pct = Math.round(score * 100);
      setCardiacResult({
        risk_probability: score,
        risk_percentage: pct,
        risk_level: pct > 65 ? 'High' : pct > 35 ? 'Moderate' : 'Low',
        confidence_label: 'Moderate',
        confidence_score: 78,
        important_features: vitals.resting_bp > 135 ? [{ feature: 'Systolic Blood Pressure', direction: 'Elevates', value: `${vitals.resting_bp} mmHg`, reference: '< 120 mmHg' }] : [],
        protective_features: ['Regular physical activity profile'],
        model_version: 'cardio-v2.1-calibrated',
        disclaimer: 'Educational screening model only. Not a clinical diagnosis.'
      });
      if (pct > 65) setHeartStatus('wither');
      else if (pct > 35) setHeartStatus('poison');
    } finally {
      setCardioLoading(false);
    }
  };

  const runNeuroPrediction = async (neuroData) => {
    setNeuroLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/predict/neuro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(neuroData)
      });

      if (res.ok) {
        const data = await res.json();
        setNeuroResult(data);

        const concern = data.concern_index || 0;
        setSanityLevel(Math.max(10, 100 - concern));

        if (concern > 60 || (data.red_flag && data.red_flag.is_urgent)) {
          setDarknessActive(true);
          setHorrorActive(true);
          addEffect({ id: 'darkness_alert', icon: '👁️', name: 'Darkness II (Neuro Deficit)', duration: '2:30', type: 'darkness' });
        }
      }
    } catch {
      const count = (neuroData.symptoms || []).length;
      const concern = Math.min(100, count * 18 + (neuroData.severity === 'Severe' ? 30 : 15));
      setNeuroResult({
        concern_index: concern,
        concern_tier: concern > 65 ? 'High' : concern > 35 ? 'Moderate' : 'Mild',
        potential_patterns: ['Symptom clustering across evaluated neurological domains.'],
        recommendation: 'Consider clinical discussion for persistent symptoms.',
        disclaimer: 'Educational screening assessment only.'
      });
      setSanityLevel(Math.max(10, 100 - concern));
    } finally {
      setNeuroLoading(false);
    }
  };

  const handleApplyLabsToCardio = (biomarkers) => {
    setCardiacData(prev => ({
      ...prev,
      ...biomarkers
    }));
    // Open cardiac scanner to inspect with the newly applied markers
    setIsLabAnalyzerOpen(false);
    setIsCardiacScannerOpen(true);
    runCardioPrediction({ ...cardiacData, ...biomarkers });
  };

  const isCriticalHealth = cardiacResult && (cardiacResult.risk_percentage > 65 || cardiacResult.risk_score > 0.65);

  const intensityClass = `intensity-${effectIntensity}`;
  const shaderClasses = [
    intensityClass,
    darknessActive && effectIntensity !== 'off' ? 'shader-darkness-active' : '',
    nauseaActive && effectIntensity !== 'off' ? 'shader-nausea-active' : '',
    horrorActive && effectIntensity !== 'off' ? 'shader-horror-active' : '',
    isCriticalHealth && effectIntensity !== 'off' ? 'shader-critical-health' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`minecraft-shader-world ${shaderClasses}`} style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 1. Real-time 3D Minecraft Voxel Shader World (Three.js with Day/Night & Weather) */}
      <MinecraftVoxelWorld
        darknessActive={darknessActive && effectIntensity !== 'off'}
        nauseaActive={nauseaActive && effectIntensity !== 'off'}
        heartStatus={heartStatus}
        timeOfDay={timeOfDay}
        weather={weather}
        activeItem={hotbarItems[activeHotbarIndex]}
        isConsuming={isConsuming}
      />

      {/* 2. Shader Sunbeams & Vignette */}
      {effectIntensity !== 'off' && <div className="shader-godrays" aria-hidden="true" />}
      {effectIntensity !== 'off' && <div className="shader-vignette" aria-hidden="true" />}

      {/* 3. Minecraft Advancement Toast Notification */}
      <AdvancementToast 
        advancement={activeAdvancement} 
        onDismiss={() => setActiveAdvancement(null)} 
      />

      {/* 4. DEFAULT SCREEN: PURE MINECRAFT HUD (Hearts, Hunger, XP, 9-Slot Hotbar, Crosshair) */}
      <GameHUD
        gameHP={gameHP}
        hunger={hunger}
        xpLevel={xpLevel}
        xpProgress={xpProgress}
        heartStatus={heartStatus}
        heartRate={heartRate}
        sanityLevel={sanityLevel}
        hotbarItems={hotbarItems}
        activeHotbarIndex={activeHotbarIndex}
        setActiveHotbarIndex={setActiveHotbarIndex}
        isConsuming={isConsuming}
        setIsConsuming={setIsConsuming}
        onConsumeItem={handleConsumeItem}
        onOpenScanner={() => setIsScannerMenuOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        weather={weather}
        setWeather={setWeather}
        effectIntensity={effectIntensity}
        setEffectIntensity={setEffectIntensity}
        activeEffects={activeEffects}
        dailyCalories={dailyCalories}
        dailyCarbs={dailyCarbs}
        dailyProtein={dailyProtein}
        dailyFat={dailyFat}
      />

      {/* 5. MINECRAFT MOD INVENTORY (Press E) */}
      <MinecraftInventory
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        hotbarItems={hotbarItems}
        activeHotbarIndex={activeHotbarIndex}
        onSetHotbarItem={handleSetHotbarItem}
        cardiacResult={cardiacResult}
        neuroResult={neuroResult}
        activeEffects={activeEffects}
      />

      {/* 6. BIOMETRIC SCANNER MENU MODAL (Press F on Scanner) */}
      <ScannerMenuModal
        isOpen={isScannerMenuOpen}
        onClose={() => setIsScannerMenuOpen(false)}
        onSelectModule={handleSelectScannerModule}
      />

      {/* 7. CARDIAC SCANNER INTERACTION MODAL */}
      <CardiacScannerModal
        isOpen={isCardiacScannerOpen}
        onClose={() => setIsCardiacScannerOpen(false)}
        formData={cardiacData}
        setFormData={setCardiacData}
        prediction={cardiacResult}
        loading={cardioLoading}
        onSubmit={runCardioPrediction}
        onConsultAICore={() => {
          setIsCardiacScannerOpen(false);
          setIsAICoreOpen(true);
        }}
        onAwardXP={handleAwardXP}
      />

      {/* 8. NEURAL SCANNER INTERACTION MODAL */}
      <NeuralScannerModal
        isOpen={isNeuralScannerOpen}
        onClose={() => setIsNeuralScannerOpen(false)}
        neuroResult={neuroResult}
        loading={neuroLoading}
        onSubmit={runNeuroPrediction}
        onEquipSymptomAsEffect={addEffect}
        onConsultAICore={() => {
          setIsNeuralScannerOpen(false);
          setIsAICoreOpen(true);
        }}
        onAwardXP={handleAwardXP}
      />

      {/* 9. LAB ANALYZER TERMINAL MACHINE BLOCK */}
      <LabAnalyzerModal
        isOpen={isLabAnalyzerOpen}
        onClose={() => setIsLabAnalyzerOpen(false)}
        onApplyLabsToCardio={handleApplyLabsToCardio}
        onAwardXP={handleAwardXP}
      />

      {/* 10. AI CORE FLOATING BEACON ENTITY DIALOGUE */}
      <AICoreModal
        isOpen={isAICoreOpen}
        onClose={() => setIsAICoreOpen(false)}
        cardioResult={cardiacResult}
        neuroResult={neuroResult}
        cardioData={cardiacData}
        onAwardXP={handleAwardXP}
      />

      {/* 11. SIMULATION & SHADER SETTINGS MODAL */}
      <SimulationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        effectIntensity={effectIntensity}
        setEffectIntensity={setEffectIntensity}
        darknessActive={darknessActive}
        setDarknessActive={setDarknessActive}
        nauseaActive={nauseaActive}
        setNauseaActive={setNauseaActive}
        horrorActive={horrorActive}
        setHorrorActive={setHorrorActive}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        weather={weather}
        setWeather={setWeather}
      />
    </div>
  );
}

export default App;
