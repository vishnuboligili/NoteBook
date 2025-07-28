# Notebook - Secure Note-Taking Platform

Notebook is a secure, full-featured note-taking platform built with the MERN stack. It offers robust features for managing, securing, and organizing your notes, making it an ideal tool for both personal and professional use.


## Features

- Secure User Authentication: Register and login with secure authentication to protect your notes.
- Note Management: Easily create, update, and delete notes.
- Export Options: Export your notes as PDF or TXT files for sharing or backup.
- Clipboard Copy: Copy notes directly to your clipboard with a single click.
- File Import: Import notes seamlessly from TXT files.
- Advanced Search & Sorting: Quickly find and organize notes with powerful search and sorting tools.
- Checklist Functionality: Create and manage tasks within your notes using checklists.
- AI-Powered Summarization: Summarize note content using Generative AI (Google Gemini API) for quick understanding.
- Text-to-Speech Support: Convert summarized notes to speech for hands-free accessibility.

## Technologies Used

**Client:** React, Redux, TailwindCSS, Axios

**Server:** Node, Express

**Database:** MongoDB


## Installation

### Clone the Repository
```bash
 git clone https://github.com/AnilKumar171/Notebook.git
 cd notebook
```
### Backend Setup
- Navigate to the backend directory:

    ```bash
    cd backend
    ```
- Install the required dependencies:
    ```bash
    npm install
    ```
- Create a .env file in the backend directory and add your environment variables:
    ```bash
    MONGO_URI=<your_mongo_db_connection_string>
    JWT_SECRET=<your_jwt_secret_key>
    PORT=5000
    DB_NAME=<your_database_name>
    CORS_ORIGIN=<cors_origin>
    ```
- Start the backend server
    ```bash
    npm run dev
    ```

### Frontend Setup
- Navigate to the frontend directory:

    ```bash
    cd frontend
    ```
- Install the required dependencies:

    ```bash
    npm install
    ```
- Create a .env file in the frontend directory and add your environment variables:
    ```bash
    VITE_APP_CONTACT_URL=<contact form url>
    VITE_APP_API_KEY=http://localhost:5000/api
    ```
- Start the frontend development server:
    ```bash
    npm run dev
    ```

### Running the Application
- Ensure both the frontend and backend servers are running.
- Open your browser and navigate to http://localhost:5173.
