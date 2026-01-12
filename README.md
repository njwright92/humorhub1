<div align="center">

[![Website Status](https://img.shields.io/website-up-down-green-red/https/www.thehumorhub.com.svg?label=Status&style=for-the-badge)](https://www.thehumorhub.com/)
[![GitHub stars](https://img.shields.io/github/stars/njwright92/humorhub1.svg?style=for-the-badge&color=yellow)](https://github.com/njwright92/humorhub1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

# HUMOR HUB

**The Definitive Digital Ecosystem for Comedians & Performers**

[**Visit Live Site**](https://www.thehumorhub.com/)

</div>

---

## 📖 Overview

**Humor Hub** is a full-stack platform engineered to modernize the workflow of stand-up comedians, writers, and live performers. By bridging the gap between talent and opportunity, the application provides a centralized interface for venue discovery and material development.

Currently serving as a premier resource for the industry, the platform aggregates real-time data for live open mic events across **500+ cities worldwide**, utilizing geospatial technology to connect performers with their next stage.

---

## 🚀 Key Features

### 🎤 Geo-Spatial Event Discovery

A high-performance "Mic Finder" engine that allows users to discover, filter, and share live performance stages for comedy, music, and poetry.

- **Scalable Database:** Backed by Firestore for fast, flexible querying.
- **Location Services:** Integrated Google Maps API for precise event geolocation and routing.
- **Virtualized Lists:** Optimized rendering with TanStack Virtual for smooth scrolling through large datasets.

### 📰 The HumorHub Aggregator

A curated content stream tailored for comedic professionals.

- **Real-Time News:** Fetches and filters trending topics via a news API to inspire fresh material.

### 📧 Contact & Communication

- **EmailJS Integration:** Seamless contact form functionality for user inquiries and collaboration requests.

### 🔐 Auth & Profiles

- **Firebase Auth + Admin SDK:** Client-side auth flows paired with server-side verification.
- **Storage-ready:** Firebase Storage hooks for media handling.

---

## 🛠️ Architecture & Tech Stack

This project utilizes **Next.js 16.1** with **React 19**, leveraging server-side rendering and static generation for performance and SEO. The codebase is strictly typed with **TypeScript 5.8** and formatted with **Prettier 3** for consistency.

| Domain             | Technology                                      |
| :----------------- | :---------------------------------------------- |
| **Core Framework** | Next.js 16.1, React 19, Node.js                 |
| **Language**       | TypeScript 5.8                                  |
| **Styling & UI**   | Tailwind CSS 4, PostCSS                         |
| **Backend & Auth** | Firebase Auth (client), Firebase Admin (server) |
| **Database**       | Cloud Firestore                                 |
| **Storage**        | Firebase Storage                                |
| **Geospatial**     | Google Maps (`@vis.gl/react-google-maps`)       |
| **Performance**    | `@tanstack/react-virtual` (list virtualization) |
| **Communication**  | EmailJS (`@emailjs/browser`)                    |
| **Observability**  | Vercel Speed Insights                           |
| **Code Quality**   | ESLint 9, Prettier 3, lint-staged               |
| **Deployment**     | Vercel                                          |

---

## 🎯 Getting Started

Follow these steps to set up the environment locally.

### Prerequisites

- **Node.js** (v24.12.0)
- **npm**
- A configured **Firebase** project
- A **Google Maps API** key
- A **News API** key (for the aggregator)

### Installation Guide

1.  **Clone the repository**

    ```bash
    git clone https://github.com/njwright92/humorhub1.git
    cd humorhub1
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory. Add your credentials:

    ```env
    # Firebase (client)
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # Firebase Admin (server)
    FIREBASE_CLIENT_EMAIL=your_client_email
    FIREBASE_PRIVATE_KEY="your_private_key"

    # Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
    GOOGLE_MAPS_API_KEY=your_key

    # News API
    NEWS_API=your_key

    # EmailJS (optional)
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID1=your_template_id_alt
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
    ```

4.  **Launch Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

| Command            | Description                           |
| :----------------- | :------------------------------------ |
| `npm run dev`      | Start development server              |
| `npm run build`    | Create production build               |
| `npm run start`    | Start production server               |
| `npm run lint`     | Run ESLint checks                     |
| `npm run lint:fix` | Fix ESLint issues automatically       |
| `npm run format`   | Format code with Prettier             |
| `npm run preview`  | Format, build, and preview production |

---

## 🤝 Contributing

Contributions are a vital part of the open-source community. We welcome issues and pull requests to help make Humor Hub better.

1.  **Fork** the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

> **Note:** This project uses lint-staged to automatically lint and format staged files on commit.

---

## 📫 Contact & Author

**Nate W.** — _Full Stack Developer_

- **GitHub:** [njwright92](https://github.com/njwright92)
- **Email:** [thehumorhub777@gmail.com](mailto:thehumorhub777@gmail.com)

_Feel free to reach out for collaborations, feature requests, or to connect regarding software engineering opportunities._

---

<div align="center">

**License**
<br>
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

_Made with ❤️, ☕, and a dash of humor._

</div>
