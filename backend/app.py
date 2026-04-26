from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
import json
import re
from rag import process_pdf
from prompts import ANALYSIS_PROMPT, EXPLAIN_PROMPT, YOUR_RIGHTS_PROMPT, FIX_JSON_PROMPT
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings

app = FastAPI(title="DocuLens AI", description="Understand legal documents instantly")

# Allow frontend to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Initialize Ollama Embeddings (for ChromaDB)
embeddings = OllamaEmbeddings(
    base_url=OLLAMA_BASE_URL,
    model=OLLAMA_MODEL
)

# Override embeddings in rag.py (optional, rag.py can use its own)
import rag
rag.embeddings = embeddings
rag.llm = llm

# ============= FILE UPLOAD SETUP =============
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store latest analysis globally (simplified for demo)
current_analysis = {}

# ============= HELPER FUNCTION =============
def call_llm(prompt: str) -> str:
    """Unified LLM call function using Ollama"""
    try:
        response = llm.invoke(prompt)
        return response
    except Exception as e:
        print(f"LLM Error: {e}")
        return json.dumps({
            "documentType": "Other",
            "riskLevel": "Medium",
            "keyClauses": [],
            "riskAlerts": [],
            "verdict": "Review carefully"
        })

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

# ============= ENDPOINTS =============

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and analyze a legal document"""
    global current_analysis
    
    # Save PDF
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process with RAG
    chunks, vectordb = rag.process_pdf(file_path)
    
    # Combine text for LLM (limit to ~8000 tokens)
    full_text = "\n".join([chunk.page_content for chunk in chunks])[:10000]
    
    # Call LLM with analysis prompt
    prompt = ANALYSIS_PROMPT.format(document_text=full_text)
    result_text = call_llm(prompt)
    
    # Clean JSON
    result_text = clean_json_response(result_text)
    
    # Parse JSON
    try:
        result_json = json.loads(result_text)
    except json.JSONDecodeError:
        # Try to fix with FIX_JSON_PROMPT
        fix_prompt = FIX_JSON_PROMPT.format(raw_output=result_text)
        fixed_response = call_llm(fix_prompt)
        fixed_response = clean_json_response(fixed_response)
        result_json = json.loads(fixed_response)
    
    # Ensure required fields exist
    if "keyClauses" not in result_json:
        result_json["keyClauses"] = []
    if "riskAlerts" not in result_json:
        result_json["riskAlerts"] = []
    if "verdict" not in result_json:
        result_json["verdict"] = "Review carefully"
    if "riskLevel" not in result_json:
        result_json["riskLevel"] = "Medium"
    if "documentType" not in result_json:
        result_json["documentType"] = "Other"
    
    # Store for later queries
    current_analysis = {
        "result": result_json,
        "vectordb": vectordb,
        "filename": file.filename
    }
    
    return JSONResponse(content={
        "success": True,
        "filename": file.filename,
        "analysis": result_json
    })

@app.post("/explain")
async def explain_clause(request: dict):
    """Explain a legal clause in plain English"""
    clause_text = request.get("clause_text", "")
    if not clause_text:
        return {"explanation": "No clause text provided"}
    
    prompt = EXPLAIN_PROMPT.format(clause_text=clause_text)
    response = call_llm(prompt)
    
    return {"explanation": response.strip()}

@app.get("/rights")
async def get_rights():
    """Get 'Your Rights' analysis for current document"""
    if not current_analysis.get("result"):
        return {"rights": ["Upload a document first"]}
    
    summary = json.dumps(current_analysis["result"])[:2000]
    prompt = YOUR_RIGHTS_PROMPT.format(document_summary=summary)
    response = call_llm(prompt)
    
    # Parse bullet points
    rights_list = [r.strip("- •* ").strip() for r in response.split("\n") if r.strip() and r.strip()[0] in "-•*"]
    if not rights_list:
        rights_list = ["You should be aware that this document has legal implications",
                       "You may want to consult someone who understands legal terms",
                       "This document does not explain all potential consequences"]
    
    return {"rights": rights_list[:3]}  # Return max 3 rights

@app.get("/ask")
async def ask_question(question: str):
    """Ask a custom question about the current document"""
    if not current_analysis.get("vectordb"):
        return {"answer": "Please upload a document first"}
    
    answer = rag.query_document(current_analysis["vectordb"], question)
    return {"answer": answer}

@app.get("/health")
async def health():
    """Health check endpoint"""
    # Check if Ollama is running
    try:
        import requests
        requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        ollama_status = "connected"
    except:
        ollama_status = "disconnected"
    
    return {
        "status": "DocuLens AI is ready",
        "ollama": ollama_status,
        "model": OLLAMA_MODEL,
        "message": "Upload a legal document to /upload"
    }

@app.get("/models")
async def list_models():
    """List available Ollama models"""
    try:
        import requests
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        models = response.json().get("models", [])
        return {"models": [m["name"] for m in models]}
    except:
        return {"error": "Cannot connect to Ollama", "models": []}