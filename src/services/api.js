const API_URL = "http://localhost:8080/api/rotinas";

export const buscarRotinas = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao buscar rotinas");
  return response.json();
};

export const criarRotina = async (rotina) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rotina)
  });
  if (!response.ok) throw new Error("Erro ao criar rotina");
  return response.json();
};

export const excluirRotina = async (codigo) => {
  const response = await fetch(`${API_URL}/${codigo}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Erro ao excluir rotina");
};
