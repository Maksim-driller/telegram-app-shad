import { useRef, useState } from "react";
import { useAppState } from "../state/AppContext";

export default function Settings() {
  const { state, actions } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    try {
      actions.exportData();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        actions.importData(data);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (error) {
        setImportError("Неверный формат файла");
        console.error("Import failed:", error);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h1 className="h1">Настройки</h1>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <label className="label-muted">Мотивационная цитата</label>
        <input
          className="input"
          value={state.motivation.quote}
          onChange={(e) => actions.setQuote(e.target.value)}
          placeholder="Введите свою мотивационную цитату"
        />
      </div>

      <div className="card" style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div className="label-muted" style={{ marginBottom: 4 }}>
          Резервное копирование
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <button className="btn btn-primary" onClick={handleExport}>
            📥 Экспортировать данные
          </button>
          <button className="btn btn-outline" onClick={handleImport}>
            📤 Импортировать данные
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {importError && (
            <div style={{ color: "var(--danger)", fontSize: 12, padding: 8 }}>
              {importError}
            </div>
          )}
          {importSuccess && (
            <div style={{ color: "var(--primary)", fontSize: 12, padding: 8 }}>
              ✅ Данные успешно импортированы!
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
          Сохраните резервную копию на случай смены устройства или очистки
          данных
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <button className="btn btn-danger" onClick={actions.resetAll}>
          🗑️ Сбросить все данные
        </button>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
          Внимание: это действие нельзя отменить. Рекомендуем сначала
          экспортировать данные.
        </div>
      </div>
    </div>
  );
}
