import { useState, useEffect } from 'react';
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../Home/style.css';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  TextareaAutosize
} from '@mui/material';

export default function Home() {
  const navigate = useNavigate();
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [listaRotinas, setListaRotinas] = useState([]);
  const [rotina, setRotina] = useState({
    nome: '',
    objetivo: '',
    colaborador: '',
    instrucoes: '',
    dataDeExecucao: '',
    horarioDeExecucao: '',
    tempoDecorrido: null,
    horarioConclusao: null,
    concluido: false
  });

  const [termoDePesquisa, setTermoDePesquisa] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ultimaRotinaConcluida, setUltimaRotinaConcluida] = useState(null);

  const API_URL = 'http://localhost:8080/api/rotinas';

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRotina({ ...rotina, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, rotina);
      setListaRotinas(prev => [...prev, response.data]);
      setFormularioAberto(false);
      setRotina({
        nome: '',
        objetivo: '',
        colaborador: '',
        instrucoes: '',
        dataDeExecucao: '',
        horarioDeExecucao: '',
        tempoDecorrido: null,
        horarioConclusao: null,
        concluido: false
      });
    } catch (error) {
      console.error('Erro ao salvar rotina:', error);
    }
  };

  const fetchRotinas = async () => {
    try {
      const response = await axios.get(API_URL);
      setListaRotinas(response.data);
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
    }
  };

  useEffect(() => {
    fetchRotinas();
  }, []);
  const toggleTaskCompletion = (id) => {
    // Atualização local apenas da flag 'concluido'
    const atualizadas = listaRotinas.map(r => {
      if (r.codigo === id) {
        return {
          ...r,
          concluido: !r.concluido,
          horarioConclusao: !r.concluido ? new Date().toISOString() : null
        };
      }
      return r;
    });
    setListaRotinas(atualizadas);

    if (!listaRotinas.find(r => r.codigo === id).concluido) {
      const rotinaConcluida = listaRotinas.find(r => r.codigo === id);
      setUltimaRotinaConcluida(rotinaConcluida);
    }
  };

  const deleteRoutine = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setListaRotinas(prev => prev.filter(r => r.codigo !== id));
    } catch (error) {
      console.error('Erro ao excluir rotina:', error);
    }
  };

  const rotinasFiltradas = listaRotinas.filter(rotina =>
    rotina.nome?.toLowerCase().includes(termoDePesquisa.toLowerCase())
  );

  useEffect(() => {
    if (ultimaRotinaConcluida) {
      setMensagem('Parabéns! Você concluiu sua rotina');
      setTimeout(() => setMensagem(''), 3000);
    }
  }, [ultimaRotinaConcluida]);

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0s';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="container-principal">
      <div className="coluna">
        <div className="app">
          <div className="rotina">
            <h1>Rotinas Trabalhistas</h1>
          </div>

          <Dialog open={formularioAberto} onClose={() => setFormularioAberto(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Nova Rotina</DialogTitle>
            <form onSubmit={handleFormSubmit}>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nome da Rotina"
                  name="nome"
                  value={rotina.nome}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Colaborador"
                  name="colaborador"
                  value={rotina.colaborador}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Objetivo"
                  name="objetivo"
                  value={rotina.objetivo}
                  onChange={handleInputChange}
                  required
                />
                <TextareaAutosize
                  minRows={4}
                  style={{ width: '100%', marginTop: 16 }}
                  placeholder="Instruções"
                  name="instrucoes"
                  value={rotina.instrucoes}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Data de Execução"
                  name="dataDeExecucao"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={rotina.dataDeExecucao}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Hora de Execução"
                  name="horarioDeExecucao"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={rotina.horarioDeExecucao}
                  onChange={handleInputChange}
                  required
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFormularioAberto(false)} color="secondary">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Salvar Rotina
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <button className="adicionar-rotina" onClick={() => setFormularioAberto(true)}>
            Nova Rotina
          </button>

          {mensagem && (
            <div className="mensagem-parabens">
              <strong>{mensagem}</strong>
            </div>
          )}

          <div className="seccao-pesquisa">
            <input
              className="campo-pesquisa"
              type="text"
              placeholder="Pesquise uma rotina"
              value={termoDePesquisa}
              onChange={(e) => setTermoDePesquisa(e.target.value)}
            />
          </div>

          <ul className="lista-rotina">
            {rotinasFiltradas.length === 0 ? (
              <li className="rotina-vazia">Não há nenhuma rotina</li>
            ) : (
              rotinasFiltradas.map((r) => (
                <li key={r.codigo} className={`item-rotina ${r.concluido ? 'concluida' : ''}`}>
                  <div className="rotina-info">
                    <strong>{r.nome}</strong> - {r.objetivo} (Execução: {r.dataDeExecucao} às {r.horarioDeExecucao})
                  </div>
                  <input
                    className="checkbox-rotina"
                    type="checkbox"
                    checked={r.concluido}
                    onChange={() => toggleTaskCompletion(r.codigo)}
                  />
                  <button className="botao-excluir" onClick={() => deleteRoutine(r.codigo)}>Excluir</button>
                </li>
              ))
            )}
          </ul>
        </div>

        <button onClick={handleLogout} className="botao-sair">Sair</button>
      </div>
    </div>
  );
}
