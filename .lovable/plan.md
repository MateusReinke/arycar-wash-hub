

# ARYCAR - Frontend do Sistema de Lava-Rápido

## Visão Geral
Frontend React + Vite + TypeScript para o sistema ARYCAR (lava-rápido), com tema **azul institucional** e preparado para conectar a uma API NestJS externa em `http://localhost:4000/api`. Sem dados mockados — as telas estarão prontas para consumir a API real.

## Design & Tema
- Paleta azul institucional (azul escuro primário, azul claro para acentos)
- Visual corporativo, limpo e confiável
- Sidebar com navegação principal
- Responsivo para uso em tablets/desktops no balcão do lava-rápido

## Arquitetura Frontend
- **Serviço API centralizado** com Axios apontando para `VITE_API_URL`
- **Hooks customizados** com TanStack Query para cada recurso (auth, work orders, customers, etc.)
- **Interceptor JWT** para access token + refresh automático
- **Proteção de rotas** — redireciona para login se não autenticado
- **Validação de placa** (Mercosul AAA0A00 e antiga AAA0000) com normalização automática

## Telas

### 1. Login
- Formulário de email + senha
- Integração com `POST /auth/login`
- Armazenamento de tokens JWT

### 2. Dashboard (Lista de Ordens de Serviço)
- Tabela com todas as OS
- Filtros por status (CREATED, IN_PROGRESS, READY, DELIVERED, CANCELLED)
- Busca por placa ou código da OS
- Badges coloridos por status
- Botão "Nova OS"

### 3. Nova OS (Wizard em etapas)
- **Etapa 1 — Veículo**: Campo de placa com validação BR, busca cliente existente por telefone
- **Etapa 2 — Serviços**: Seleção dos serviços do catálogo com quantidades
- **Etapa 3 — Cliente**: Telefone (obrigatório) + nome (opcional), criação automática se novo
- **Etapa 4 — Mídias de Entrada**: Upload de vídeos externos/internos e fotos de detalhe (multipart/form-data)
- Resumo e confirmação antes de criar

### 4. Detalhe da OS
- Cabeçalho com código, placa, status atual e dados do cliente
- **Timeline de eventos** (work_order_events) em ordem cronológica
- **Galeria de mídias** com URLs assinadas do MinIO
- **Botões de transição de status** respeitando as regras de fluxo:
  - CREATED → IN_PROGRESS (exige vídeos de entrada)
  - IN_PROGRESS → READY
  - READY → DELIVERED (exige vídeo de entrega)
  - CREATED → CANCELLED
- Campo de notas editável
- Indicador visual de notificações enviadas

### 5. Tela de Entrega
- Upload obrigatório do vídeo de entrega
- Preview do vídeo antes de confirmar
- Botão para marcar como DELIVERED

## Componentes Compartilhados
- **PlateInput**: Campo de placa com máscara, validação e normalização (uppercase, sem hífen/espaços)
- **StatusBadge**: Badge colorido por status da OS
- **MediaUploader**: Upload de arquivos com drag & drop e preview
- **StatusTimeline**: Visualização cronológica dos eventos da OS

## Navegação (Sidebar)
- Dashboard (Ordens de Serviço)
- Nova OS
- Clientes (listagem futura)
- Serviços (catálogo)
- Logo ARYCAR no topo

