import { useState } from "react";
import "./index.css";
import { useReservation } from "./ReservationContext";

function getStatusBadge(status) {
  if (status === "Menunggu")
    return <span className="badge waiting">Menunggu</span>;
  if (status === "Dipanggil")
    return <span className="badge called">Dipanggil</span>;
  if (status === "Selesai")
    return <span className="badge done">Selesai</span>;
  return null;
}

function ReservationDetail({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="reservation-detail-card">
      <div className="detail-header">
        <span className="badge status-green">Reservasi</span>
        <span className="detail-date">
          <b>{data.time?.split(",")[0]}</b>
          <span style={{ marginLeft: 8 }}>{data.time?.split(",")[1]}</span>
        </span>
      </div>
      <div className="detail-body">
        <div><b>Nama Pemesan:</b> {data.name}</div>
        <div><b>Nomor Pemesan:</b> {data.phone}</div>
        <div><b>ID Reservasi:</b> RSVT-{(data.phone || "").slice(-4)}{(data.name || "").slice(0,2).toUpperCase()}Q</div>
        <div><b>Jumlah Orang:</b> {data.people} Orang</div>
        {data.note && <div><b>Catatan:</b> {data.note}</div>}
        <div><b>Status:</b> {getStatusBadge(data.status)}</div>
      </div>
      <div className="detail-actions">
        {data.status === "Menunggu" && (
          <button className="detail-btn ready">Meja Sudah Siap, Beritahu Pemesan</button>
        )}
        {data.status === "Dipanggil" && (
          <button className="detail-btn arrived">Tamu Sudah Datang</button>
        )}
        <button className="detail-btn contact">Hubungi Pemesan</button>
        <button className="detail-btn cancel" onClick={onClose}>Tutup Detail</button>
      </div>
    </div>
  );
}

function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    people: "",
    note: "",
  });
  const [selected, setSelected] = useState(null);

  const {
    queue,
    history,
    addReservation,
    callNext,
    undo,
    redo,
    clearHistory,
    undoStack,
    redoStack,
  } = useReservation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReserve = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.people.trim()) return;
    addReservation({
      ...form,
      time: new Date().toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
    setForm({ name: "", phone: "", people: "", note: "" });
  };

  return (
    <div className="bg-overlay">
      <div className="container five-star">
        <h1>
          <span className="logo-star">★</span> Reservasi Restoran{" "}
          <span className="logo-star">★</span>
        </h1>
        

        {/* Stack Information */}
        <div className="stack-panel">
          <div className="stack-info-box">
            <b>📚 Stack Information</b>
            <div className="stack-detail">
              Undo Stack: {undoStack.length} | Redo Stack: {redoStack.length} | Total Antrian: {queue.length} | Total Riwayat: {history.length}
            </div>
          </div>
          <div className="stack-btn-row">
            <button className="undo-btn" onClick={undo} disabled={undoStack.length === 0}>↶ Undo</button>
            <button className="redo-btn" onClick={redo} disabled={redoStack.length === 0}>↷ Redo</button>
            <button className="clear-btn" onClick={clearHistory}>🗑️ Clear History</button>
          </div>
        </div>

        <form
          className="reservation-form"
          onSubmit={handleReserve}
          autoComplete="off"
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">👤 Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Contoh: Andi Wijaya"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">📱 No. Telepon</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="people">👥 Jumlah Orang</label>
              <input
                type="number"
                id="people"
                name="people"
                min={1}
                placeholder="Misal: 4"
                value={form.people}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="note">📝 Catatan (Opsional)</label>
              <input
                type="text"
                id="note"
                name="note"
                placeholder="Permintaan khusus, dll"
                value={form.note}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit">
            <span role="img" aria-label="reserve">🛎️</span> Reservasi Sekarang
          </button>
        </form>

        {/* ...sebelum ini form reservasi... */}

        <div className="split-row">
          <div className="split-col">
            <h2>Antrian Saat Ini</h2>
            {queue.length === 0 ? (
              <p>Belum ada antrian</p>
            ) : (
              <ol className="reservation-list">
                {queue.map((q, index) => (
                  <li key={index}>
                    <div className="card" onClick={() => setSelected(q)} style={{cursor: "pointer"}}>
                      <div className="card-header">
                        <b>{q.name}</b> {getStatusBadge(q.status)}
                      </div>
                      <div className="small">👥 {q.people} orang</div>
                      <div className="small">📞 {q.phone}</div>
                      {q.note && <div className="small">📝 {q.note}</div>}
                      <div className="small">⏰ {q.time}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <button
              className="next-btn"
              onClick={callNext}
              disabled={queue.length === 0}
            >
              <span role="img" aria-label="next">🔔</span> Panggil Antrian Berikutnya
            </button>
          </div>
          <div className="split-col">
            <h2>Riwayat Reservasi</h2>
            {history.length === 0 ? (
              <p>Belum ada riwayat</p>
            ) : (
              <ol className="reservation-list">
                {history.map((h, idx) => (
                  <li key={idx}>
                    <div className="card history" onClick={() => setSelected(h)} style={{cursor: "pointer"}}>
                      <div className="card-header">
                        <b>{h.name}</b> {getStatusBadge(h.status)}
                      </div>
                      <div className="small">👥 {h.people} orang</div>
                      <div className="small">📞 {h.phone}</div>
                      {h.note && <div className="small">📝 {h.note}</div>}
                      <div className="small">⏰ {h.time}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Detail Reservasi */}
        <div className="detail-reservasi-wrapper">
          <ReservationDetail data={selected} onClose={() => setSelected(null)} />
        </div>
      </div>
    </div>
  );
}

export default App;
