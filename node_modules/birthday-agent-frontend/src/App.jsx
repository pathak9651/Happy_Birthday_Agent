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

const deliveryChannels = [
  { value: "in_app", label: "In app only" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" }
];

const initialWishForm = {
  name: "",
  relationship: "",
  style: "funny",
  promptType: "universal",
  interests: "",
  age: "",
  useLiveAi: false
};

const initialScheduleForm = {
  scheduledFor: "",
  deliveryChannel: "in_app",
  recipientEmail: "",
  recipientPhone: ""
};

async function readJson(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function formatScheduleTime(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatDeliveryLabel(channel) {
  const item = deliveryChannels.find((entry) => entry.value === channel);
  return item ? item.label : channel;
}

export default function App() {
  const [wishForm, setWishForm] = useState(initialWishForm);
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [presets, setPresets] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [presetResponse, historyResponse, schedulesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/presets`),
          fetch(`${apiBaseUrl}/messages`),
          fetch(`${apiBaseUrl}/schedules`)
        ]);

        const [presetData, historyData, schedulesData] = await Promise.all([
          readJson(presetResponse),
          readJson(historyResponse),
          readJson(schedulesResponse)
        ]);

        setPresets(presetData);
        setHistory(historyData);
        setSchedules(schedulesData);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadInitialData();
  }, []);

  function updateWishField(event) {
    const { name, value, type, checked } = event.target;
    setWishForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function updateScheduleField(event) {
    const { name, value } = event.target;
    setScheduleForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function buildWishPayload() {
    return {
      ...wishForm,
      interests: wishForm.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };
  }

  async function handleWishSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildWishPayload())
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

  async function handleScheduleSubmit(event) {
    event.preventDefault();
    setScheduleLoading(true);
    setScheduleError("");
    setScheduleSuccess("");

    try {
      const response = await fetch(`${apiBaseUrl}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...buildWishPayload(),
          ...scheduleForm,
          scheduledFor: new Date(scheduleForm.scheduledFor).toISOString()
        })
      });

      const data = await readJson(response);
      setSchedules((current) => [...current, data].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)));
      setScheduleSuccess(
        `Scheduled ${data.name}'s birthday wish for ${formatScheduleTime(data.scheduledFor)} via ${formatDeliveryLabel(data.deliveryChannel)}.`
      );
      setScheduleForm(initialScheduleForm);
    } catch (requestError) {
      setScheduleError(requestError.message);
    } finally {
      setScheduleLoading(false);
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
          <span>Ready for Gemini, MongoDB, Email, Twilio, and voice APIs</span>
        </div>
      </section>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Create a wish</h2>
            <p>Use your upgraded prompts as structured inputs instead of one-off text.</p>
          </div>

          <form className="form-grid" onSubmit={handleWishSubmit}>
            <label>
              Name
              <input
                name="name"
                value={wishForm.name}
                onChange={updateWishField}
                placeholder="Rahul"
              />
            </label>

            <label>
              Relationship
              <input
                name="relationship"
                value={wishForm.relationship}
                onChange={updateWishField}
                placeholder="best friend"
              />
            </label>

            <label>
              Style
              <select name="style" value={wishForm.style} onChange={updateWishField}>
                {styles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Prompt preset
              <select name="promptType" value={wishForm.promptType} onChange={updateWishField}>
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
                value={wishForm.interests}
                onChange={updateWishField}
                placeholder="cricket, memes, bikes"
              />
            </label>

            <label>
              Age
              <input name="age" value={wishForm.age} onChange={updateWishField} placeholder="25" />
            </label>

            <label className="checkbox-row">
              <input
                name="useLiveAi"
                type="checkbox"
                checked={wishForm.useLiveAi}
                onChange={updateWishField}
              />
              Use Gemini live generation
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

        <section className="panel schedule-panel">
          <div className="panel-heading">
            <h2>Schedule a wish</h2>
            <p>Reuse the current recipient details, choose a channel, and let the backend send it automatically.</p>
          </div>

          <form className="form-grid" onSubmit={handleScheduleSubmit}>
            <label>
              Scheduled time
              <input
                type="datetime-local"
                name="scheduledFor"
                value={scheduleForm.scheduledFor}
                onChange={updateScheduleField}
              />
            </label>

            <label>
              Delivery channel
              <select
                name="deliveryChannel"
                value={scheduleForm.deliveryChannel}
                onChange={updateScheduleField}
              >
                {deliveryChannels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </label>

            {scheduleForm.deliveryChannel === "email" ? (
              <label>
                Recipient email
                <input
                  name="recipientEmail"
                  value={scheduleForm.recipientEmail}
                  onChange={updateScheduleField}
                  placeholder="friend@example.com"
                />
              </label>
            ) : null}

            {scheduleForm.deliveryChannel === "sms" || scheduleForm.deliveryChannel === "whatsapp" ? (
              <label>
                Recipient phone
                <input
                  name="recipientPhone"
                  value={scheduleForm.recipientPhone}
                  onChange={updateScheduleField}
                  placeholder="+919876543210"
                />
              </label>
            ) : null}

            <button type="submit" disabled={scheduleLoading}>
              {scheduleLoading ? "Scheduling..." : "Save scheduled wish"}
            </button>
          </form>

          {scheduleSuccess ? <p className="success-text">{scheduleSuccess}</p> : null}
          {scheduleError ? <p className="error-text">{scheduleError}</p> : null}
        </section>

        <section className="panel history-panel">
          <div className="panel-heading">
            <h2>Recent wishes</h2>
            <p>Saved messages so you can compare tone and keep the output fresh.</p>
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

        <section className="panel history-panel">
          <div className="panel-heading">
            <h2>Scheduled wishes</h2>
            <p>Track pending, processed, and failed jobs from the same dashboard.</p>
          </div>

          <div className="history-list">
            {schedules.length ? (
              schedules.map((item) => (
                <article key={item.id} className="history-item schedule-item">
                  <div className="history-topline">
                    <strong>{item.name}</strong>
                    <span>{formatScheduleTime(item.scheduledFor)}</span>
                  </div>
                  <p>
                    {item.style} · {item.relationship} · {item.useLiveAi ? "Gemini" : "Local"}
                  </p>
                  <p>
                    Delivery: {formatDeliveryLabel(item.deliveryChannel)}
                    {item.recipientEmail ? ` · ${item.recipientEmail}` : ""}
                    {item.recipientPhone ? ` · ${item.recipientPhone}` : ""}
                  </p>
                  <div className="schedule-meta-row">
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                    <span className={`status-pill delivery-${item.deliveryStatus}`}>{item.deliveryStatus}</span>
                    {item.lastError ? <span className="schedule-error-note">{item.lastError}</span> : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">No scheduled wishes yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
