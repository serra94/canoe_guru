import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createEvent, deleteEvent, listEvents } from "../../services/adminApi";

const STATUSES = ["draft", "upcoming", "open", "in_progress", "finished"];

const AdminEventsScreen = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    starts_at: "",
    status: "draft",
    is_official: false
  });
  const primaryBtn =
    "w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2 font-semibold";
  const dangerBtn =
    "text-red-300 hover:text-red-200";

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Nome do evento e obrigatorio.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      status: form.status,
      is_official: form.is_official,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null
    };
    try {
      const created = await createEvent(payload);
      navigate(`/admin/events/${created.id}`);
    } catch (err) {
      setError("Nao foi possivel criar o evento.");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Deseja excluir este evento?")) return;
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch {
      setError("Nao foi possivel excluir o evento. Verifique o backend.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin - Eventos</h1>
            <p className="text-sm text-gray-400">
              Crie e organize eventos antes de publicar.
            </p>
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Desktop Admin
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="bg-[#111a2b] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Eventos cadastrados</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 uppercase text-xs border-b border-gray-800">
                  <tr>
                    <th className="text-left py-3">Nome</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Inicio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-800 hover:bg-[#0f172a]"
                    >
                      <td className="py-3 font-medium">{event.name}</td>
                      <td className="text-gray-400">{event.status}</td>
                      <td className="text-gray-400">
                        {event.starts_at
                          ? new Date(event.starts_at).toLocaleString("pt-BR")
                          : "-"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => navigate(`/admin/events/${event.id}`)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className={dangerBtn}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-500" colSpan="4">
                        Nenhum evento cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#111a2b] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Criar novo evento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs uppercase text-gray-400">Nome</label>
                <input
                  className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-400">Data limite</label>
                <input
                  type="datetime-local"
                  className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2 text-gray-200"
                  style={{ colorScheme: "dark" }}
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-400">Status</label>
                <select
                  className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_official}
                  onChange={(e) => setForm({ ...form, is_official: e.target.checked })}
                />
                Evento oficial
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                className={primaryBtn}
              >
                Criar evento
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsScreen;
