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

**Humor Hub** is a robust, full-stack platform engineered to modernize the workflow of stand-up comedians, writers, and live performers. By bridging the gap between talent and opportunity, the application provides a centralized interface for venue discovery and material development.

Currently serving as a premier resource for the industry, the platform aggregates real-time data for live open mic events across **500+ cities worldwide**, utilizing geospatial technology to connect performers with their next stage.

---

## 🚀 Key Features

### 🎤 Geo-Spatial Event Discovery

A high-performance "Mic Finder" engine that allows users to discover, filter, and share live performance stages for comedy, music, and poetry.

- **Scalable Database:** Manages a continuously expanding dataset of 1,600+ events.
- **Location Services:** Integrated Google Maps API for precise event geolocation and routing.
- **Virtualized Lists:** Optimized rendering with TanStack Virtual for smooth scrolling through large datasets.

### 📰 The HumorHub Aggregator

A curated content stream tailored for comedic professionals.

- **Real-Time News:** Fetches and filters trending news topics to inspire fresh comedic material.

### 📧 Contact & Communication

- **EmailJS Integration:** Seamless contact form functionality for user inquiries and collaboration requests.

---

## 🛠️ Architecture & Tech Stack

This project utilizes a modern **Next.js 16** framework with **React 19**, leveraging server-side rendering and static generation for optimal performance and SEO. The codebase is strictly typed with **TypeScript** and formatted with **Prettier** for consistency.

| Domain             | Technology                                |
| :----------------- | :---------------------------------------- |
| **Core Framework** | Next.js 16, React 19, Node.js             |
| **Language**       | TypeScript 5.8                            |
| **Styling & UI**   | Tailwind CSS 4, PostCSS                   |
| **Backend & Auth** | Firebase Authentication, Firebase Admin   |
| **Database**       | Cloud Firestore                           |
| **Geospatial**     | Google Maps (`@vis.gl/react-google-maps`) |
| **Performance**    | TanStack Virtual (list virtualization)    |
| **Communication**  | EmailJS                                   |
| **Code Quality**   | ESLint 9, Prettier 3, lint-staged         |
| **Deployment**     | Vercel (CI/CD Integration)                |

---

## 🎯 Getting Started

Follow these steps to set up the environment locally.

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- A configured **Firebase** project
- A **Google Maps API** key

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
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key

    # EmailJS (optional)
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
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
