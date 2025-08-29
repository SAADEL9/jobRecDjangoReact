import re
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from users.cv_parser import extract_text_from_pdf
from .models import Job
from users.models import User

# Load English NLP model once
nlp = spacy.load("en_core_web_sm")

# --- Utility Functions ---

def extract_skills(text: str):
    """
    Extract skills from text using simple delimiters.
    """
    if not text:
        return []
    text = text.lower()
    skills = re.split(r",|;|\n|\.", text)
    return [s.strip() for s in skills if s.strip()]


def compute_skill_match(user_skills, job_skills):
    """
    Compute skill overlap ratio between user and job.
    """
    user_skills, job_skills = set(user_skills), set(job_skills)
    return len(user_skills & job_skills) / len(job_skills) if job_skills else 0


# --- Recommendation Function ---

def get_job_recommendations(user: User, top_n: int = 5):
    """
    Recommend jobs for a given user based on CV, bio, and hybrid scoring
    (TF-IDF cosine similarity + skill overlap).
    """
    print(f"--- Starting recommendations for user: {user.email} ---")

    # 1. Build user profile (CV + bio)
    user_profile_text = ""

    if getattr(user, "cv", None):
        try:
            cv_text = extract_text_from_pdf(user.cv.path)
            user_profile_text += cv_text
            print("✅ Extracted text from CV")
        except Exception as e:
            print(f"⚠️ Error reading CV for user {user.id}: {e}")

    if getattr(user, "bio", None):
        user_profile_text += " " + user.bio
        print("✅ Added bio to profile")

    if not user_profile_text.strip():
        print("⚠️ User profile is empty (no CV or bio). Returning []")
        return []

    # Extract candidate skills
    user_skills = extract_skills(user_profile_text)

    # 2. Get active jobs
    active_jobs = Job.objects.filter(is_active=True)
    if not active_jobs.exists():
        print("⚠️ No active jobs found")
        return []

    print(f"Found {active_jobs.count()} active jobs")

    # 3. Build corpus of job descriptions
    job_texts = [
        f"{job.title} {job.description or ''} {job.requirements or ''} {job.skills_required or ''}"
        for job in active_jobs
    ]

    # 4. Compute TF-IDF similarity
    documents = [user_profile_text] + job_texts
    tfidf_vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

    # 5. Compute hybrid score (cosine + skill overlap)
    scored_jobs = []
    for idx, job in enumerate(active_jobs):
        job_skills = extract_skills(job.skills_required or "")
        skill_overlap = compute_skill_match(user_skills, job_skills)

        # Skip jobs with too little skill match
        if skill_overlap < 0.5:
            continue

        final_score = 0.7 * cosine_sim[idx] + 0.3 * skill_overlap
        scored_jobs.append({
            "job": job,
            "cosine_score": float(cosine_sim[idx]),
            "skill_overlap": skill_overlap,
            "final_score": final_score,
        })

    # 6. Sort and return top N jobs
    scored_jobs.sort(key=lambda x: x["final_score"], reverse=True)
    recommendations = [entry["job"] for entry in scored_jobs[:top_n]]

    print(f"✅ Found {len(recommendations)} recommendations")
    return recommendations
