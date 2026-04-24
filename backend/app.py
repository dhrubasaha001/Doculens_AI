from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
import json
from openai import OpenAI
from rag import process_pdf
from prompts import ANALYSIS_PROMPT, EXPLAIN_PROMPT, YOUR_RIGHTS_PROMPT,FIX_JSON_PROMPT

app = FastAPI(title="DocuLens AI", description="Understand legal documents instantly")

# Allow frontend to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store latest analysis globally (simplified for demo)
current_analysis = {}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and analyze a legal document"""
    global current_analysis
    
    # Save PDF
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process with RAG
    chunks, vectordb = process_pdf(file_path)
    
    # Combine text for LLM (limit to ~8000 tokens)
    full_text = "\n".join([chunk.page_content for chunk in chunks])[:10000]
    
    # Call LLM
    prompt = ANALYSIS_PROMPT.format(document_text=full_text)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    
    # Parse JSON
    result_text = response.choices[0].message.content
    # Clean markdown if present
    if result_text.startswith("```json"):
        result_text = result_text[7:-3]
    elif result_text.startswith("```"):
        result_text = result_text[3:-3]
    
    result_json = json.loads(result_text)
    
    # After parsing fails
    if not result_json or "keyClauses" not in result_json:
        # Call fix prompt
        fix_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": FIX_JSON_PROMPT.format(raw_output=result_text)}],
            temperature=0
        )
        result_json = json.loads(fix_response.choices[0].message.content)
    
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
    clause_text = request.get("clause_text", "")
    if not clause_text:
        return {"explanation": "No clause text provided"}
    
    prompt = EXPLAIN_PROMPT.format(clause_text=clause_text)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    
    return {"explanation": response.choices[0].message.content}

@app.get("/rights")
async def get_rights():
    if not current_analysis.get("result"):
        return {"rights": ["Upload a document first"]}
    
    summary = json.dumps(current_analysis["result"])[:2000]
    prompt = YOUR_RIGHTS_PROMPT.format(document_summary=summary)
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    rights_text = response.choices[0].message.content
    rights_list = [r.strip("- ").strip() for r in rights_text.split("\n") if r.strip()]
    
    return {"rights": rights_list}

@app.get("/ask")
async def ask_question(question: str):
    if not current_analysis.get("vectordb"):
        return {"answer": "Please upload a document first"}
    
    from rag import query_document
    answer = query_document(current_analysis["vectordb"], question)
    return {"answer": answer}

@app.get("/health")
async def health():
    return {"status": "DocuLens AI is ready", "message": "Upload a legal document to /upload"}