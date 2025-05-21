import { useState } from "react";
import { auth } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../Login/style.css';

export default function Login() {

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    const navigate = useNavigate()

    const handleLogin = async (e) => {

        e.preventDefault()

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            navigate("/home")
            
        } catch (error) {
            alert("Problema no loguin" + error.message)
            
        }

    }

const handleCadastro = () => {
    navigate ("/cadastro")
}

    return (
        <div style={styles.container}>
            <form style={styles.form} onSubmit={handleLogin}>
                <h2 style={styles.title}>Login</h2>

                <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>Entrar</button>

                <p onClick={handleCadastro} style={styles.otherLoginTitle}>Cadastrar-se</p>

                <div style={styles.otherLoginContainer}>
                    <p style={styles.otherLoginTitle}>ou entre com</p>

                    <div style={styles.buttonsContainer}>
                        <button style={styles.otherButton}>Google</button>
                        <button style={styles.otherButton}>GitHub</button>
                        <button style={styles.otherButton}>Smartphone</button>
                    </div>
                </div>

            </form>
        </div>
    );
}

const styles = {
    container: {
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    form: {
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        width: "300px",
    },
    title: {
        marginBottom: "20px",
        textAlign: "center",
        color: "#333",
    },
    input: {
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "16px",
    },
    button: {
        padding: "10px",
        backgroundColor: "#667eea",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background 0.3s",
        marginBottom: "20px",
    },
    otherLoginContainer: {
        textAlign: "center",
    },
    otherLoginTitle: {
        marginBottom: "10px",
        fontSize: "14px",
        color: "#666",
    },
    buttonsContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
    },
    otherButton: {
        padding: "8px 12px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background 0.3s",
    },
};
