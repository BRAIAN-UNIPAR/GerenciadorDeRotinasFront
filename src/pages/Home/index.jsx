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
  const [modoEdicao, setModoEdicao] = useState(false);
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
      if (modoEdicao) {
        await axios.put(`${API_URL}/${rotina.codigo}`, rotina);
        setListaRotinas(prev => prev.map(r => (r.codigo === rotina.codigo ? rotina : r)));
      } else {
        const response = await axios.post(API_URL, rotina);
        setListaRotinas(prev => [...prev, response.data]);
      }

      setFormularioAberto(false);
      setModoEdicao(false);
      resetarRotina();
    } catch (error) {
      console.error('Erro ao salvar rotina:', error);
    }
  };

  const resetarRotina = () => {
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
  };

  const editarRotina = (rotinaSelecionada) => {
    setRotina(rotinaSelecionada);
    setModoEdicao(true);
    setFormularioAberto(true);
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

  // Função para calcular tempo decorrido entre inicio e fim
  const calcularTempoDecorrido = (dataExecucao, horarioExecucao, horarioConclusao) => {
    if (!dataExecucao || !horarioExecucao || !horarioConclusao) return 0;

    try {
     
      const inicio = new Date(`${dataExecucao}T${horarioExecucao}:00`);
      // HorarioConclusao já vem no formato ISO string, converte para Date
      const fim = new Date(horarioConclusao);
      const diff = fim.getTime() - inicio.getTime();
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const rotinaAtual = listaRotinas.find(r => r.codigo === id);
      if (!rotinaAtual) return;

      const novoStatus = !rotinaAtual.concluido;
      const horarioConclusao = novoStatus ? new Date().toISOString() : null;
      const tempoDecorrido = calcularTempoDecorrido(
        rotinaAtual.dataDeExecucao,
        rotinaAtual.horarioDeExecucao,
        horarioConclusao
      );

      // Atualiza localmente
      const atualizadas = listaRotinas.map(r => {
        if (r.codigo === id) {
          return {
            ...r,
            concluido: novoStatus,
            horarioConclusao: horarioConclusao,
            tempoDecorrido: tempoDecorrido
          };
        }
        return r;
      });
      setListaRotinas(atualizadas);

      // Atualiza no back-end com PATCH
      await axios.patch(`${API_URL}/${id}/status`, {
        concluido: novoStatus,
        horarioConclusao: horarioConclusao,
        tempoDecorrido: tempoDecorrido
      });

      if (novoStatus) {
        setUltimaRotinaConcluida(rotinaAtual);
      }
    } catch (error) {
      console.error('Erro ao atualizar status da rotina:', error);
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

          <Dialog open={formularioAberto} onClose={() => { setFormularioAberto(false); setModoEdicao(false); }} maxWidth="sm" fullWidth>
            <DialogTitle>{modoEdicao ? 'Editar Rotina' : 'Nova Rotina'}</DialogTitle>
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
                <Button onClick={() => { setFormularioAberto(false); setModoEdicao(false); }} color="secondary">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {modoEdicao ? 'Atualizar' : 'Salvar Rotina'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <button className="adicionar-rotina" onClick={() => { setFormularioAberto(true); resetarRotina(); setModoEdicao(false); }}>
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
                    <br />
                    Tempo decorrido: {formatTime(r.tempoDecorrido)}
                  </div>
                  <input
                    className="checkbox-rotina"
                    type="checkbox"
                    checked={r.concluido}
                    onChange={() => toggleTaskCompletion(r.codigo)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button className="botao-excluir" onClick={() => deleteRoutine(r.codigo)}>Excluir</button>
                    <button className="botao-submit" onClick={() => editarRotina(r)}>Editar</button>
                  </div>
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
