import { useState } from 'react';
import { MINECRAFT_ITEMS } from '../../data/minecraftItems';
import { playInventoryClickSound } from '../../utils/minecraftAudio';

export default function MinecraftInventory({
  isOpen,
  onClose,
  hotbarItems,
  activeHotbarIndex,
  onSetHotbarItem,
  cardiacResult,
  neuroResult,
  activeEffects = []
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'fast_food', label: '🍔 Fast Foods' },
    { id: 'drinks', label: '🥤 Beverages' },
    { id: 'horror', label: '💀 Horror Mods' },
    { id: 'remedy', label: '🛡️ Therapeutics' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? MINECRAFT_ITEMS
    : MINECRAFT_ITEMS.filter(it => it.category === selectedCategory);

  const handleSelectItem = (item) => {
    playInventoryClickSound();
    onSetHotbarItem(activeHotbarIndex, item);
  };

  const cardioTier = cardiacResult?.risk_level || 'Normal';
  const neuroTier = neuroResult?.concern_tier || 'Normal';

  return (
    <div className="mc-modal-backdrop" onClick={onClose}>
      <div className="mc-inventory-window-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="inventory-header-bar">
          <div className="inv-title">
            <span>📦</span>
            <span>PLAYER HEALTH INVENTORY</span>
          </div>
          <button type="button" className="terminal-close-x" onClick={onClose} title="Close [ESC / E]">
            ✕
          </button>
        </div>

        {/* 3-Column Layout: Player Status Armor | 27-Slot Storage Grid | Status Effects */}
        <div className="inventory-tri-panel">
          {/* 1. Left: Player Status & Armor Slots */}
          <div className="inv-player-panel">
            <div className="inv-panel-label">PLAYER STATUS</div>

            {/* Paper Doll representation */}
            <div className="inv-paperdoll-frame">
              <div className="paperdoll-avatar">🧑‍🚀</div>
              <div className="paperdoll-subtext">Level Explorer</div>
            </div>

            {/* Armor / Clinical Status Slots */}
            <div className="inv-armor-slots">
              <div className="armor-status-slot" title="Cardiovascular Health State">
                <span className="slot-glyph">❤️</span>
                <div className="armor-text">
                  <div className="armor-name">Cardiovascular</div>
                  <div className={`armor-val val-${cardioTier.toLowerCase()}`}>{cardioTier}</div>
                </div>
              </div>

              <div className="armor-status-slot" title="Neurological Health State">
                <span className="slot-glyph">🧠</span>
                <div className="armor-text">
                  <div className="armor-name">Neurological</div>
                  <div className={`armor-val val-${neuroTier.toLowerCase()}`}>{neuroTier}</div>
                </div>
              </div>

              <div className="armor-status-slot" title="Biomarker Blood Chemistry">
                <span className="slot-glyph">🩸</span>
                <div className="armor-text">
                  <div className="armor-name">Biomarkers</div>
                  <div className="armor-val val-normal">Calibrated</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Center: 27-Slot Grid + Hotbar */}
          <div className="inv-grid-panel">
            {/* Category tabs */}
            <div className="inv-category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`inv-tab-btn ${selectedCategory === cat.id ? 'tab-active' : ''}`}
                  onClick={() => {
                    playInventoryClickSound();
                    setSelectedCategory(cat.id);
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 27-Slot Storage Grid */}
            <div className="mc-27-slot-grid">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="mc-inventory-slot"
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={item.name}
                >
                  <span className="slot-item-icon">{item.icon}</span>
                  {item.actionType === 'eat' && (
                    <span className="slot-item-stack">+{item.hungerRestore || 4}🍗</span>
                  )}
                </button>
              ))}
            </div>

            {/* Hotbar Preview Section */}
            <div className="inv-hotbar-preview-section">
              <div className="inv-hotbar-label">
                HOTBAR (Equipping to Slot {activeHotbarIndex + 1})
              </div>
              <div className="inv-hotbar-slots-row">
                {hotbarItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`inv-hotbar-mini-slot ${idx === activeHotbarIndex ? 'active-slot' : ''}`}
                  >
                    <span>{item?.icon || '▫️'}</span>
                    <span className="slot-number">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hovered Item Nutrition Tooltip */}
            {hoveredItem && (
              <div className="inv-hover-tooltip">
                <div className="hover-item-name">{hoveredItem.name}</div>
                <div className="hover-item-stats">
                  {hoveredItem.calories > 0 && <span>{hoveredItem.calories} kcal &bull; </span>}
                  {hoveredItem.hungerRestore > 0 && <span>+{hoveredItem.hungerRestore} Hunger &bull; </span>}
                  <span>{hoveredItem.clinicalNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Right: Active Status Effects */}
          <div className="inv-effects-panel">
            <div className="inv-panel-label">ACTIVE STATUS EFFECTS</div>

            {activeEffects.length === 0 ? (
              <div className="empty-effects-notice">
                No active status conditions.
              </div>
            ) : (
              <div className="inv-effects-list">
                {activeEffects.map((eff) => (
                  <div key={eff.id} className={`inv-effect-card effect-${eff.type}`}>
                    <span className="eff-icon">{eff.icon}</span>
                    <div className="eff-details">
                      <div className="eff-name">{eff.name}</div>
                      <div className="eff-timer">{eff.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="inventory-footer-bar">
          <span>Click any item to equip to Hotbar Slot {activeHotbarIndex + 1}</span>
          <span>Press [E] or [ESC] to return to world</span>
        </div>
      </div>
    </div>
  );
}
