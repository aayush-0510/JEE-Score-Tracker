# 🎯 JEE Score Analyzer & 15 Ultimate Challenges Tracker

A modern web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS** designed specifically for JEE Main & Advanced aspirants to analyze mock scores, calculate accuracy, diagnose weak areas, log test mistakes, and track syllabus challenges.

---

## ⚡ Core Features

### 1. 🧮 Score & Accuracy Calculator (+4 / -1 JEE Format)
- Calculates scores based on the standard JEE Main marking scheme:
  $$\text{Score} = (\text{Correct} \times 4) - (\text{Incorrect} \times 1)$$
- **Subject-Wise Accuracy**: Independent precision percentages for Physics, Chemistry, and Mathematics.
- **Overall Accuracy & Percentile**: Real-time accuracy gauge and predicted percentile estimator based on standard 300-mark curves.
- **Negative Marks Damage Impact**: Visualizes direct marks deducted and the potential swing (+5 marks per mistake) lost.

### 2. 📊 Past vs. Current Mock Comparison ("Where I Am Lagging")
- Side-by-side comparison between any benchmark mock and your latest test.
- $\Delta$ Score, $\Delta$ Accuracy, $\Delta$ Negatives, and Attempt rate tracking.
- **Automated Lagging Diagnostic Engine**: Highlights accuracy slips, negative spikes, or low attempt rates with actionable recommendations.
- Progression trend line charts across tests and subject comparison bar charts.

### 3. 📝 Mistake Notebook ("Add Mistake Section")
- Categorize mistakes by root cause:
  - *Calculation / Silly Error*
  - *Conceptual Gap*
  - *Formula Forgotten*
  - *Misread Question / Trap*
  - *Time Pressure*
  - *Wild Guess / Panic*
- Chapter selection populated from syllabus, error descriptions, and key formula remedies.
- Status review workflow (*Needs Revision* $\to$ *Reviewed* $\to$ *Mastered*).

### 4. 📑 15 Ultimate Challenges Sheet (Physics, Chemistry & Maths)
- **Physics**: Modeled after the 15 Ultimate Challenges tracker with Block 1, 2, 3, and 4 chapters, question counts, PYQs (2019-2026), HCV selected questions, RBS 1.0, NCERT read, and revision tracking (R1 / R2).
- **Chemistry**: Dedicated sheet covering Physical, Inorganic, and Organic blocks with NCERT line-by-line and standard references.
- **Mathematics**: Dedicated sheet covering Algebra, Coordinate & 3D, Calculus, and Trigonometry blocks.
- **Special Topics**: 100 Repeated Graphical Questions, 30 Experiment Questions, Top 50 Circuit Questions, and Formulae Marathons.

### 5. ✅ Mock Test Completion Roadmap
- Pre-populated with official NTA shifts and custom mock series.
- Roadmap to track Pending, In Progress, and Completed tests with quick "Log Score" actions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/aayush-0510/JEE-Score-Tracker.git
cd JEE-Score-Tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 💾 Data Storage & Privacy
All mock test data, mistake notebook entries, and challenge checklist ticks are stored locally in your browser's `localStorage`. You can also export and import full JSON backups anytime using the **Export** and **Import** buttons in the navigation bar.
