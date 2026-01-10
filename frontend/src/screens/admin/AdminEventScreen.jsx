import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";

import {
  createCategory,
  createCategoryAthlete,
  deleteCategory,
  importStartlist,
  listCategoryAthletes,
  listCategories,
  updateCategory,
  updateCategoryAthlete,
  updateEvent,
  validateCategory
} from "../../services/adminApi";

const STATUS_OPTIONS = ["draft", "upcoming", "open", "in_progress", "finished"];

const AdminEventScreen = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [athletes, setAthletes] = useState([]);
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    name_en: "",
    dark_horse_min_rank: ""
  });
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [eventEdit, setEventEdit] = useState(null);

  const [editingAthleteId, setEditingAthleteId] = useState(null);
  const [athleteForm, setAthleteForm] = useState({
    name: "",
    country_code: "",
    ranking_position: ""
  });
  const primaryBtn = "bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 font-semibold";
  const dangerBtn = "bg-red-600 hover:bg-red-500 rounded-lg px-4 py-2 font-semibold";

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    if (!eventId) return;
    setMessage("");
    setIssues([]);
    Promise.all([
      fetchEvent(),
      listCategories(eventId).then(setCategories)
    ]).catch(() => {
      setMessage("Nao foi possivel carregar o evento.");
    });
  }, [eventId]);

  useEffect(() => {
    if (!selectedCategoryId) return;
    listCategoryAthletes(eventId, selectedCategoryId)
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, [eventId, selectedCategoryId]);

  const fetchEvent = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8002"}/events/${eventId}`
    );
    if (!response.ok) {
      throw new Error("Event not found");
    }
    const data = await response.json();
    setEvent(data);
    setEventEdit({
      name: data.name,
      status: data.status,
      is_official: data.is_official,
      starts_at: data.starts_at ? data.starts_at.slice(0, 16) : ""
    });
  };

  const handleEventUpdate = async () => {
    if (!eventEdit) return;
    setMessage("");
    const payload = {
      name: eventEdit.name.trim(),
      status: eventEdit.status,
      is_official: eventEdit.is_official,
      starts_at: eventEdit.starts_at ? new Date(eventEdit.starts_at).toISOString() : null
    };
    const updated = await updateEvent(eventId, payload);
    setEvent(updated);
    setMessage("Evento atualizado.");
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!categoryForm.name.trim()) return;
    const payload = {
      name: categoryForm.name.trim(),
      name_en: categoryForm.name_en.trim() || null,
      is_active: false,
      dark_horse_min_rank: categoryForm.dark_horse_min_rank
        ? Number(categoryForm.dark_horse_min_rank)
        : null
    };
    const created = await createCategory(eventId, payload);
    setCategories((prev) => [...prev, created]);
    setCategoryForm({ name: "", name_en: "", dark_horse_min_rank: "" });
    setSelectedCategoryId(created.id);
  };

  const handleSelectCategory = (id) => {
    setSelectedCategoryId(id);
    setIssues([]);
    setMessage("");
    setEditingAthleteId(null);
    setAthleteForm({ name: "", country_code: "", ranking_position: "" });
    const cat = categories.find((item) => item.id === id);
    if (cat) {
      setCategoryEdit({
        name: cat.name,
        name_en: cat.name_en || "",
        is_active: cat.is_active,
        dark_horse_min_rank: cat.dark_horse_min_rank ?? ""
      });
    }
  };

  const handleCategoryUpdate = async () => {
    if (!selectedCategory) return;
    setMessage("");
    setIssues([]);
    try {
      const payload = {
        name: categoryEdit.name.trim(),
        name_en: categoryEdit.name_en.trim() || null,
        is_active: categoryEdit.is_active,
        dark_horse_min_rank: categoryEdit.dark_horse_min_rank
          ? Number(categoryEdit.dark_horse_min_rank)
          : null
      };
      const updated = await updateCategory(eventId, selectedCategory.id, payload);
      setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
      setMessage("Categoria atualizada.");
    } catch (err) {
      if (Array.isArray(err.detail)) {
        setIssues(err.detail);
      }
      setMessage("Nao foi possivel ativar a categoria.");
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    const targetId = categoryId || selectedCategory?.id;
    if (!targetId) return;
    if (!window.confirm("Deseja excluir esta categoria?")) return;
    try {
      await deleteCategory(eventId, targetId);
      setCategories((prev) => prev.filter((cat) => cat.id !== targetId));
      if (selectedCategoryId === targetId) {
        setSelectedCategoryId("");
        setCategoryEdit(null);
        setAthletes([]);
        setIssues([]);
      }
      setMessage("Categoria excluida.");
    } catch {
      setMessage("Nao foi possivel excluir a categoria.");
    }
  };

  const handleImport = async (file) => {
    if (!file || !selectedCategory) return;
    setMessage("");
    setIssues([]);
    const content_base64 = await readFileBase64(file);
    const payload = {
      filename: file.name,
      content_base64,
      content_type: file.type || null,
      replace_existing: true
    };
    const response = await importStartlist(eventId, selectedCategory.id, payload);
    setIssues(response.issues || []);
    setMessage(`Importacao concluida. Linhas: ${response.total_rows}`);
    const refreshed = await listCategoryAthletes(eventId, selectedCategory.id);
    setAthletes(refreshed);
  };

  const handleValidate = async () => {
    if (!selectedCategory) return;
    const data = await validateCategory(eventId, selectedCategory.id);
    setIssues(data.issues || []);
    setMessage(data.issues?.length ? "Pendencias encontradas." : "Categoria valida.");
  };

  const handleAthleteSave = async () => {
    if (!editingAthleteId) return;
    if (!athleteForm.name || !athleteForm.country_code || !athleteForm.ranking_position) {
      setMessage("Preencha nome, pais e ranking.");
      return;
    }
    const payload = {
      name: athleteForm.name.trim(),
      country_code: athleteForm.country_code.trim().toUpperCase(),
      ranking_position: Number(athleteForm.ranking_position)
    };
    const updated = await updateCategoryAthlete(
      eventId,
      selectedCategory.id,
      editingAthleteId,
      payload
    );
    setAthletes((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
    setEditingAthleteId(null);
    setAthleteForm({ name: "", country_code: "", ranking_position: "" });
  };

  const handleAthleteCreate = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!athleteForm.name || !athleteForm.country_code || !athleteForm.ranking_position) {
      setMessage("Preencha nome, pais e ranking.");
      return;
    }
    const payload = {
      name: athleteForm.name.trim(),
      country_code: athleteForm.country_code.trim().toUpperCase(),
      ranking_position: Number(athleteForm.ranking_position)
    };
    const created = await createCategoryAthlete(eventId, selectedCategory.id, payload);
    setAthletes((prev) => [...prev, created]);
    setAthleteForm({ name: "", country_code: "", ranking_position: "" });
    setMessage("Atleta adicionado.");
  };

  const startEditingAthlete = (athlete) => {
    setEditingAthleteId(athlete.id);
    setAthleteForm({
      name: athlete.name,
      country_code: athlete.country_code,
      ranking_position: athlete.ranking_position || ""
    });
  };

  if (!event || !eventEdit) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Voltar
          </button>
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Admin Desktop
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
          <section className="space-y-6">
            <div className="bg-[#111a2b] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Evento</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase text-gray-400">Nome</label>
                  <input
                    className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                    value={eventEdit.name}
                    onChange={(e) => setEventEdit({ ...eventEdit, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-400">Data limite</label>
                  <input
                    type="datetime-local"
                    className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2 text-gray-200"
                    style={{ colorScheme: "dark" }}
                    value={eventEdit.starts_at || ""}
                    onChange={(e) => setEventEdit({ ...eventEdit, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-400">Status</label>
                  <select
                    className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                    value={eventEdit.status}
                    onChange={(e) => setEventEdit({ ...eventEdit, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={eventEdit.is_official}
                    onChange={(e) => setEventEdit({ ...eventEdit, is_official: e.target.checked })}
                  />
                  Evento oficial
                </label>
                <button
                  onClick={handleEventUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2 font-semibold"
                >
                  Salvar evento
                </button>
              </div>
            </div>

            <div className="bg-[#111a2b] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Categorias</h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${
                      cat.id === selectedCategoryId
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span>{cat.name}</span>
                        {cat.name_en && (
                          <span className="text-xs text-gray-500 ml-2">
                            {cat.name_en}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {cat.is_active ? "ativa" : "inativa"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryDelete(cat.id);
                          }}
                          className="text-red-300 hover:text-red-200"
                          title="Excluir categoria"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhuma categoria criada.</p>
                )}
              </div>
              <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
                <input
                  className="w-full rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                  placeholder="Nome da categoria (PT)"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
                <input
                  className="w-full rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                  placeholder="Nome da categoria (EN)"
                  value={categoryForm.name_en}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name_en: e.target.value })
                  }
                />
                <input
                  className="w-full rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                  placeholder="Minimo do azarão (opcional)"
                  value={categoryForm.dark_horse_min_rank}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, dark_horse_min_rank: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2 font-semibold"
                >
                  Criar categoria
                </button>
              </form>
            </div>
          </section>

          <section className="bg-[#111a2b] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detalhes da categoria</h2>
            {!selectedCategory && (
              <p className="text-sm text-gray-500">
                Selecione uma categoria para importar atletas.
              </p>
            )}

            {selectedCategory && categoryEdit && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase text-gray-400">Nome</label>
                    <input
                      className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                      value={categoryEdit.name}
                      onChange={(e) =>
                        setCategoryEdit({ ...categoryEdit, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase text-gray-400">Nome (EN)</label>
                    <input
                      className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                      value={categoryEdit.name_en}
                      onChange={(e) =>
                        setCategoryEdit({ ...categoryEdit, name_en: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400">Azarao minimo</label>
                    <input
                      className="w-full mt-2 rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                      value={categoryEdit.dark_horse_min_rank}
                      onChange={(e) =>
                        setCategoryEdit({
                          ...categoryEdit,
                          dark_horse_min_rank: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={categoryEdit.is_active}
                    onChange={(e) =>
                      setCategoryEdit({ ...categoryEdit, is_active: e.target.checked })
                    }
                  />
                  Categoria ativa
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={handleCategoryUpdate}
                    className={primaryBtn}
                  >
                    Salvar categoria
                  </button>
                  <button
                    onClick={handleValidate}
                    className={primaryBtn}
                  >
                    Validar dados
                  </button>
                </div>

                <div className="border border-gray-800 rounded-xl p-4 bg-[#0b1220]">
                  <h3 className="font-semibold mb-3">Importar Start List</h3>
                  <input
                    type="file"
                    accept=".pdf,.csv"
                    onChange={(e) => handleImport(e.target.files[0])}
                    className="text-sm text-gray-300"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pendencias</h3>
                  {issues.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma pendencia.</p>
                  )}
                  {issues.length > 0 && (
                    <ul className="text-sm text-red-300 space-y-1">
                      {issues.map((issue, idx) => (
                        <li key={`${issue.row_index}-${idx}`}>
                          Linha {issue.row_index}: {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Atletas</h3>
                  <div className="overflow-auto border border-gray-800 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase text-gray-400 border-b border-gray-800">
                        <tr>
                          <th className="text-left px-3 py-2">Nome</th>
                          <th className="text-left">Pais</th>
                          <th className="text-left">Ranking</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {athletes.map((athlete) => (
                          <tr key={athlete.id} className="border-b border-gray-800">
                            {editingAthleteId === athlete.id ? (
                              <>
                                <td className="px-3 py-2">
                                  <input
                                    className="w-full rounded bg-[#111a2b] border border-gray-700 px-2 py-1"
                                    value={athleteForm.name}
                                    onChange={(e) =>
                                      setAthleteForm({ ...athleteForm, name: e.target.value })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="w-20 rounded bg-[#111a2b] border border-gray-700 px-2 py-1 uppercase"
                                    value={athleteForm.country_code}
                                    onChange={(e) =>
                                      setAthleteForm({
                                        ...athleteForm,
                                        country_code: e.target.value
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="w-20 rounded bg-[#111a2b] border border-gray-700 px-2 py-1"
                                    value={athleteForm.ranking_position}
                                    onChange={(e) =>
                                      setAthleteForm({
                                        ...athleteForm,
                                        ranking_position: e.target.value
                                      })
                                    }
                                  />
                                </td>
                                <td className="text-right px-3">
                                  <button
                                    onClick={handleAthleteSave}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    Salvar
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-2">{athlete.name}</td>
                                <td>{athlete.country_code}</td>
                                <td>{athlete.ranking_position ?? "-"}</td>
                                <td className="text-right px-3">
                                  <button
                                    onClick={() => startEditingAthlete(athlete)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    Editar
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                        {athletes.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-gray-500" colSpan="4">
                              Nenhum atleta carregado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <form onSubmit={handleAthleteCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    className="rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                    placeholder="Nome"
                    value={athleteForm.name}
                    onChange={(e) => setAthleteForm({ ...athleteForm, name: e.target.value })}
                  />
                  <input
                    className="rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2 uppercase"
                    placeholder="Pais"
                    value={athleteForm.country_code}
                    onChange={(e) =>
                      setAthleteForm({ ...athleteForm, country_code: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg bg-[#0b1220] border border-gray-700 px-3 py-2"
                    placeholder="Ranking"
                    value={athleteForm.ranking_position}
                    onChange={(e) =>
                      setAthleteForm({ ...athleteForm, ranking_position: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 rounded-lg py-2 font-semibold"
                  >
                    Adicionar atleta
                  </button>
                </form>
              </div>
            )}

            {message && <p className="mt-4 text-sm text-gray-400">{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

const readFileBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const base64 = result.toString().split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default AdminEventScreen;
