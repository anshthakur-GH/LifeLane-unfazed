𝐋𝐢𝐟𝐞𝐋𝐚𝐧𝐞

𝗣𝗿𝗼𝗷𝗲𝗰𝘁 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: 
LifeLane is a digital emergency response platform enabling users to transform their private vehicles into emergency transport by requesting verified siren activation codes. The platform features a user dashboard, emergency request form, admin panel for manual approval, and an AI-powered chatbot assistant.

𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
- Submit emergency requests with patient information
- Admin approval and secure one-time siren code generation
- User dashboard for request history and code status
- AI chatbot assistant (intent-based, OpenRouter fallback)
- Backend data storage in JSON files

𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲𝘀 𝗨𝘀𝗲𝗱
- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- AI: OpenRouter API (DeepSeek model)
- Hosting: Render
- Data: JSON file-based storage (`chatbot_intents.json`, `emergency_requests.json`)

𝗜𝗻𝘀𝘁𝗮𝗹𝗹𝗮𝘁𝗶𝗼𝗻 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀
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

𝗔𝗣𝗜 𝗞𝗲𝘆𝘀 𝗦𝗲𝘁𝘂𝗽
- Create a `.env` file in the root and `server/` directories as needed.
- Add your OpenRouter API key:
  ```env
  OPENROUTER_API_KEY=your_openrouter_api_key
  ```
- Add any other required environment variables (see code for details).

𝗥𝘂𝗻𝗻𝗶𝗻𝗴 𝘁𝗵𝗲 𝗣𝗿𝗼𝗷𝗲𝗰𝘁 𝗟𝗼𝗰𝗮𝗹𝗹𝘆
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the backend server:
   ```bash
   npm start
   ```
3. Access the app at [http://localhost:10000](http://localhost:10000)

𝗗𝗲𝗽𝗹𝗼𝘆𝗺𝗲𝗻𝘁 𝗜𝗻𝗳𝗼
- Deployed on [Render]((https://lifelane-unfazed.onrender.com/))
- Configuration files: `render.yaml`, `Procfile`

