[![Website Status](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](https://thehumorhub.com/)

# Humor Hub

Humor Hub is an all-in-one comedy platform designed to elevate your comedic creativity and streamline the process of finding performance opportunities. This platform combines various tools and features to assist comedians, writers, and performers in crafting and refining their material, discovering open mic events, and staying updated with the latest comedy news.

## Features

- **ComicBot**: Your AI-powered comedy assistant, helping you brainstorm, refine, and enhance your jokes and sketches.
- **Jokepad**: A cloud-synced comedy workshop for organizing and developing your comedic ideas. new events being added weekly with an autonomous pipeline coming soon!
- **Mic Finder**: A platform for discovering and sharing live performance stages for comedy, music, and poetry.
- **HumorHub API**: Access the latest news and trends to fuel your comedic material.

## Technologies Used

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Authentication**: Firebase Auth
- **Animations**: AOS (Animate on Scroll)
- **Deployment**: Vercel

## Getting Started

#### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:

   - \*\* git clone https://github.com/njwright92/humor-hub.git
     cd humor-hub

2. Install dependencies:

- \*\* npm install

3.  Set up Firebase Authentication:

Create a Firebase project.
Enable Email/Password authentication.
Copy your Firebase config and add it to your environment variables.

4. Run the development server:

- \*\* npm run dev

## Usage

- \*\* ComicBot: Access the AI assistant to help with your comedy writing.
- \*\* Jokepad: Use the workshop to organize and develop your jokes.
- \*\* Mic Finder: Discover open mic events and share your own.
- \*\* HumorHub News: Fetch the latest comedy news for fresh material.

## Dependencies

{
"name": "humorhub",
"version": "0.1.0",
"private": true,
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint"
},
"dependencies": {
"@googlemaps/js-api-loader": "1.16.2",
"@googlemaps/markerclusterer": "2.5.3",
"@heroicons/react": "2.1.1",
"@next/third-parties": "14.2.3",
"@vercel/node": "3.2.10",
"aos": "2.3.4",
"axios": "1.6.8",
"firebase": "10.7.1",
"firebase-admin": "12.1.0",
"firebaseui": "6.1.0",
"next": "14.2.0",
"react": "18.2.0",
"react-datepicker": "4.25.0",
"react-dom": "18.2.0",
"react-window": "1.8.10",
"sharp": "0.33.2"
},
"devDependencies": {
"@types/aos": "3.0.7",
"@types/google.maps": "3.54.10",
"@types/node": "20",
"@types/react": "18",
"@types/react-datepicker": "4.19.4",
"@types/react-dom": "18",
"@types/react-window": "1.8.8",
"autoprefixer": "10.0.1",
"eslint": "8",
"eslint-config-next": "14.0.4",
"postcss": "8",
"tailwindcss": "3.3.0",
"typescript": "5"
}
}

### Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.

### Contact

Author: Nate
Email: thehumorhub777@gmail.com
GitHub: njwright92
Elevate your comedy with Humor Hub, the ultimate platform for comedians, writers, and performers.

#### License

This project is licensed under the MIT License - see the LICENSE file for details.
