"""
PDF processing module using pdfplumber
Handles PDF text extraction and document processing
"""

import io
import pdfplumber


class PDFProcessor:
    """Class for processing PDF files"""
    
    def __init__(self):
        """Initialize PDF processor"""
        pass
    
    def extract_text(self, pdf_content: bytes) -> str:
        """
        Extract text from PDF content
        
        Args:
            pdf_content: Binary content of PDF file
            
        Returns:
            Extracted text from all pages
        """
        try:
            # Open PDF from bytes
            pdf_file = io.BytesIO(pdf_content)
            
            extracted_text = []
            
            # Extract text from each page
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text.append(text)
            
            # Join all pages with page separator
            return "\n--- PAGE BREAK ---\n".join(extracted_text)
        
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def get_page_count(self, pdf_content: bytes) -> int:
        """
        Get total number of pages in PDF
        
        Args:
            pdf_content: Binary content of PDF file
            
        Returns:
            Number of pages
        """
        try:
            pdf_file = io.BytesIO(pdf_content)
            with pdfplumber.open(pdf_file) as pdf:
                page_count = len(pdf.pages)
            return page_count
        except Exception as e:
            raise Exception(f"Error getting page count: {str(e)}")
    
    def extract_metadata(self, pdf_content: bytes) -> dict:
        """
        Extract metadata from PDF
        
        Args:
            pdf_content: Binary content of PDF file
            
        Returns:
            Dictionary with PDF metadata
        """
        try:
            pdf_file = io.BytesIO(pdf_content)
            with pdfplumber.open(pdf_file) as pdf:
                metadata = pdf.metadata or {}
            return metadata
        except Exception as e:
            raise Exception(f"Error extracting metadata: {str(e)}")
