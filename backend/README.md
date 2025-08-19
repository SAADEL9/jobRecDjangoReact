# Job Board Backend

This is the Django REST Framework backend for the Job Board application. It provides a RESTful API for managing job postings, applications, and user authentication.

## Features

- User authentication with JWT (JSON Web Tokens)
- User roles: Candidate and Recruiter
- Job postings management
- Job applications system
- Saved jobs functionality
- File uploads for resumes and profile pictures
- RESTful API endpoints

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- SQLite (included with Python)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` as needed

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000/api/`
   The admin interface will be available at `http://localhost:8000/admin/`

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/update/` - Update profile
- `POST /api/auth/change-password/` - Change password

### Jobs

- `GET /api/jobs/` - List all jobs
- `POST /api/jobs/` - Create a new job (Recruiter only)
- `GET /api/jobs/<id>/` - Get job details
- `PUT /api/jobs/<id>/` - Update job (Owner only)
- `DELETE /api/jobs/<id>/` - Delete job (Owner only)

### Applications

- `GET /api/jobs/applications/` - List applications (User's applications or recruiter's posted jobs)
- `POST /api/jobs/applications/` - Apply to a job
- `GET /api/jobs/applications/<id>/` - Get application details
- `PUT /api/jobs/applications/<id>/` - Update application status (Recruiter only)

### Saved Jobs

- `GET /api/jobs/saved/` - List saved jobs
- `POST /api/jobs/saved/` - Save a job
- `DELETE /api/jobs/saved/<job_id>/` - Remove a saved job

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Django Settings
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME_DAYS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS Settings
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_CREDENTIALS=True

# Email Settings (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Media and Static
MEDIA_URL=/media/
STATIC_URL=/static/
```

## Running Tests

```bash
python manage.py test
```

## Deployment

For production deployment, consider using:
- Gunicorn or uWSGI as the application server
- Nginx as the reverse proxy
- PostgreSQL as the database
- Environment variables for sensitive information

## License

This project is licensed under the MIT License.
