export default function AdvancementToast({ advancement, onDismiss }) {
  if (!advancement) return null;

  return (
    <div className="mc-advancement-toast" role="alert" onClick={onDismiss}>
      <div className="advancement-icon-box">{advancement.icon || '🏆'}</div>
      <div className="advancement-text-box">
        <div className="advancement-headline">ADVANCEMENT MADE!</div>
        <div className="advancement-title">{advancement.title}</div>
        <div className="advancement-desc">{advancement.desc}</div>
      </div>
    </div>
  );
}
