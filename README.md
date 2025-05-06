# Personal Trainer App

<div align="center">
  <br />
  <p>
    <a href="https://github.com/skeesen8/PersonalTrainerApp"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://personal-trainer-app-topaz.vercel.app/login">Visit Live Webpage></strong></a>
    <br />
    <a href="https://github.com/skeesen8/PersonalTrainerApp/issues">Report Bug</a>
    ·
    <a href="https://github.com/skeesen8/PersonalTrainerApp/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

A full-stack web application for managing workout plans and meal plans, built with modern web technologies. This application helps personal trainers and their clients manage fitness programs, track progress, and maintain healthy lifestyles by allowing personal trainers to create meal plans anf workout programs that then show up in their client portals respectivly.  Admin access allows coachs to manage their clients and client access allows users to see their workout and meal plans on a daily schedule.  

Feel free to create a user or admin and play around with the functionality. To create an admin use code admin123 when prompted.  

Key Features:
* User authentication and authorization
* Admin dashboard for managing workout and meal plans
* Admins are only able to see the users they created or that are assigned to them
* User dashboard for viewing assigned plans
* Workout plan management
* Responsive design with Material-UI
* Real-time progress tracking

### Built With

* Frontend:
  * React
  * TypeScript
  * Material-UI
  * React Router
  * Axios
  * Tailwind CSS

* Backend:
  * FastAPI
  * SQLAlchemy
  * Pydantic
  * JWT Authentication
  * PostgreSQL
  * OpenAI API

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* Python (v3.8 or higher)
* npm or yarn
* PostgreSQL
* OpenAI API key

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
   ```

3. Frontend Setup
   ```bash
   cd frontend
   npm install
   ```

4. Environment Variables
   Create a `.env` file in the backend directory:
   ```
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   OPENAI_API_KEY=your_openai_api_key
   ```

5. Start the Application
   ```bash
   # Start backend
   cd backend
   uvicorn main:app --reload

   # Start frontend
   cd frontend
   npm start
   ```

The application will be available at:
* Frontend: http://localhost:3000
* Backend API: http://localhost:8000

## Usage

1. Register as a trainer or client
2. Trainers can create and manage workout/meal plans
3. Clients can view their assigned plans and track progress
4. Use the admin dashboard to manage users and plans
5. Generate personalized meal plans using AI

For more examples, please refer to the [Documentation](https://github.com/skeesen8/PersonalTrainerApp/wiki)

## Roadmap

- [ ] Add mobile app support
- [ ] Implement real-time chat between trainers and clients
- [ ] Add video call integration for virtual training sessions
- [ ] Integrate with fitness tracking devices
- [ ] Add progress photo tracking
- [ ] Implement advanced analytics dashboard
- [ ] Add multi-language support

See the [open issues](https://github.com/skeesen8/PersonalTrainerApp/issues) for a full list of proposed features and known issues.

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/skeesen8/PersonalTrainerApp](https://github.com/skeesen8/PersonalTrainerApp)

## Acknowledgments

* [FastAPI](https://fastapi.tiangolo.com/)
* [React](https://reactjs.org/)
* [Material-UI](https://mui.com/)
* [OpenAI](https://openai.com/)
* [Railway](https://railway.app/)
* [PostgreSQL](https://www.postgresql.org/) 