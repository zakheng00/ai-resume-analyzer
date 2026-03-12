"""
FastAPI server for PDF parsing and text extraction
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from .pdf_processor import PDFProcessor
from .utils import normalize_text

load_dotenv()

app = FastAPI(title="Resume Parser Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_processor = PDFProcessor()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "OK"}


@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse PDF file and extract text
    
    Args:
        file: PDF file uploaded by client
        
    Returns:
        JSON with extracted text and metadata
    """
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        text = pdf_processor.extract_text(content)
        
        # Normalize and clean text
        normalized_text = normalize_text(text)
        
        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": normalized_text,
            "text_length": len(normalized_text),
            "page_count": pdf_processor.get_page_count(content),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Alternative endpoint for text extraction
    """
    try:
        content = await file.read()
        text = pdf_processor.extract_text(content)
        return {
            "success": True,
            "text": text,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
