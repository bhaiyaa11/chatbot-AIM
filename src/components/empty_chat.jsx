const EmptyChatLayout = () => {
  return (
    <div className="empty-wrapper">
      <h2>How can I help you today?</h2>

      <div className="input-row">
        <select>Clients</select>
        <select>Business Unit</select>
        <select>Video Type</select>
        <input placeholder="Send a message..." />
      </div>
    </div>
  );
};

export default EmptyChatLayout;
