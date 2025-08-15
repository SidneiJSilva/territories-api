# 📦 API de Territórios

API desenvolvida em **Node.js + Express** para gerenciamento e consulta de territórios, rodando em **Docker** no Raspberry Pi, com banco de dados **PostgreSQL**.

## 🚀 Funcionalidades
- Listagem de territórios com informações detalhadas (`/territories/territories-list`)
- Consulta de território por ID (`/territories/:id`)
- Estrutura modular de rotas e controllers
- Banco de dados PostgreSQL hospedado localmente no Raspberry Pi

---

## 📂 Estrutura do Projeto

api/
├── controllers/
│ └── territoriesController.js
├── routes/
│ └── territories.js
├── db.js
├── index.js
├── Dockerfile
├── docker-compose.yml
└── package.json


---

## 🛠 Pré-requisitos
- **Raspberry Pi** (com Docker e Docker Compose instalados)
- **Git** configurado com chave SSH
- **PostgreSQL** rodando em container
- Node.js (rodando dentro do container)

---

## ⚙️ Configuração

### 1. Clonar o repositório
```bash
git clone git@github.com:SEU_USUARIO/NOME_DO_REPOSITORIO.git
cd NOME_DO_REPOSITORIO
```

### 2. Subir os containers
docker compose up -d --build

### 3. Verificar logs
docker compose logs -f

## 📡 Endpoints

Listar todos os territórios
GET /territories/territories-list

Buscar território por ID
GET /territories/:id

## 🗄 Estrutura do Banco de Dados

-territories
-territory-area
-territory-type
-assignments
-territories-people

A query para a listagem de territórios já retorna:

-Status (available, assigned, delayed, etc.)
-Histórico de assignments em formato JSON