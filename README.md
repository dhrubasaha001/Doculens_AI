# DocuLens AI

DocuLens AI is an AI-powered legal document analysis tool designed for everyday people. It uses advanced RAG (Retrieval-Augmented Generation) and local LLMs to instantly isolate risks, summarize clauses, and suggest actionable next steps for contracts, agreements, and notices.

## Features

- 📄 **Instant PDF Analysis**: Upload any PDF document to receive a quick verdict on its contents and overall risk level.
- 🔍 **Key Clause Extraction**: Automatically identifies and highlights obligations, restrictions, and critical clauses.
- ⚠️ **Risk Identification**: Pinpoints specific risks within the document and explains why they matter in simple terms.
- 💬 **Interactive Q&A**: Ask custom questions about your document and get answers directly extracted from the text.
- ⚖️ **User Rights Summary**: Generates a practical, easy-to-understand list of your rights based on the document.
- ✨ **Plain English Explanations**: Select any complex legal clause to get a 5th-grade reading level explanation.

## Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for styling and glassmorphism UI)
- **Framer Motion** (for smooth animations and transitions)
- **Lucide React** (icons)

### Backend
- **FastAPI** (Python web framework)
- **LangChain** (for RAG and LLM orchestration)
- **Ollama** (local LLM inference with Mistral)
- **ChromaDB** (local vector database)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- [Ollama](https://ollama.ai/) installed locally

### Setup Ollama
1. Install Ollama and start the service:
   ```bash
   ollama serve
   ```
2. Pull the Mistral model:
   ```bash
   ollama pull mistral
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install fastapi uvicorn python-multipart langchain langchain-community chromadb pypdf ollama
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

## Usage
1. Upload a PDF document using the drag-and-drop interface.
2. Wait for the analysis to complete.
3. Review the summary, risks, and suggested actions.
4. Use the Q&A panel to ask any specific questions about the document.

## Disclaimer
DocuLens AI analyzes documents but does not constitute legal advice. Always consult with a qualified attorney for professional legal assistance.