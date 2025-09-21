# streamlit_postgres_starter

Starter simples (nível iniciante) para um sistema web com **Streamlit + PostgreSQL (SQLAlchemy)**.

## Requisitos
- Python 3.10+
- Um banco PostgreSQL (ex.: Render, Neon, Supabase ou local)
- URL de conexão `DATABASE_URL` (formato abaixo)

**Formato da `DATABASE_URL` (psycopg3):**
```
postgresql+psycopg://USUARIO:SENHA@HOST:PORTA/NOME_BANCO?sslmode=require
```
> Em Render/Neon normalmente `sslmode=require` é necessário.

## Passo a passo (Windows / macOS / Linux)

1) Crie e ative um ambiente virtual (opcional, mas recomendado):
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

2) Instale as dependências:
```bash
pip install -r requirements.txt
```

3) Configure as variáveis de ambiente:
- Copie `.env.example` para `.env` e **preencha a `DATABASE_URL`** com a sua string.
  - Exemplo:
    ```
    DATABASE_URL=postgresql+psycopg://admin:senha@host.render.com:5432/contazoom?sslmode=require
    ```

4) Rode a aplicação:
```bash
streamlit run app.py
```

5) Acesse no navegador o link que o Streamlit mostrar (geralmente `http://localhost:8501`).

## Estrutura
```
streamlit_postgres_starter/
  ├─ app.py            # App Streamlit (CRUD simples)
  ├─ db.py             # Conexão e sessão SQLAlchemy
  ├─ models.py         # Modelo 'Customer'
  ├─ requirements.txt  # Dependências
  ├─ .env.example      # Exemplo de variáveis
  └─ README.md
```

## Observações
- Na **primeira execução** o app cria a tabela automaticamente se não existir.
- Este projeto é propositalmente simples (sem login) para facilitar o aprendizado.
- Para deploy no Render/Streamlit Cloud depois, a gente ajusta juntos.