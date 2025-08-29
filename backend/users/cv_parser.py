import spacy
import pdfplumber

# Load spaCy model (you can use 'en_core_web_sm' or a larger model)
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:  # avoid None
                text += page_text + "\n"
    return text


def compare_cv_with_skills(cv_text, required_skills):
    found_skills = []
    text_lower = cv_text.lower()
    
    for skill in required_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills)) 
