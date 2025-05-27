# Personal Trainer App

A full-stack web application for managing workout plans and meal plans, built with React, TypeScript, FastAPI, and Material-UI.

## Features

- User authentication and authorization
- Admin dashboard for managing workout and meal plans
- User dashboard for viewing assigned plans
- Workout plan management
- Meal plan management
- Responsive design with Material-UI

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite Database

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/skeesen8/PersonalTrainerApp.git
cd PersonalTrainerApp
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./sql_app.db
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

