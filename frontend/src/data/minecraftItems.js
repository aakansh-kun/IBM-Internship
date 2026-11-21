// Minecraft Item Registry with Clinical Nutritional & Neurological Metadata

export const MINECRAFT_ITEMS = [
  // ==========================================
  // 1. FAST FOODS & HYPER-PALATABLE JUNK FOODS
  // ==========================================
  {
    id: 'nether_burger',
    name: 'Nether Bacon Smash Burger',
    icon: '🍔',
    category: 'fast_food',
    actionType: 'eat',
    hungerRestore: 8,
    saturation: 2.5,
    calories: 780,
    protein: 34,
    fat: 48,
    carbs: 61,
    saturatedFatWarning: true,
    cholesterolDelta: +38,
    bpDelta: +16,
    bpmDelta: +8,
    sugarDelta: 0,
    sanityDelta: +5,
    statusEffects: [
      { id: 'slowness_fat', icon: '🐌', name: 'Lipid Lethargy', duration: '1:30', type: 'wither' }
    ],
    clinicalNote: 'High saturated fatty acid burden. Frequent long-term intake may elevate cardiovascular risk factors.'
  },
  {
    id: 'blaze_chicken',
    name: 'Deep-Fried Blaze Chicken',
    icon: '🍗',
    category: 'fast_food',
    actionType: 'eat',
    hungerRestore: 6,
    saturation: 2.0,
    calories: 620,
    protein: 38,
    fat: 36,
    carbs: 28,
    saturatedFatWarning: true,
    cholesterolDelta: +28,
    bpDelta: +12,
    bpmDelta: +6,
    sugarDelta: 0,
    sanityDelta: +4,
    statusEffects: [
      { id: 'hypertension_blaze', icon: '🔥', name: 'Arterial Friction', duration: '1:00', type: 'wither' }
    ],
    clinicalNote: 'Fried lipids induce acute vascular resistance and mild oxidative stress.'
  },
  {
    id: 'ender_pizza',
    name: 'Double Cheese Ender Pizza',
    icon: '🍕',
    category: 'fast_food',
    actionType: 'eat',
    hungerRestore: 8,
    saturation: 3.0,
    calories: 840,
    protein: 32,
    fat: 46,
    carbs: 85,
    saturatedFatWarning: true,
    cholesterolDelta: +42,
    bpDelta: +18,
    bpmDelta: +5,
    sugarDelta: 1,
    sanityDelta: +6,
    statusEffects: [
      { id: 'fatty_plaque', icon: '🧀', name: 'Hypercholesterolemia', duration: '2:00', type: 'wither' }
    ],
    clinicalNote: 'Excess sodium and saturated dairy lipids induce systemic hypertensive load.'
  },
  {
    id: 'glazed_donut',
    name: 'Chorus Sugar Glazed Donut',
    icon: '🍩',
    category: 'fast_food',
    actionType: 'eat',
    hungerRestore: 4,
    saturation: 1.0,
    calories: 390,
    protein: 5,
    fat: 20,
    carbs: 52,
    cholesterolDelta: +14,
    bpDelta: +6,
    bpmDelta: +12,
    sugarDelta: 1,
    sanityDelta: +8,
    statusEffects: [
      { id: 'glucose_spike', icon: '⚡', name: 'Hyperglycemic Rush', duration: '1:15', type: 'regen' }
    ],
    clinicalNote: 'Refined sucrose creates rapid glycemic surge (fasting glucose transient spike).'
  },
  {
    id: 'golden_cookie',
    name: 'High-Fructose Cookie Batch',
    icon: '🍪',
    category: 'fast_food',
    actionType: 'eat',
    hungerRestore: 3,
    saturation: 0.8,
    calories: 340,
    protein: 4,
    fat: 16,
    carbs: 48,
    cholesterolDelta: +12,
    bpDelta: +4,
    bpmDelta: +10,
    sugarDelta: 1,
    sanityDelta: +5,
    statusEffects: [],
    clinicalNote: 'Empty carbohydrate density triggers arterial inflammation.'
  },

  // ==========================================
  // 2. BEVERAGES & ENERGY DRINKS
  // ==========================================
  {
    id: 'redstone_energy',
    name: 'Overclocked Redstone Energy Drink',
    icon: '⚡',
    category: 'drinks',
    actionType: 'drink',
    hungerRestore: 2,
    saturation: 0.5,
    calories: 180,
    protein: 1,
    fat: 0,
    carbs: 42,
    cholesterolDelta: 0,
    bpDelta: +22, // Acute vasoconstriction
    bpmDelta: +28, // Sympathetic overdrive (tachycardia)
    sugarDelta: 1,
    sanityDelta: -10,
    statusEffects: [
      { id: 'tachycardia', icon: '💓', name: 'Sinus Tachycardia (HR > 100)', duration: '1:30', type: 'poison' },
      { id: 'haste', icon: '⚡', name: 'Haste II', duration: '2:00', type: 'regen' }
    ],
    clinicalNote: 'High caffeine (250mg) + taurine induces acute adrenergic surge and elevated diastolic BP.'
  },
  {
    id: 'suspicious_boba',
    name: 'Ender Pearl Boba Tea',
    icon: '🧋',
    category: 'drinks',
    actionType: 'drink',
    hungerRestore: 4,
    saturation: 1.2,
    calories: 420,
    protein: 3,
    fat: 12,
    carbs: 76,
    cholesterolDelta: +8,
    bpDelta: +8,
    bpmDelta: +14,
    sugarDelta: 1,
    sanityDelta: +12,
    statusEffects: [
      { id: 'sugar_rush', icon: '✨', name: 'Glucose Overdrive', duration: '1:00', type: 'regen' }
    ],
    clinicalNote: 'Excess tapioca starch and fructose syrup creates extreme glycemic index load.'
  },
  {
    id: 'creeper_soda',
    name: 'Fizzing Creeper Green Soda',
    icon: '🥤',
    category: 'drinks',
    actionType: 'drink',
    hungerRestore: 2,
    saturation: 0.4,
    calories: 210,
    protein: 0,
    fat: 0,
    carbs: 54,
    cholesterolDelta: 0,
    bpDelta: +10,
    bpmDelta: +8,
    sugarDelta: 1,
    sanityDelta: +5,
    statusEffects: [],
    clinicalNote: 'Phosphoric acid and synthetic flavorings burden renal filtration.'
  },

  // ==========================================
  // 3. HORROR SUBSTANCES & MODDED DRUGS
  // ==========================================
  {
    id: 'sculk_extract',
    name: 'Distilled Sculk Shrieker Toxin',
    icon: '🫐',
    category: 'horror',
    actionType: 'drink',
    hungerRestore: 1,
    saturation: 0.1,
    calories: 40,
    protein: 0,
    fat: 0,
    carbs: 8,
    cholesterolDelta: +15,
    bpDelta: +35, // Hypertensive emergency
    bpmDelta: +45, // Severe palpitation / Panic tachycardia
    sugarDelta: 0,
    sanityDelta: -45, // Plummets sanity into Warden state
    triggersDarkness: true,
    triggersHorror: true,
    statusEffects: [
      { id: 'warden_darkness', icon: '👁️', name: 'Darkness III (Sculk Blindness)', duration: '0:45', type: 'darkness' },
      { id: 'acute_panic', icon: '😱', name: 'Cardiogenic Panic Attack', duration: '1:00', type: 'wither' }
    ],
    clinicalNote: 'Psychoactive neurotoxin inducing profound visual field darkness and severe sinus tachycardia.'
  },
  {
    id: 'pufferfish_venom',
    name: 'Concentrated Tetrodotoxin Brew',
    icon: '🐡',
    category: 'horror',
    actionType: 'drink',
    hungerRestore: 0,
    saturation: 0.0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    cholesterolDelta: 0,
    bpDelta: -25, // Hypotension collapse
    bpmDelta: -20, // Severe bradycardia
    sugarDelta: 0,
    sanityDelta: -30,
    triggersNausea: true,
    statusEffects: [
      { id: 'nausea_iv', icon: '🌀', name: 'Nausea IV (Wobble Shader)', duration: '0:35', type: 'poison' },
      { id: 'paralysis_mild', icon: '⚡', name: 'Neuromuscular Blockade', duration: '0:45', type: 'wither' }
    ],
    clinicalNote: 'Voltage-gated sodium channel inhibitor producing severe sensory paresthesia and vertigo.'
  },
  {
    id: 'void_essence',
    name: 'Bottled Void Essence',
    icon: '🔮',
    category: 'horror',
    actionType: 'drink',
    hungerRestore: 0,
    saturation: 0.0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    cholesterolDelta: +20,
    bpDelta: +30,
    bpmDelta: +35,
    sugarDelta: 0,
    sanityDelta: -55,
    triggersDarkness: true,
    triggersHorror: true,
    triggersNausea: true,
    statusEffects: [
      { id: 'wither_iv', icon: '💀', name: 'Wither IV (Cellular Necrosis)', duration: '0:30', type: 'wither' },
      { id: 'insanity', icon: '🌀', name: 'Neural Collapse', duration: '1:00', type: 'darkness' }
    ],
    clinicalNote: 'Severe multimodal neurological distress: Triggers migraine distortion and sculk pulses.'
  },

  // ==========================================
  // 4. CLINICAL REMEDIES & CARDIOPROTECTIVE FOODS
  // ==========================================
  {
    id: 'gapple',
    name: 'Enchanted Golden Apple',
    icon: '🍏',
    category: 'remedy',
    actionType: 'eat',
    hungerRestore: 4,
    saturation: 9.6,
    calories: 120,
    protein: 1,
    fat: 0,
    carbs: 30,
    cholesterolDelta: -45, // Drastic plaque reduction
    bpDelta: -20, // Normalizes BP
    bpmDelta: -15, // Calms heart rate
    sugarDelta: 0,
    sanityDelta: +50,
    clearsDebuffs: true,
    statusEffects: [
      { id: 'absorption_iv', icon: '💛', name: 'Absorption IV (Arterial Shield)', duration: '4:00', type: 'regen' },
      { id: 'regen_ii', icon: '✨', name: 'Regeneration II', duration: '2:00', type: 'regen' }
    ],
    clinicalNote: 'Potent cellular antioxidant matrix reversing acute oxidative stress and endothelial burden.'
  },
  {
    id: 'omega_salmon',
    name: 'Pan-Seared Omega-3 Salmon',
    icon: '🐟',
    category: 'remedy',
    actionType: 'eat',
    hungerRestore: 6,
    saturation: 9.6,
    calories: 320,
    protein: 34,
    fat: 18,
    carbs: 0,
    cholesterolDelta: -22,
    bpDelta: -8,
    bpmDelta: -4,
    sugarDelta: 0,
    sanityDelta: +15,
    statusEffects: [
      { id: 'cardio_protective', icon: '❤️', name: 'Endothelial Protection', duration: '3:00', type: 'regen' }
    ],
    clinicalNote: 'Rich in EPA/DHA fatty acids that downregulate hepatic triglyceride synthesis.'
  },
  {
    id: 'milk_bucket',
    name: 'Fresh Cow Milk Bucket',
    icon: '🥛',
    category: 'remedy',
    actionType: 'drink',
    hungerRestore: 3,
    saturation: 1.5,
    calories: 150,
    protein: 8,
    fat: 8,
    carbs: 12,
    cholesterolDelta: 0,
    bpDelta: -5,
    bpmDelta: -6,
    sugarDelta: 0,
    sanityDelta: +30,
    clearsAll: true,
    statusEffects: [],
    clinicalNote: 'Universal hepatic detoxification: Clears all active potion effects, Nausea, and Darkness.'
  },
  {
    id: 'nitroglycerin_potion',
    name: 'Sublingual Nitroglycerin Potion',
    icon: '🧪',
    category: 'remedy',
    actionType: 'drink',
    hungerRestore: 0,
    saturation: 0.0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    cholesterolDelta: 0,
    bpDelta: -30, // Direct vasodilator
    bpmDelta: -10,
    sugarDelta: 0,
    sanityDelta: +20,
    statusEffects: [
      { id: 'coronary_vasodilation', icon: '🩺', name: 'Coronary Vasodilation', duration: '2:00', type: 'regen' }
    ],
    clinicalNote: 'Releases nitric oxide in vascular smooth muscle, relieving myocardial ischemic angina.'
  },

  // ==========================================
  // 5. ESSENTIAL BIOMETRIC SCANNER TOOL (SLOT 9)
  // ==========================================
  {
    id: 'biometric_scanner',
    name: 'Biometric Scanner',
    icon: '🔬',
    category: 'tool',
    actionType: 'scan',
    hungerRestore: 0,
    saturation: 0.0,
    calories: 0,
    isScanner: true,
    clinicalNote: 'Holographic scanner array. Press [F] or Right-Click to open diagnostic HUD.'
  }
];
