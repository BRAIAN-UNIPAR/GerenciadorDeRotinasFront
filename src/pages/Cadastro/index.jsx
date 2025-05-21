import { useState } from "react";
import { auth } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../Cadastro/style.css';

export default function Cadastro() {

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const navigate = useNavigate()

    const handleCadastro = async (e) => {
        e.preventDefault()
        try {
            await createUserWithEmailAndPassword(auth, email, senha)
            alert("Usuario cadastrado")
            navigate("/")

        } catch (error) {
            alert("Problema ao cadastrar" + error.message)
        }

    }

    return (
        <div className="container">
            <form className="form" onSubmit={handleCadastro}>
                <h2 className="title">Cadastro</h2>

                <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="input"
                />

                <button type="submit" className="button">Cadastrar</button>

                <p className="linkText">
                    Já tem conta?{" "}
                    <span className="link" onClick={() => navigate("/")}>
                        Faça login
                    </span>
                </p>
            </form>
        </div>
    );
}