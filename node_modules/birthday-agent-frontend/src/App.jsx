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
  { value: "email", label: "Email delivery" }
];

const initialForm = {
  name: "",
  relationship: "",
  style: "funny",
  promptType: "universal",
  interests: "",
  age: "",
  useLiveAi: false,
  deliveryChannel: "in_app",
  recipientEmail: "",
  scheduledFor: "",
  repeatYearly: true
};

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function formatDateTime(value) {
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

function buildInterests(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [presets, setPresets] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusText, setStatusText] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [presetResponse, schedulesResponse, recipientsResponse, deliveryHistoryResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/presets`),
          fetch(`${apiBaseUrl}/schedules`),
          fetch(`${apiBaseUrl}/recipients`),
          fetch(`${apiBaseUrl}/delivery-history`)
        ]);

        const [presetData, schedulesData, recipientsData, deliveryHistoryData] = await Promise.all([
          readJson(presetResponse),
          readJson(schedulesResponse),
          readJson(recipientsResponse),
          readJson(deliveryHistoryResponse)
        ]);

        setPresets(presetData);
        setSchedules(schedulesData);
        setRecipients(recipientsData);
        setDeliveryHistory(deliveryHistoryData);
      } catch (requestError) {
        setFormError(requestError.message);
      }
    }

    loadInitialData();
  }, []);

  async function refreshData() {
    const [schedulesResponse, recipientsResponse, deliveryHistoryResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/schedules`),
      fetch(`${apiBaseUrl}/recipients`),
      fetch(`${apiBaseUrl}/delivery-history`)
    ]);

    const [schedulesData, recipientsData, deliveryHistoryData] = await Promise.all([
      readJson(schedulesResponse),
      readJson(recipientsResponse),
      readJson(deliveryHistoryResponse)
    ]);

    setSchedules(schedulesData);
    setRecipients(recipientsData);
    setDeliveryHistory(deliveryHistoryData);
  }

  function pushRecentWish(message) {
    setHistory((current) => [message, ...current].slice(0, 10));
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function autofillRecipient(recipient) {
    setSelectedRecipientId(recipient.id);
    setForm((current) => ({
      ...current,
      name: recipient.name || "",
      relationship: recipient.relationship || "",
      style: recipient.favoriteStyle || current.style,
      promptType: recipient.favoritePromptType || current.promptType,
      interests: Array.isArray(recipient.interests) ? recipient.interests.join(", ") : current.interests,
      age: recipient.age || "",
      deliveryChannel: recipient.defaultDeliveryChannel || current.deliveryChannel,
      recipientEmail: recipient.email || ""
    }));
    setStatusText(`Loaded ${recipient.name}'s saved profile into the form.`);
    setFormError("");
  }

  function buildWishPayload() {
    return {
      name: form.name,
      relationship: form.relationship,
      style: form.style,
      promptType: form.promptType,
      interests: buildInterests(form.interests),
      age: form.age,
      useLiveAi: form.useLiveAi
    };
  }

  function buildDeliveryPayload() {
    return {
      deliveryChannel: form.deliveryChannel,
      recipientEmail: form.recipientEmail,
      repeatYearly: form.repeatYearly
    };
  }

  async function handleGenerate() {
    setGenerateLoading(true);
    setFormError("");
    setStatusText("");
    try {
      const response = await fetch(`${apiBaseUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildWishPayload())
      });
      const data = await readJson(response);
      pushRecentWish(data);
      setStatusText(`Generated a fresh ${form.style} message for ${form.name}.`);
      await refreshData();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleSendTestNow() {
    setTestLoading(true);
    setFormError("");
    setStatusText("");
    try {
      const response = await fetch(`${apiBaseUrl}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildWishPayload(), ...buildDeliveryPayload() })
      });
      const data = await readJson(response);
      pushRecentWish(data.message);
      setStatusText(data.delivery.status === "sent" ? `Test sent via ${formatDeliveryLabel(data.delivery.channel)}.` : "Test completed with in-app delivery only.");
      await refreshData();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setTestLoading(false);
    }
  }

  async function handleSchedule() {
    setScheduleLoading(true);
    setFormError("");
    setStatusText("");
    try {
      const response = await fetch(`${apiBaseUrl}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildWishPayload(),
          ...buildDeliveryPayload(),
          scheduledFor: new Date(form.scheduledFor).toISOString()
        })
      });
      const data = await readJson(response);
      setStatusText(`Scheduled ${data.name}'s wish for ${formatDateTime(data.scheduledFor)} via ${formatDeliveryLabel(data.deliveryChannel)}${data.repeatYearly ? " and it will repeat yearly automatically." : "."}`);
      setForm((current) => ({ ...current, scheduledFor: "" }));
      await refreshData();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setScheduleLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Birthday Wishing Agent</p>
          <h1>Your agent is welcoming you and sending wishes to everyone.</h1>
          <p className="hero-text hero-subtext">Create, test, schedule, and remember birthday wishes from one place.</p>
        </div>
        <div className="hero-stats">
          <article><span>Recipients</span><strong>{recipients.length}</strong></article>
          <article><span>Scheduled</span><strong>{schedules.length}</strong></article>
          <article><span>Deliveries</span><strong>{deliveryHistory.length}</strong></article>
        </div>
      </section>

      <main className="dashboard-grid">
        <section className="composer-panel wide-panel">
          <div className="composer-topline">
            <div><p className="eyebrow">Unified Studio</p><h2>Compose Once</h2></div>
            <div className="mode-chip"><span>{form.useLiveAi ? "Gemini Live" : "Local Template"}</span></div>
          </div>

          <div className="command-form">
            <div className="form-section">
              <div className="section-heading"><h3>Recipient</h3><p>Everything about the person lives here.</p></div>
              <div className="field-grid two-col">
                <label>Name<input name="name" value={form.name} onChange={updateField} placeholder="Rahul" /></label>
                <label>Relationship<input name="relationship" value={form.relationship} onChange={updateField} placeholder="best friend" /></label>
                <label>Age<input name="age" value={form.age} onChange={updateField} placeholder="25" /></label>
                <label>Interests<input name="interests" value={form.interests} onChange={updateField} placeholder="cricket, memes, bikes" /></label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-heading"><h3>Message Engine</h3><p>Shape tone, preset, and generation mode.</p></div>
              <div className="field-grid two-col">
                <label>Style<select name="style" value={form.style} onChange={updateField}>{styles.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}</select></label>
                <label>Prompt preset<select name="promptType" value={form.promptType} onChange={updateField}>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label>
              </div>
              <label className="toggle-row"><input name="useLiveAi" type="checkbox" checked={form.useLiveAi} onChange={updateField} /><span>Use Gemini live generation for richer output</span></label>
            </div>

            <div className="form-section accent-section">
              <div className="section-heading"><h3>Delivery and Schedule</h3><p>Save the birthday date and optionally repeat it every year automatically.</p></div>
              <div className="field-grid three-col">
                <label>Delivery channel<select name="deliveryChannel" value={form.deliveryChannel} onChange={updateField}>{deliveryChannels.map((channel) => <option key={channel.value} value={channel.value}>{channel.label}</option>)}</select></label>
                <label>Scheduled time<input type="datetime-local" name="scheduledFor" value={form.scheduledFor} onChange={updateField} /></label>
                <label>Recipient email<input name="recipientEmail" value={form.recipientEmail} onChange={updateField} placeholder={form.deliveryChannel === "email" ? "friend@example.com" : "Optional unless using email"} disabled={form.deliveryChannel !== "email"} /></label>
              </div>
              <label className="toggle-row"><input name="repeatYearly" type="checkbox" checked={form.repeatYearly} onChange={updateField} /><span>Repeat this birthday wish every year at the same time</span></label>
            </div>

            <div className="composer-footer">
              <div className="assistant-note"><strong>Workflow</strong><span>Generate now, test delivery instantly, or save a scheduled job that can repeat automatically next year.</span></div>
              <div className="action-bar">
                <button type="button" disabled={generateLoading} onClick={handleGenerate}>{generateLoading ? "Generating..." : "Generate Now"}</button>
                <button type="button" className="secondary-button" disabled={testLoading} onClick={handleSendTestNow}>{testLoading ? "Sending..." : "Send Test"}</button>
                <button type="button" className="ghost-button" disabled={scheduleLoading} onClick={handleSchedule}>{scheduleLoading ? "Scheduling..." : "Schedule Wish"}</button>
              </div>
            </div>
          </div>

          {statusText ? <p className="success-text inline-feedback">{statusText}</p> : null}
          {formError ? <p className="error-text inline-feedback">{formError}</p> : null}
        </section>

        <section className="panel wide-panel">
          <div className="panel-header"><div><p className="eyebrow">Profiles</p><h2>Saved Recipients</h2></div><p className="panel-hint">Tap any card to autofill the form above.</p></div>
          <div className="card-grid three-up">
            {recipients.length ? recipients.map((item) => (
              <button key={item.id} type="button" className={`info-card recipient-card selectable-card ${selectedRecipientId === item.id ? "selected-card" : ""}`} onClick={() => autofillRecipient(item)}>
                <div className="history-topline"><strong>{item.name}</strong><span>{item.relationship}</span></div>
                <p>{item.email ? item.email : "No email saved yet"}</p>
                <div className="mini-meta"><span>{item.favoriteStyle}</span><span>{formatDeliveryLabel(item.defaultDeliveryChannel)}</span></div>
                <p className="muted-line">{item.lastDeliveryAt ? `Last delivery ${formatDateTime(item.lastDeliveryAt)}` : "No deliveries yet"}</p>
              </button>
            )) : <div className="empty-state">No recipient profiles yet.</div>}
          </div>
        </section>

        <section className="panel wide-panel">
          <div className="panel-header"><div><p className="eyebrow">Scheduler</p><h2>Scheduled Wishes</h2></div></div>
          <div className="card-grid two-up">
            {schedules.length ? schedules.map((item) => (
              <article key={item.id} className="info-card schedule-card">
                <div className="history-topline"><strong>{item.name}</strong><span>{formatDateTime(item.scheduledFor)}</span></div>
                <p>{item.style} · {item.relationship} · {item.useLiveAi ? "Gemini" : "Local"}</p>
                <p>{formatDeliveryLabel(item.deliveryChannel)}{item.recipientEmail ? ` · ${item.recipientEmail}` : ""}{item.repeatYearly ? " · Repeats yearly" : ""}</p>
                <div className="schedule-meta-row"><span className={`status-pill status-${item.status}`}>{item.status}</span><span className={`status-pill delivery-${item.deliveryStatus}`}>{item.deliveryStatus}</span></div>
                {item.lastError ? <p className="muted-line">{item.lastError}</p> : null}
              </article>
            )) : <div className="empty-state">No scheduled wishes yet.</div>}
          </div>
        </section>

        <section className="panel wide-panel">
          <div className="panel-header"><div><p className="eyebrow">Delivery Log</p><h2>Delivery History</h2></div></div>
          <div className="card-grid two-up">
            {deliveryHistory.length ? deliveryHistory.map((item) => (
              <article key={item.id} className="info-card delivery-card">
                <div className="history-topline"><strong>{item.recipientName}</strong><span>{formatDateTime(item.createdAt)}</span></div>
                <p>{formatDeliveryLabel(item.deliveryChannel)} · {item.provider || "in_app"}{item.destination ? ` · ${item.destination}` : ""}</p>
                <div className="schedule-meta-row"><span className={`status-pill delivery-${item.status}`}>{item.status}</span></div>
                {item.errorMessage ? <p className="muted-line">{item.errorMessage}</p> : null}
              </article>
            )) : <div className="empty-state">No delivery history yet.</div>}
          </div>
        </section>

        <section className="panel wide-panel">
          <div className="panel-header"><div><p className="eyebrow">Output Feed</p><h2>Recent Wishes</h2></div><p className="panel-hint">Visible on this dashboard only for the current session.</p></div>
          <div className="history-list">
            {history.length ? history.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-topline"><strong>{item.name}</strong><span>{item.style} · {item.relationship}</span></div>
                <p>{item.message}</p>
              </article>
            )) : <div className="empty-state">No recent wishes in this session yet.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
