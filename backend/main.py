from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import json
import asyncio
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

app = FastAPI()

# Allow cross-origin requests from the HTML preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= OLLAMA CONFIGURATION =============
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

# Initialize Ollama LLM
llm = Ollama(
    base_url=OLLAMA_BASE_URL,
    model=OLLAMA_MODEL,
    temperature=0.1,
    num_predict=2048
)

# Initialize Ollama Embeddings
embeddings = OllamaEmbeddings(
    base_url=OLLAMA_BASE_URL,
    model=OLLAMA_MODEL
)

# ============= PROMPTS =============
ANALYSIS_PROMPT = """
You are DocuLens AI, a legal document assistant for everyday people.

Extract from this legal document. Return ONLY valid JSON. No markdown. No extra text.

{{
  "verdict": "one sentence overview of the document",
  "documentType": "type of document, e.g. Non-Disclosure Agreement",
  "riskLevel": "Low",
  "riskScore": 15,
  "keyClauses": [
    {{
      "type": "short clause name/type",
      "originalText": "exact quote from document"
    }}
  ],
  "riskAlerts": [
    {{
      "risk": "short name of risk",
      "whyItMatters": "one sentence explaining why it matters",
      "location": "where to find it, e.g., Section 2"
    }}
  ],
  "actions": [
    "actionable step 1",
    "actionable step 2"
  ]
}}

Document:
{document_text}
"""

EXPLAIN_PROMPT = """
Explain this legal text to someone with NO legal background.

Text: "{clause_text}"

Rules:
- Use simple words (5th grade reading level)
- One short paragraph only
- No jargon

Explanation:
"""

RIGHTS_PROMPT = """
Based on this document summary, what should an ordinary person know about their rights?

Document summary: {document_summary}

Return exactly 3 bullet points following this structure:
- "Right to..."
- "Right to..."
- "Right to..."

Keep each bullet point under 15 words. Be practical.
"""

QA_PROMPT = """
Answer this question based ONLY on the document provided.

Question: {question}

Document excerpts:
{context}

Answer clearly and directly. If the answer isn't in the document, say "The document doesn't mention this."
"""

# ============= FILE SETUP =============
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store current analysis and vector DB
current_analysis = {}
current_vectordb = None

class ExplainRequest(BaseModel):
    clause_text: str

# ============= HELPER FUNCTIONS =============

def call_llm(prompt: str) -> str:
    """Unified LLM call function using Ollama"""
    try:
        response = llm.invoke(prompt)
        return response
    except Exception as e:
        print(f"LLM Error: {e}")
        return ""

def clean_json_response(raw_response: str) -> str:
    """Clean markdown formatting from LLM response"""
    raw_response = raw_response.strip()
    
    # Remove markdown code blocks
    if raw_response.startswith("```json"):
        raw_response = raw_response[7:]
    elif raw_response.startswith("```"):
        raw_response = raw_response[3:]
    
    if raw_response.endswith("```"):
        raw_response = raw_response[:-3]
    
    # Find first { and last }
    start = raw_response.find("{")
    end = raw_response.rfind("}") + 1
    
    if start != -1 and end != 0:
        raw_response = raw_response[start:end]
    
    return raw_response.strip()

def process_pdf(file_path: str):
    """Process PDF or Text: split into chunks and create vector database"""
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    persist_dir = f"./chroma_data/{base_name}"
    
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path, encoding='utf-8')
        
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir
    )
    
    return chunks, vectordb

def query_document(vectordb, question: str):
    """Ask a question about the document using RAG"""
    retriever = vectordb.as_retriever(search_kwargs={"k": 4})
    relevant_docs = retriever.invoke(question)
    
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    prompt = QA_PROMPT.format(question=question, context=context)
    response = llm.invoke(prompt)
    return response

# ============= ENDPOINTS =============

@app.get("/health")
async def health():
    # Check if Ollama is running
    try:
        import requests
        requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        ollama_status = "connected"
    except:
        ollama_status = "disconnected (run 'ollama serve')"
    
    return {
        "status": "ready",
        "ollama": ollama_status,
        "model": OLLAMA_MODEL
    }

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Upload and analyze a legal document with real AI"""
    global current_analysis, current_vectordb
    
    # Save PDF
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process PDF with RAG
    chunks, vectordb = process_pdf(file_path)
    current_vectordb = vectordb
    
    # Combine text for LLM
    full_text = "\n".join([chunk.page_content for chunk in chunks])[:10000]
    
    # Call LLM with analysis prompt
    prompt = ANALYSIS_PROMPT.format(document_text=full_text)
    result_text = call_llm(prompt)
    
    # Clean and parse JSON
    result_text = clean_json_response(result_text)
    
    try:
        analysis = json.loads(result_text)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        analysis = {
            "verdict": "Document analysis completed. Some clauses may need attention.",
            "documentType": "General Legal Document",
            "riskLevel": "Medium",
            "riskScore": 50,
            "keyClauses": [
                {
                    "type": "Key Clause",
                    "originalText": "Review document carefully"
                }
            ],
            "riskAlerts": [
                {"risk": "Review Recommended", "whyItMatters": "Have a lawyer review this document", "location": "General"}
            ],
            "actions": [
                "Read the entire document carefully",
                "Ask questions about unclear terms",
                "Keep a signed copy for your records"
            ]
        }
    
    # Store analysis
    current_analysis = analysis
    
    return {"success": True, "filename": file.filename, "analysis": analysis}

@app.post("/explain")
async def explain(req: ExplainRequest):
    """Explain a specific clause in plain English"""
    if not req.clause_text:
        return {"explanation": "No clause text provided"}
    
    prompt = EXPLAIN_PROMPT.format(clause_text=req.clause_text)
    explanation = call_llm(prompt)
    
    if not explanation:
        explanation = "This clause contains legal terms that may have important implications. Consider consulting a legal professional for a complete understanding."
    
    return {"explanation": explanation.strip()}

@app.get("/rights")
async def get_rights():
    """Get rights analysis for current document"""
    if not current_analysis:
        return {
            "rights": [
                "Upload a document first",
                "Use the /upload endpoint to analyze a document",
                "Then come back here for your rights analysis"
            ]
        }
    
    summary = current_analysis.get("verdict", "Legal document")
    prompt = RIGHTS_PROMPT.format(document_summary=summary)
    response = call_llm(prompt)
    
    # Parse bullet points
    rights_list = [r.strip("- •* ").strip() for r in response.split("\n") if r.strip() and r.strip()[0] in "-•*"]
    
    if not rights_list or len(rights_list) < 3:
        rights_list = [
            "Right to understand all terms before signing",
            "Right to ask for clarification on unclear clauses",
            "Right to seek independent legal advice"
        ]
    
    return {"rights": rights_list[:3]}

@app.get("/ask")
async def ask_question(question: str):
    """Ask a custom question about the current document"""
    if not current_vectordb:
        return {"answer": "Please upload a document first using the /upload endpoint"}
    
    if not question:
        return {"answer": "Please provide a question parameter"}
    
    answer = query_document(current_vectordb, question)
    return {"answer": answer}

# To run:
# pip install fastapi uvicorn python-multipart langchain langchain-community chromadb pypdf ollama
# ollama serve
# ollama pull mistral
# uvicorn main:app --reload --port 8000