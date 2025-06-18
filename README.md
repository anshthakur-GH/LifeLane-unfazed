LifeLane

Project Description
LifeLane is a digital emergency response platform enabling users to transform their private vehicles into emergency transport by requesting verified siren activation codes. The platform features a user dashboard, emergency request form, admin panel for manual approval, and an AI-powered chatbot assistant.

Features
- Submit emergency requests with patient information
- Admin approval and secure one-time siren code generation
- User dashboard for request history and code status
- AI chatbot assistant (intent-based, OpenRouter fallback)
- Backend data storage in JSON files

Technologies Used
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** OpenRouter API (DeepSeek model)
- **Hosting:** Render
- **Data:** JSON file-based storage (`chatbot_intents.json`, `emergency_requests.json`)

Installation Instructions
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <project-directory>
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd server && npm install
   ```

API Keys Setup
- Create a `.env` file in the root and `server/` directories as needed.
- Add your OpenRouter API key:
  ```env
  OPENROUTER_API_KEY=your_openrouter_api_key
  ```
- Add any other required environment variables (see code for details).

Running the Project Locally
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the backend server:
   ```bash
   npm start
   ```
3. Access the app at [http://localhost:10000](http://localhost:10000)

Deployment Info
- Deployed on [Render](https://render.com/)
- Configuration files: `render.yaml`, `Procfile`

