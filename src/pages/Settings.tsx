import { useAppState } from "../state/AppContext";

export default function Settings() {
  const { state, actions } = useAppState();
  return (
    <div>
      <h1 className="h1">Настройки</h1>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <label className="label-muted">Мотивационная цитата</label>
        <input
          className="input"
          value={state.motivation.quote}
          onChange={(e) => actions.setQuote(e.target.value)}
        />

        <button className="btn btn-outline" onClick={actions.resetAll}>
          Сбросить демо-данные
        </button>
      </div>
    </div>
  );
}
