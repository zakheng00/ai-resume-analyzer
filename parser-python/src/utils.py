"""
Utility functions for text processing and normalization
"""

import re


def normalize_text(text: str) -> str:
    """
    Clean and normalize extracted text
    
    Args:
        text: Raw extracted text
        
    Returns:
        Normalized text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep common punctuation
    text = re.sub(r'[^\w\s\-.,;:\'"()\n]', '', text)
    
    # Remove multiple newlines
    text = re.sub(r'\n\n+', '\n', text)
    
    return text.strip()


def extract_sections(text: str) -> dict:
    """
    Extract common resume sections from text
    
    Args:
        text: Resume text
        
    Returns:
        Dictionary of detected sections
    """
    sections = {
        'contact': None,
        'summary': None,
        'experience': None,
        'education': None,
        'skills': None,
        'certifications': None,
    }
    
    # TODO: Implement section detection logic
    # Use regex or NLP to identify resume sections
    
    return sections


def clean_whitespace(text: str) -> str:
    """
    Remove unnecessary whitespace
    
    Args:
        text: Input text
        
    Returns:
        Text with cleaned whitespace
    """
    lines = text.split('\n')
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    return '\n'.join(cleaned_lines)


def extract_emails(text: str) -> list:
    """
    Extract email addresses from text
    
    Args:
        text: Input text
        
    Returns:
        List of found email addresses
    """
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.findall(email_pattern, text)


def extract_phone_numbers(text: str) -> list:
    """
    Extract phone numbers from text
    
    Args:
        text: Input text
        
    Returns:
        List of found phone numbers
    """
    phone_pattern = r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b'
    matches = re.findall(phone_pattern, text)
    return ['-'.join(match) for match in matches]
