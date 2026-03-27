import { useEffect, useState } from "react";

const apiBaseUrl = "http://localhost:4000/api";

const styles = [
  { value: "funny", label: "Funny" },
  { value: "emotional", label: "Emotional" },
  { value: "romantic", label: "Romantic" },
  { value: "savage", label: "Savage" },
  { value: "formal", label: "Formal" },
  { value: "dramatic", label: "Bollywood" },
  { value: "rap", label: "Rap" },
  { value: "voice", label: "Voice Script" }
];

const initialForm = {
  name: "",
  relationship: "",
  style: "funny",
  promptType: "universal",
  interests: "",
  age: "",
  useLiveAi: false
};

async function readJson(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [presets, setPresets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [presetResponse, historyResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/presets`),
          fetch(`${apiBaseUrl}/messages`)
        ]);

        const [presetData, historyData] = await Promise.all([
          readJson(presetResponse),
          readJson(historyResponse)
        ]);

        setPresets(presetData);
        setHistory(historyData);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadInitialData();
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          interests: form.interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });

      const data = await readJson(response);
      setLatestMessage(data);
      setHistory((current) => [data, ...current].slice(0, 5));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">AI Birthday Studio</p>
          <h1>Build birthday wishes that sound like they came from a real person.</h1>
          <p className="hero-text">
            Generate funny roasts, emotional notes, Bollywood drama, rap verses, and
            voice-ready scripts from one dashboard.
          </p>
        </div>
        <div className="hero-note">
          <span>Current stack</span>
          <strong>React + Express</strong>
          <span>Ready for OpenAI, MongoDB, Cron, Twilio, and voice APIs</span>
        </div>
      </section>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Create a wish</h2>
            <p>Use your upgraded prompts as structured inputs instead of one-off text.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} placeholder="Rahul" />
            </label>

            <label>
              Relationship
              <input
                name="relationship"
                value={form.relationship}
                onChange={updateField}
                placeholder="best friend"
              />
            </label>

            <label>
              Style
              <select name="style" value={form.style} onChange={updateField}>
                {styles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Prompt preset
              <select name="promptType" value={form.promptType} onChange={updateField}>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Interests
              <input
                name="interests"
                value={form.interests}
                onChange={updateField}
                placeholder="cricket, memes, bikes"
              />
            </label>

            <label>
              Age
              <input name="age" value={form.age} onChange={updateField} placeholder="25" />
            </label>

            <label className="checkbox-row">
              <input
                name="useLiveAi"
                type="checkbox"
                checked={form.useLiveAi}
                onChange={updateField}
              />
              Use live AI mode placeholder
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate birthday message"}
            </button>
          </form>

          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="panel preview-panel">
          <div className="panel-heading">
            <h2>Latest output</h2>
            <p>Preview the generated message, prompt, and provider source.</p>
          </div>

          {latestMessage ? (
            <div className="message-card">
              <span className="message-badge">{latestMessage.provider}</span>
              <p className="message-body">{latestMessage.message}</p>
              <div className="prompt-box">
                <strong>Prompt preview</strong>
                <p>{latestMessage.prompt}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Fill the form and generate your first personalized birthday message.
            </div>
          )}
        </section>

        <section className="panel history-panel">
          <div className="panel-heading">
            <h2>Recent wishes</h2>
            <p>Saved locally for now so you can compare tone and avoid repetition later.</p>
          </div>

          <div className="history-list">
            {history.length ? (
              history.map((item) => (
                <article key={item.id} className="history-item">
                  <div className="history-topline">
                    <strong>{item.name}</strong>
                    <span>
                      {item.style} · {item.relationship}
                    </span>
                  </div>
                  <p>{item.message}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">No saved wishes yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
