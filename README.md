<div align="center">

[![Website Status](https://img.shields.io/website-up-down-green-red/https/www.thehumorhub.com.svg?label=Status&style=for-the-badge)](https://www.thehumorhub.com/)
[![GitHub stars](https://img.shields.io/github/stars/njwright92/humorhub1.svg?style=for-the-badge&color=yellow)](https://github.com/njwright92/humorhub1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

# HUMOR HUB

**The Definitive Digital Ecosystem for Comedians & Performers**

[**Visit Live Site**](https://thehumorhub.com/)

</div>

---

## 📖 Overview

**Humor Hub** is a robust, full-stack platform engineered to modernize the workflow of stand-up comedians, writers, and live performers. By bridging the gap between talent and opportunity, the application provides a centralized interface for venue discovery and material development.

Currently serving as a premier resource for the industry, the platform aggregates real-time data for over **1,300 live open mic events** across **290+ US cities**, utilizing geospatial technology to connect performers with their next stage.

## 🚀 Key Features

### 🎤 Geo-Spatial Event Discovery

A high-performance "Mic Finder" engine that allows users to discover, filter, and share live performance stages for comedy, music, and poetry.

- **Scalable Database:** Manages a continuously expanding dataset of 1,300+ events.
- **Location Services:** Integrated Google Maps API for precise event geolocation and routing.

### 📰 The HumorHub Aggregator

A curated content stream tailored for comedic professionals.

- **Real-Time News:** Fetches and filters trending news topics to inspire fresh comedic material.
- **Trend Analysis:** Keeps performers ahead of the curve with up-to-date cultural context.

---

## 🛠️ Architecture & Tech Stack

This project utilizes a modern **Next.js 15** framework, leveraging server-side rendering and static generation for optimal performance and SEO. Codebase is formatted with Prettier for strict consistency.

| Domain                 | Technology                                                   |
| :--------------------- | :----------------------------------------------------------- |
| **Core Framework**     | **Next.js 15**, **React 18**, Node.js                        |
| **Styling & UI**       | **Tailwind CSS**, AOS (Animate On Scroll)                    |
| **Backend & Auth**     | **Firebase Authentication**, Firebase Admin SDK              |
| **Database**           | **Cloud Firestore** (NoSQL)                                  |
| **Geospatial**         | **Google Maps JavaScript API** (`@googlemaps/js-api-loader`) |
| **Utilities**          | `date-fns` (Time manipulation), `axios` (HTTP requests)      |
| **Image Optimization** | `sharp`                                                      |
| **Deployment**         | **Vercel** (CI/CD Integration)                               |

---

## 🎯 Getting Started

Follow these steps to set up the environment locally.

### Prerequisites

- **Node.js** (v14+ recommended)
- **npm** or **yarn**
- A configured **Firebase** project

### Installation Guide

1.  **Clone the repository**

    ```bash
    git clone https://github.com/njwright92/humor-hub.git
    cd humor-hub
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory. Add your Firebase and Google Maps credentials:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key
    # Add other specific Firebase config variables here
    ```

4.  **Launch Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🤝 Contributing

Contributions are a vital part of the open-source community. We welcome issues and pull requests to help make Humor Hub better.

1.  **Fork** the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

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
