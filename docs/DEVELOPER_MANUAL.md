The audience of this document is future developers who will take over your system.
They know technical terms and have general knowledge about web applications, but do not have knowledge about your system design.
You need to provide a technical document so that future developers can start setting up the application on their local machines, and keep working on the system development after you leave the team.
Installation
1. Clone the Repository
git clone https://github.com/jbui1234/INST377_Final.git
cd INST377_Final
2. Download Dependencies
 - Download Node.js if not previous installed
   - https://nodejs.org/en
  - After, install vercel for server deployment
    - npm install -g vercel
3. Server Deployment
  - Navigate to Vercel
  - Link your project to the cloned repo
  - Deploy but go to environmental settings and add
  - NEXT_PUBLIC_SUPABASE_URL= REPLACE WITH YOUR SUBAPASE URL
  - SUPABASE_SERVICE_ROLE_KEY= REPLACE WITH YOUR SUPABASE KEY
4. API Endpoints  
POST /api/save_game  
Input: { "title": "Game Name" }  
Action:  
Queries CheapShark API  
Extracts pricing info  
Inserts title, store, price into Supabase saved_games table

GET /api/saved_games  
Returns all entries in the Supabase table as JSON  
Used on the homepage to list saved deals  

How to run any tests you have written for your software
The API for your server application - all GET, POST, PATCH, etc endpoints, and what they each do
A clear set of expectations around known bugs and a road-map for future development.
