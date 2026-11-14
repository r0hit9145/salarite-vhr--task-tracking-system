# Virtual HR + ATS Mini Dashboard

A small web app where an employer assigns hiring tasks to a Virtual HR, the Virtual HR updates progress and schedules interviews, and the employer watches everything update live.

# Live demo: https://salarite-vhr-task-tracking-system.onrender.com/login

# What it does
Employer creates tasks and assigns them to the Virtual HR (e.g. "Shortlist 5 candidates for Backend Developer").

# Virtual HR updates task status (Pending → In Progress → Done) and schedules interviews.
Interview modes: Voice, Video or Chat (calling is a placeholder, no real call is made).
Live view: the employer dashboard refreshes automatically, so progress shows up without reloading the page.

# Tech stack
Backend: FastAPI (Python) + SQLite
Frontend: React
Real-time: auto-refresh (polling every few seconds)
Deployment: Docker, single service on Render/Railway, where FastAPI also serves the built React app

# Demo credentials
Role	Email / Username	Password
Employer	<employer_username>	<password>
Virtual HR	<hr_username>	<password>

# Note 
These users are created by the seed script.

# Run it locally

You need Python 3.10+ and Node.js 18+.

# 1. Clone the repo

bash
git clone <YOUR_REPO_URL>
cd <repo-folder>

# 2. Build the frontend

bash
cd frontend
npm install
npm run build
cd ..

# 3. Start the backend

bash
cd backend
python -m venv envir
source envir/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # creates the database and demo users
uvicorn main:app --reload

# 4. Open the app

App: http://localhost:8000
API docs: http://localhost:8000/docs

# Project structure
backend/     FastAPI app, database models, seed script
frontend/    React app (dashboard UI)
README.md

# Deployment
Deployed as one service. The build step installs and builds the frontend, then FastAPI serves it.

Build command: cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
Start command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT

# Notes
The calling feature is a placeholder only.
SQLite is used for simplicity; on free hosting the data may reset when the service restarts, so the seed script re-creates the demo data.