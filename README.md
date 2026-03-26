# Anima - Your Anime Social Hub

Anima is a social application for anime enthusiasts. It allows users to track their favorite anime, share their thoughts, and connect with other fans.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm
*   A Firebase project

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/Project-Name.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by creating a `.env.local` file in the root of the project and adding the following:
    ```
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
    EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```

## Firebase Integration

This project uses Firebase for the following services:

*   **Firebase Authentication:** For user authentication (email/password).
*   **Cloud Firestore:** As the real-time NoSQL database for all app data.
*   **Firebase Storage:** for image/video file uploads.

The Firebase configuration is located in `lib/FirebaseConfig.ts`. The Firestore and Storage security rules are defined in `firestore.rules` and `storage.rules` respectively.

## Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   ├── anilist.ts
│   │   └── firebase.ts
│   ├── store/
│   └── types/
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Serves the production build locally.