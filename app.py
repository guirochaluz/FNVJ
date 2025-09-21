import os
import streamlit as st
import pandas as pd
from sqlalchemy.exc import SQLAlchemyError
from db import get_session, init_db, DATABASE_URL
from models import Customer

st.set_page_config(page_title="Starter: Streamlit + PostgreSQL", page_icon="🧱", layout="centered")

st.title("🧱 Starter: Streamlit + PostgreSQL (CRUD básico)")

with st.expander("Configuração do Banco (ler se necessário)", expanded=False):
    st.code(f"DATABASE_URL={DATABASE_URL}", language="bash")
    st.write("Se precisar alterar, edite o arquivo `.env` e reinicie o app.")

# Inicializa/cria tabelas
try:
    init_db()
except Exception as e:
    st.error(f"Erro ao inicializar o banco: {e}")
    st.stop()

tab_create, tab_list, tab_delete = st.tabs(["➕ Cadastrar", "📋 Listar", "🗑️ Excluir"])

with tab_create:
    st.subheader("Cadastrar novo cliente")
    name = st.text_input("Nome")
    email = st.text_input("Email")
    if st.button("Salvar"):
        if not name or not email:
            st.warning("Preencha nome e email.")
        else:
            try:
                session = get_session()
                # checa duplicidade por email
                exists = session.query(Customer).filter_by(email=email).first()
                if exists:
                    st.error("Já existe um cliente com esse email.")
                else:
                    c = Customer(name=name.strip(), email=email.strip())
                    session.add(c)
                    session.commit()
                    st.success("Cliente cadastrado!")
            except SQLAlchemyError as e:
                st.error(f"Erro ao salvar: {e}")
            finally:
                try:
                    session.close()
                except:
                    pass

with tab_list:
    st.subheader("Clientes cadastrados")
    try:
        session = get_session()
        rows = session.query(Customer).order_by(Customer.id.desc()).all()
        data = [{"id": r.id, "name": r.name, "email": r.email, "created_at": r.created_at} for r in rows]
        df = pd.DataFrame(data)
        if df.empty:
            st.info("Nenhum cliente encontrado.")
        else:
            st.dataframe(df, use_container_width=True)
    except SQLAlchemyError as e:
        st.error(f"Erro ao listar: {e}")
    finally:
        try:
            session.close()
        except:
            pass

with tab_delete:
    st.subheader("Excluir cliente")
    try:
        session = get_session()
        rows = session.query(Customer).order_by(Customer.name.asc()).all()
        options = [(f"{r.name} <{r.email}>", r.id) for r in rows]
        if not options:
            st.info("Nada para excluir.")
        else:
            label, selected_id = st.selectbox("Selecione o cliente", options, format_func=lambda x: x[0])
            if st.button("Excluir definitivamente"):
                try:
                    obj = session.query(Customer).get(selected_id)
                    if obj:
                        session.delete(obj)
                        session.commit()
                        st.success("Excluído! Atualize a aba de listagem para conferir.")
                    else:
                        st.warning("Registro não encontrado.")
                except SQLAlchemyError as e:
                    st.error(f"Erro ao excluir: {e}")
    except SQLAlchemyError as e:
        st.error(f"Erro ao carregar lista: {e}")
    finally:
        try:
            session.close()
        except:
            pass

st.caption("Projeto de exemplo, pronto para expandir (login, uploads, etc.)")