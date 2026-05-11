# Proposal Review Platform

A full-stack web application for submitting, reviewing, and evaluating proposals. Built with React (Vite) + Tailwind CSS on the frontend and Python Flask on the backend.

## Project Structure

- **client/** — React frontend (Vite + Tailwind CSS)
- **server/** — Python Flask backend API
- **database/** — SQLite database (auto-created at runtime)

## Getting Started

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## User Roles

- **Submitter** — Upload proposals, track status, view feedback
- **Reviewer** — Evaluate proposals, assign grades, manage reviews
