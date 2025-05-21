import { useState, useEffect } from 'react';
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
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

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

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
    horarioConclusao: null
  });
  const [comentarios, setComentarios] = useState({});
  const [termoDePesquisa, setTermoDePesquisa] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ultimaRotinaConcluida, setUltimaRotinaConcluida] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRotina({
      ...rotina,
      [name]: value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const novaRotina = {
      ...rotina,
      id: Date.now(),
      concluido: false,
      tempoDecorrido: null,
      horarioConclusao: null,
    };
    setListaRotinas([...listaRotinas, novaRotina]);
    setRotina({
      nome: '',
      objetivo: '',
      colaborador: '',
      instrucoes: '',
      dataDeExecucao: '',
      horarioDeExecucao: '',
      tempoDecorrido: null,
      horarioConclusao: null,
    });
    setFormularioAberto(false);
  };

  const toggleTaskCompletion = (id) => {
    const atualizadas = [...listaRotinas];
    const r = atualizadas.find((rotina) => rotina.id === id);

    if (!r.concluido) {
      r.concluido = true;
      r.horarioConclusao = new Date();
      setUltimaRotinaConcluida(r);
    } else {
      r.concluido = false;
      r.horarioConclusao = null;
    }

    setListaRotinas(atualizadas);
  };

  const deleteRoutine = (id) => {
    const atualizadas = listaRotinas.filter((rotina) => rotina.id !== id);
    setListaRotinas(atualizadas);
    setComentarios((prev) => {
      const novos = { ...prev };
      delete novos[id];
      return novos;
    });
  };

  const rotinasFiltradas = listaRotinas.filter((rotina) =>
    rotina.nome.toLowerCase().includes(termoDePesquisa.toLowerCase())
  );

  useEffect(() => {
    if (ultimaRotinaConcluida) {
      setMensagem('Parabéns! Você concluiu sua rotina');
      setTimeout(() => setMensagem(''), 3000);
    }
  }, [ultimaRotinaConcluida]);

  useEffect(() => {
    const timers = listaRotinas.map((rotina, index) => {
      if (!rotina.concluido && rotina.dataDeExecucao && rotina.horarioDeExecucao) {
        const execucaoDateTime = new Date(`${rotina.dataDeExecucao}T${rotina.horarioDeExecucao}`);
        const now = new Date();

        if (execucaoDateTime <= now) {
          const timerId = setInterval(() => {
            const atualizadas = [...listaRotinas];
            const timeElapsed = Math.max(0, new Date() - execucaoDateTime);
            atualizadas[index].tempoDecorrido = timeElapsed;
            setListaRotinas(atualizadas);
          }, 1000);

          return { timerId, index };
        }
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearInterval(timer.timerId);
      });
    };
  }, [listaRotinas]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const listaRotinasOrdenadas = [
    ...listaRotinas.filter(r => !r.concluido),
    ...listaRotinas.filter(r => r.concluido),
  ];

  const handleCommentChange = (id, comment) => {
    setComentarios((prev) => ({
      ...prev,
      [id]: comment,
    }));
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
                <li key={r.id} className={`item-rotina ${r.concluido ? 'concluida' : ''}`}>
                  <div className="rotina-info">
                    <strong>{r.nome}</strong> - {r.objetivo} (Execução: {r.dataDeExecucao} às {r.horarioDeExecucao})
                  </div>
                  <input
                    className="checkbox-rotina"
                    type="checkbox"
                    checked={r.concluido}
                    onChange={() => toggleTaskCompletion(r.id)}
                  />
                </li>
              ))
            )}
          </ul>
        </div>

        <button onClick={handleLogout} className="botao-sair">Sair</button>
      </div>

      <div className="edit">
        <div className="texto-edit">
          <h1 className="titulo-edit">Lista das suas rotinas!</h1>
          <p>As rotinas concluídas serão movidas para o final da lista!</p>
        </div>
        <ul className="lista-rotina">
          {listaRotinasOrdenadas.length === 0 ? (
            <li className="rotina-vazia">Não há nenhuma rotina cadastrada.</li>
          ) : (
            listaRotinasOrdenadas.map((r) => (
              <li key={r.id} className={`item-rotina ${r.concluido ? 'concluida' : ''}`}>
                <div className="rotina-info">
                  <strong>{r.nome}</strong> - {r.objetivo} (Execução: {r.dataDeExecucao} às {r.horarioDeExecucao})
                </div>
                {r.tempoDecorrido !== null && (
                  <div className="tempo-decorrido">Tempo: {formatTime(r.tempoDecorrido)}</div>
                )}
                {r.concluido && r.horarioConclusao && (
                  <div className="horario-conclusao">Concluído em: {r.horarioConclusao.toLocaleString()}</div>
                )}
                <textarea
                  className="comentario"
                  placeholder="Adicione um comentário..."
                  value={comentarios[r.id] || ''}
                  onChange={(e) => handleCommentChange(r.id, e.target.value)}
                />
                <button className="botao-excluir" onClick={() => deleteRoutine(r.id)}>Excluir</button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
