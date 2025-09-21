import time
import os
import streamlit as st
from datetime import datetime, timedelta

# ============================
# Configurações básicas
# ============================
st.set_page_config(
    page_title="FNVJ - Login",
    page_icon="🔐",
    layout="centered",
)

# ============================
# Credenciais (padrão)
# - Você pode sobrescrever por variáveis de ambiente:
#   APP_ADMIN_USER, APP_ADMIN_PASS, APP_SESSION_HOURS
# ============================
DEFAULT_USER = os.getenv("APP_ADMIN_USER", "FNVJADMIN")
DEFAULT_PASS = os.getenv("APP_ADMIN_PASS", "FNVJ2025")
SESSION_HOURS = float(os.getenv("APP_SESSION_HOURS", "8"))

# ============================
# Helpers de autenticação
# ============================
def is_logged_in() -> bool:
    """Verifica se há sessão válida na memória."""
    auth = st.session_state.get("auth")
    exp = st.session_state.get("auth_expires_at")
    if not auth or not exp:
        return False
    try:
        expires_at = datetime.fromisoformat(exp) if isinstance(exp, str) else datetime.fromtimestamp(exp)
    except Exception:
        return False
    return datetime.utcnow() < expires_at

def do_login(username: str, password: str) -> bool:
    """Valida credenciais e cria sessão se ok."""
    if username == DEFAULT_USER and password == DEFAULT_PASS:
        st.session_state["auth"] = {"user": username, "ts": time.time()}
        expires_at = datetime.utcnow() + timedelta(hours=SESSION_HOURS)
        st.session_state["auth_expires_at"] = expires_at.isoformat()
        return True
    return False

def do_logout():
    for k in ["auth", "auth_expires_at"]:
        if k in st.session_state:
            del st.session_state[k]
    st.success("Você saiu com segurança.")

# ============================
# UI - Sidebar (após login)
# ============================
def sidebar():
    with st.sidebar:
        st.markdown("### 🧭 Navegação")
        page = st.radio(
            "Escolha a página",
            options=["Dashboard Principal"],
            label_visibility="collapsed",
        )
        st.divider()
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("🔄 Atualizar"):
                st.rerun()
        with col2:
            if st.button("🚪 Sair"):
                do_logout()
                st.rerun()
        return page

# ============================
# Páginas (placeholder)
# ============================
def page_dashboard():
    st.title("📊 Dashboard Principal")
    st.info("Bem-vindo! Esta é a página inicial após o login.")
    st.write(
        """
        Aqui você poderá adicionar:
        - Cards com números-chave
        - Tabelas e gráficos
        - Acesso rápido a módulos
        """
    )
    st.caption("Dica: depois integramos com seu PostgreSQL e criamos os módulos.")

# ============================
# Tela de Login
# ============================
def login_screen():
    st.title("🔐 Login - FNVJ")
    st.caption("Acesso restrito ao administrador.")

    with st.form("login_form", clear_on_submit=False):
        u = st.text_input("Usuário", placeholder="FNVJADMIN")
        p = st.text_input("Senha", placeholder="••••••••", type="password")
        remember = st.checkbox("Manter logado (sessão estendida)", value=True)
        submitted = st.form_submit_button("Entrar", use_container_width=True)

    if submitted:
        ok = do_login(u.strip(), p.strip())
        if ok:
            # Se não quiser sessão estendida, reduz a duração para 2h nesta tentativa
            if not remember:
                expires_at = datetime.utcnow() + timedelta(hours=2)
                st.session_state["auth_expires_at"] = expires_at.isoformat()
            st.success("Login realizado com sucesso! Redirecionando...")
            st.rerun()
        else:
            st.error("Usuário ou senha inválidos.")

    st.write("")
    st.caption("Padrão: Usuário **FNVJADMIN** · Senha **FNVJ2025**")
    st.caption("Você pode alterar via variáveis de ambiente: APP_ADMIN_USER, APP_ADMIN_PASS e APP_SESSION_HOURS.")

# ============================
# Roteamento principal
# ============================
if is_logged_in():
    current = sidebar()
    if current == "Dashboard Principal":
        page_dashboard()
else:
    login_screen()
