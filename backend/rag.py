from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
import os

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

def process_pdf(file_path: str):
    """Process PDF: split into chunks and create vector database"""
    
    # Create unique folder for this PDF
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    persist_dir = f"./chroma_data/{base_name}"
    
    # Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(documents)
    
    # Create vector store (auto-persists)
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
    
    prompt = f"""Answer this question based ONLY on the document provided.

Question: {question}

Document excerpts:
{context}

Answer clearly and directly. If the answer isn't in the document, say "The document doesn't mention this."
"""
    
    response = llm.invoke(prompt)
    return response  # Ollama returns string directly, not .content