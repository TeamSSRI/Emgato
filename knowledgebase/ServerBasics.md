# :pencil: **Emgato Server Notes**

## :wrench: **Server Basics**

- **Environment**: Make sure you are in the project's root directory `~/Projects/emgato/`.

## :rocket: **Starting the Node.js Environment**

## :file_cabinet: **Ensuring MongoDB is Running**

- **Check MongoDB Status**: *** sudo systemctl status mongod***
- If MongoDB is not running, start it with:
  ```
  sudo systemctl start mongod
  ```
- **Enable MongoDB to Start on Boot**: ***sudo systemctl enable mongod***
- **MongoDB Shell**: To access the MongoDB shell: ***mongosh*** 


### :open_file_folder: **Starting the Backend**

Navigate to the backend directory: ***cd  ~/Projects/emgato/server/***
Type in the following command: ***npm run start***
- Protip: Use nodemon for hot-reloading during development:
  ```
  npm run dev
  ```
The backend server will run on port **5000**.


### :globe_with_meridians: **Starting the Frontend**

Navigate to the frontend directory: ***cd  ~/Projects/emgato/src/***
Start the frontend server: ***npm start***
The frontend will run on port **3000** by default. Access it at `http://localhost:3000`.

## :warning: **Important Details**

- **Environment Variables**:
- Ensure that the `.env` files in both `backend` and `frontend` directories are configured correctly. 

- **Project Structure**:
- **Backend**: ` ~/Projects/emgato/server/`
- **Frontend**: `~/Projects/emgato/server/`

- **Dependencies**:
- Always run `npm install` in both `backend` and `frontend` if new dependencies are added to `package.json`.
