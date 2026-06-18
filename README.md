<div align="center">

# 法律文书智能处理平台
# Legal Document Intelligent Processing Platform

**AI-powered contract risk analysis · OCR for images & scanned PDFs · Local LLM (Ollama)**

[中文](#中文) · [English](#english)

</div>

---

## 中文

一个基于本地大模型（Ollama）的合同法律风险智能分析平台。上传合同文件（txt / pdf / docx / 图片），AI 会自动识别法律风险点、生成专业分析报告，并支持历史记录查询。

### ✨ 功能特性

- 📄 **多格式文件支持**：txt、PDF、Word（docx）、图片（jpg/png/gif/bmp/webp）
- 🔍 **图片 OCR 识别**：上传合同照片，视觉模型自动提取文字再分析
- 🖼️ **文档内嵌图片识别**：自动提取 PDF / Word 中的图片并 OCR，扫描版合同也能分析
- ⚖️ **专业法律风险分析**：识别合同主体、权利义务、违约责任、争议解决、潜在风险点
- 🎯 **风险等级评估**：高 / 中 / 低 三级风险标注，逐条给出修改建议
- 💾 **历史记录**：基于 Supabase 存储分析记录，可随时回看（可选）
- 🏠 **全本地部署**：使用 Ollama 本地模型，数据不离开你的电脑

### 🧠 工作原理 / 架构

```
┌─────────────┐
│  上传文件    │  txt / pdf / docx / 图片
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  文件解析 (file_parser.py)               │
│  · 文档 → 提取正文文字 + 内嵌图片        │
│  · 图片 → 直接作为视觉输入               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  视觉模型 OCR (minicpm-v)                │  ← 只负责"看图识字"
│  · 图片 / 扫描页 → 纯文字                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  文本模型分析 (qwen2.5)                  │  ← 负责专业法律推理
│  · 合并后的完整文字 → 风险分析报告(JSON)  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  前端展示 (React + Tailwind)             │
│  · 风险等级、风险点列表、修改建议        │
└─────────────────────────────────────────┘
```

**核心设计**：视觉模型（minicpm-v）只做 OCR 把图变文字，法律风险分析统一交给文本模型（qwen2.5），各司其职、质量更高。

### 📁 项目结构

```
法律/
├── backend/                    # 后端 - FastAPI
│   ├── api/
│   │   └── index.py            # API 路由（/api/analyze 等）
│   ├── services/
│   │   ├── ai_service.py       # AI 模型调用（文本分析 + 图片 OCR）
│   │   ├── file_parser.py      # 文件解析（PDF/Word/图片 文字+图片提取）
│   │   └── supabase_client.py  # Supabase 数据库客户端
│   ├── requirements.txt
│   ├── .env.example            # 环境变量示例
│   └── vercel.json
├── frontend/                   # 前端 - React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/              # 页面（首页 / 历史记录）
│   │   ├── components/         # 组件（上传 / 风险报告 / 历史列表）
│   │   └── api/client.js       # API 请求封装
│   ├── package.json
│   └── .env.example
├── supabase_init.sql           # 数据库初始化 SQL
└── 启动.bat                    # Windows 一键启动脚本
```

### 🚀 快速开始

#### 前置要求

- **Python 3.8+**
- **Node.js 16+**
- **[Ollama](https://ollama.com)** 已安装并运行

#### 1. 拉取 AI 模型

```bash
# 文本模型（法律分析）
ollama pull qwen2.5:3b

# 视觉模型（图片 OCR）
ollama pull minicpm-v4.6:latest
```

#### 2. 一键启动（Windows）

直接双击运行：

```
启动.bat
```

脚本会自动：检查环境 → 安装依赖 → 启动后端（端口 8000）→ 启动前端（端口 3000）→ 打开浏览器。

#### 3. 手动启动

**后端：**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env      # 按需修改配置
python -m uvicorn api.index:app --reload --port 8000
```

**前端：**
```bash
cd frontend
npm install
cp .env.example .env      # 按需修改 API 地址
npm run dev
```

打开 http://localhost:3000 即可使用。

### ⚙️ 配置说明

#### 后端环境变量（`backend/.env`）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `LEGAL_MODEL_BASE_URL` | Ollama API 地址 | `http://localhost:11434/v1` |
| `LEGAL_MODEL_NAME` | 文本模型名（法律分析） | `qwen2.5:3b` |
| `LEGAL_VISION_MODEL_NAME` | 视觉模型名（OCR） | `minicpm-v4.6:latest` |
| `LEGAL_MODEL_API_KEY` | API Key（Ollama 任意值即可） | `ollama` |
| `SUPABASE_URL` | Supabase 项目地址（可选） | — |
| `SUPABASE_KEY` | Supabase 密钥（可选） | — |

> 💡 Supabase 未配置时，历史记录功能自动禁用，但不影响分析功能。

#### 前端环境变量（`frontend/.env`）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8000` |

### 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/analyze` | 上传文件并分析（核心接口） |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/history/{user_id}` | 查询历史记录 |
| `GET` | `/api/record/{record_id}` | 查询单条记录 |
| `GET` | `/docs` | Swagger API 文档 |

### 📦 部署

前后端均支持部署到 **Vercel**：

- **后端**：FastAPI + Mangum，已配置 `vercel.json`
- **前端**：Vite 静态构建，`npm run build` 后部署 `dist/`
- 部署时在 Vercel 控制台配置对应环境变量

> ⚠️ 部署到云端后，AI 模型需改为可访问的远程地址（修改 `LEGAL_MODEL_BASE_URL`）。

---

## English

An AI-powered legal contract risk analysis platform built on local LLMs (Ollama). Upload contract files (txt / pdf / docx / images), and the AI will automatically identify legal risks, generate a professional analysis report, and optionally save history.

### ✨ Features

- 📄 **Multi-format support**: txt, PDF, Word (docx), images (jpg/png/gif/bmp/webp)
- 🔍 **Image OCR**: Upload contract photos — the vision model extracts text automatically
- 🖼️ **Embedded image recognition**: Automatically extracts and OCRs images inside PDF/Word files (works with scanned contracts)
- ⚖️ **Professional legal risk analysis**: Identifies parties, rights & obligations, breach clauses, dispute resolution, and potential risks
- 🎯 **Risk grading**: High / Medium / Low levels with per-item suggestions
- 💾 **History**: Supabase-backed record storage (optional)
- 🏠 **Fully local**: Uses Ollama local models — your data never leaves your machine

### 🧠 How It Works

```
┌─────────────┐
│  Upload     │  txt / pdf / docx / image
└──────┬──────┘
       ▼
┌─────────────────────────────────────────┐
│  File Parser (file_parser.py)           │
│  · Documents → text + embedded images   │
│  · Images → used as visual input        │
└──────┬──────────────────────────────────┘
       ▼
┌─────────────────────────────────────────┐
│  Vision OCR (minicpm-v)                 │  ← Only "reads" images
│  · Images / scanned pages → plain text  │
└──────┬──────────────────────────────────┘
       ▼
┌─────────────────────────────────────────┐
│  Text Analysis (qwen2.5)                │  ← Does the legal reasoning
│  · Combined text → risk report (JSON)   │
└──────┬──────────────────────────────────┘
       ▼
┌─────────────────────────────────────────┐
│  Frontend (React + Tailwind)            │
│  · Risk level, risk items, suggestions  │
└─────────────────────────────────────────┘
```

**Key design**: The vision model (minicpm-v) only does OCR to turn images into text; all legal analysis is handled by the text model (qwen2.5) — clear separation of concerns for higher quality.

### 📁 Project Structure

```
法律/
├── backend/                    # Backend - FastAPI
│   ├── api/index.py            # API routes (/api/analyze, etc.)
│   ├── services/
│   │   ├── ai_service.py       # AI calls (text analysis + image OCR)
│   │   ├── file_parser.py      # File parsing (text + image extraction)
│   │   └── supabase_client.py  # Supabase client
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # Frontend - React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/              # Pages (Home / History)
│   │   ├── components/         # Components (Upload / Report / History)
│   │   └── api/client.js       # API client
│   └── package.json
├── supabase_init.sql           # Database init SQL
└── 启动.bat                    # Windows one-click launcher
```

### 🚀 Quick Start

#### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **[Ollama](https://ollama.com)** installed and running

#### 1. Pull AI Models

```bash
# Text model (legal analysis)
ollama pull qwen2.5:3b

# Vision model (image OCR)
ollama pull minicpm-v4.6:latest
```

#### 2. One-click Launch (Windows)

Double-click:

```
启动.bat
```

The script automatically: checks environment → installs dependencies → starts backend (port 8000) → starts frontend (port 3000) → opens the browser.

#### 3. Manual Launch

**Backend:**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env      # Edit as needed
python -m uvicorn api.index:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env      # Edit API URL if needed
npm run dev
```

Open http://localhost:3000 to use the app.

### ⚙️ Configuration

#### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `LEGAL_MODEL_BASE_URL` | Ollama API URL | `http://localhost:11434/v1` |
| `LEGAL_MODEL_NAME` | Text model name (legal analysis) | `qwen2.5:3b` |
| `LEGAL_VISION_MODEL_NAME` | Vision model name (OCR) | `minicpm-v4.6:latest` |
| `LEGAL_MODEL_API_KEY` | API key (any value for Ollama) | `ollama` |
| `SUPABASE_URL` | Supabase project URL (optional) | — |
| `SUPABASE_KEY` | Supabase key (optional) | — |

> 💡 When Supabase is not configured, history features are automatically disabled, but analysis still works.

#### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

### 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze` | Upload file and analyze (core endpoint) |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/history/{user_id}` | Query history |
| `GET` | `/api/record/{record_id}` | Query a single record |
| `GET` | `/docs` | Swagger API docs |

### 📦 Deployment

Both frontend and backend support **Vercel** deployment:

- **Backend**: FastAPI + Mangum, `vercel.json` included
- **Frontend**: Vite static build, deploy `dist/` after `npm run build`
- Configure environment variables in the Vercel dashboard

> ⚠️ After deploying to the cloud, point the AI model to an accessible remote URL (update `LEGAL_MODEL_BASE_URL`).

---

<div align="center">

<sub>Built with FastAPI · React · Vite · Tailwind CSS · Ollama · Supabase</sub>

</div>
