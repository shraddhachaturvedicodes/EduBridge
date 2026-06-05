// client/src/pages/Recommendations.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axiosInstance';

const teal = '#2dd4bf';
const navy = '#0f2a3d';
const purple = '#6366f1';
const amber = '#f59e0b';
const green = '#10b981';
const rose = '#f43f5e';
const blue = '#3b82f6';

// ── Smart keyword → topic mapper ──────────────────────────────────────────
const KEYWORD_MAP = {
  'machine learning': ['ml', 'machine learning', 'sklearn', 'scikit', 'supervised', 'unsupervised', 'regression', 'classification', 'clustering', 'random forest', 'svm', 'knn'],
  'deep learning':    ['deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'pytorch', 'tensorflow', 'keras', 'backpropagation'],
  'data science':     ['data science', 'data analysis', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'statistics', 'data visualization', 'eda'],
  'python':           ['python', 'django', 'flask', 'fastapi', 'pip', 'scripting', 'automation'],
  'web development':  ['web', 'html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'backend', 'fullstack', 'node', 'express'],
  'databases':        ['database', 'sql', 'dbms', 'mysql', 'postgresql', 'mongodb', 'nosql', 'redis', 'query', 'normalization', 'er diagram'],
  'cybersecurity':    ['cyber', 'security', 'hacking', 'ethical hacking', 'penetration', 'owasp', 'malware', 'firewall', 'encryption', 'ctf'],
  'networking':       ['network', 'tcp', 'ip', 'dns', 'http', 'routing', 'switching', 'cisco', 'protocol', 'lan', 'wan'],
  'cloud computing':  ['cloud', 'aws', 'azure', 'gcp', 'devops', 'docker', 'kubernetes', 'serverless', 'microservices', 'ci/cd'],
  'artificial intelligence': ['ai', 'artificial intelligence', 'nlp', 'computer vision', 'reinforcement learning', 'chatbot', 'gpt', 'llm'],
  'mobile development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift', 'app development'],
  'biology + tech':   ['biology', 'biotech', 'bioinformatics', 'genomics', 'dna', 'computational biology', 'life science'],
  'java':             ['java', 'spring', 'maven', 'gradle', 'jvm', 'object oriented', 'oop'],
  'competitive programming': ['competitive', 'dsa', 'data structures', 'algorithms', 'leetcode', 'coding', 'problem solving', 'dynamic programming'],
  'blockchain':       ['blockchain', 'crypto', 'ethereum', 'solidity', 'web3', 'nft', 'smart contract'],
};

// ── Full roadmap library ──────────────────────────────────────────────────
const ROADMAPS = {
  'machine learning': {
    icon: '🤖', color: teal,
    summary: 'Machine Learning teaches computers to learn from data and make predictions without being explicitly programmed. It powers recommendation systems, fraud detection, medical diagnosis, and much more.',
    steps: [
      { title: 'Python & Math Foundations', desc: 'Master Python basics, NumPy, Pandas. Learn linear algebra, probability, and statistics', duration: '3-4 weeks' },
      { title: 'Core ML Algorithms', desc: 'Linear/logistic regression, decision trees, SVM, K-means clustering, KNN', duration: '4-5 weeks' },
      { title: 'Scikit-Learn & EDA', desc: 'Exploratory data analysis, feature engineering, model evaluation, cross-validation', duration: '3-4 weeks' },
      { title: 'Advanced Models', desc: 'Ensemble methods (Random Forest, XGBoost, Gradient Boosting), hyperparameter tuning', duration: '3-4 weeks' },
      { title: 'Projects & Kaggle', desc: 'Build 3+ end-to-end projects, compete on Kaggle, create a portfolio on GitHub', duration: 'Ongoing' },
    ],
    resources: ['Coursera ML — Andrew Ng', 'Kaggle Learn (Free)', 'Scikit-learn docs', 'Hands-On ML Book'],
    careers: ['ML Engineer', 'Data Scientist', 'AI Researcher', 'MLOps Engineer'],
  },
  'deep learning': {
    icon: '🧠', color: purple,
    summary: 'Deep Learning uses multi-layered neural networks to recognize patterns in images, text, and audio. It is the technology behind ChatGPT, self-driving cars, and medical imaging AI.',
    steps: [
      { title: 'Neural Network Basics', desc: 'Perceptrons, activation functions, forward & backpropagation, gradient descent', duration: '2-3 weeks' },
      { title: 'PyTorch or TensorFlow', desc: 'Pick one framework, learn tensors, autograd, building custom models', duration: '3-4 weeks' },
      { title: 'CNNs — Computer Vision', desc: 'Convolutional layers, pooling, ResNet, image classification, object detection', duration: '3-4 weeks' },
      { title: 'RNNs & Transformers', desc: 'Sequential data, LSTMs, attention mechanism, BERT basics', duration: '4-5 weeks' },
      { title: 'Real Projects', desc: 'Image classifier, sentiment analysis, object detection project on GitHub', duration: 'Ongoing' },
    ],
    resources: ['fast.ai (Free)', 'PyTorch docs', 'Deep Learning book — Goodfellow', 'Papers With Code'],
    careers: ['Deep Learning Engineer', 'Computer Vision Engineer', 'NLP Engineer', 'AI Researcher'],
  },
  'data science': {
    icon: '📊', color: blue,
    summary: 'Data Science combines statistics, programming, and domain knowledge to extract insights from large datasets. It drives business decisions across every industry.',
    steps: [
      { title: 'Python for Data', desc: 'Pandas, NumPy, Matplotlib, Seaborn — data loading, cleaning, visualization', duration: '2-3 weeks' },
      { title: 'Statistics & Probability', desc: 'Descriptive stats, hypothesis testing, A/B testing, probability distributions', duration: '3-4 weeks' },
      { title: 'Exploratory Data Analysis', desc: 'EDA techniques, correlation, outlier detection, feature engineering', duration: '2-3 weeks' },
      { title: 'Machine Learning Basics', desc: 'Regression, classification, model evaluation using Scikit-learn', duration: '3-4 weeks' },
      { title: 'Real-World Projects', desc: 'End-to-end projects with real datasets, storytelling with data, dashboards', duration: 'Ongoing' },
    ],
    resources: ['Kaggle Datasets (Free)', 'DataCamp', 'Python for Data Analysis book', 'Towards Data Science'],
    careers: ['Data Scientist', 'Data Analyst', 'Business Analyst', 'Research Analyst'],
  },
  'python': {
    icon: '🐍', color: green,
    summary: 'Python is the most popular programming language for data science, automation, web development, and AI. Its simple syntax makes it perfect for beginners and powerful for experts.',
    steps: [
      { title: 'Python Basics', desc: 'Variables, data types, loops, functions, conditionals, file I/O', duration: '2-3 weeks' },
      { title: 'OOP & Modules', desc: 'Classes, inheritance, exceptions, standard library, virtual environments', duration: '2-3 weeks' },
      { title: 'Libraries & APIs', desc: 'Requests, JSON parsing, working with APIs, web scraping with BeautifulSoup', duration: '2-3 weeks' },
      { title: 'Choose Your Path', desc: 'Web (Flask/Django), Data (Pandas/NumPy), Automation, or Scripting', duration: '3-4 weeks' },
      { title: 'Build Projects', desc: 'Automate something real, build a web app or data pipeline, publish to GitHub', duration: 'Ongoing' },
    ],
    resources: ['Python.org Tutorial (Free)', 'Automate the Boring Stuff (Free)', 'Real Python', 'LeetCode Python'],
    careers: ['Python Developer', 'Backend Engineer', 'Data Engineer', 'Automation Engineer'],
  },
  'web development': {
    icon: '🌐', color: blue,
    summary: 'Web Development involves building websites and web applications. It covers everything from visual design to server logic and database management.',
    steps: [
      { title: 'HTML & CSS', desc: 'Semantic HTML5, CSS3, Flexbox, Grid, responsive design, media queries', duration: '2-3 weeks' },
      { title: 'JavaScript', desc: 'DOM manipulation, events, ES6+, async/await, fetch API, localStorage', duration: '3-4 weeks' },
      { title: 'Frontend Framework', desc: 'React.js — components, hooks, state management, React Router', duration: '4-5 weeks' },
      { title: 'Backend Development', desc: 'Node.js + Express, REST APIs, authentication, PostgreSQL integration', duration: '4-5 weeks' },
      { title: 'Deploy & DevOps', desc: 'Git, GitHub, Netlify/Vercel for frontend, Railway/Render for backend', duration: '2-3 weeks' },
    ],
    resources: ['MDN Web Docs (Free)', 'The Odin Project (Free)', 'freeCodeCamp (Free)', 'Frontend Mentor'],
    careers: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI Engineer'],
  },
  'databases': {
    icon: '🗄️', color: amber,
    summary: 'Databases are the backbone of every application. Understanding how to design, query, and optimize databases is a critical skill for every software developer.',
    steps: [
      { title: 'SQL Fundamentals', desc: 'SELECT, INSERT, UPDATE, DELETE, WHERE, GROUP BY, ORDER BY, JOINS', duration: '1-2 weeks' },
      { title: 'Database Design', desc: 'ER diagrams, normalization (1NF, 2NF, 3NF), primary & foreign keys', duration: '2-3 weeks' },
      { title: 'PostgreSQL Deep Dive', desc: 'Transactions, indexes, views, stored procedures, triggers, EXPLAIN ANALYZE', duration: '3-4 weeks' },
      { title: 'NoSQL Databases', desc: 'MongoDB (documents), Redis (caching), when to use SQL vs NoSQL', duration: '2-3 weeks' },
      { title: 'Database Administration', desc: 'Backup & restore, replication, performance tuning, connection pooling', duration: '3-4 weeks' },
    ],
    resources: ['SQLZoo (Free)', 'PostgreSQL Official Docs', 'MongoDB University (Free)', 'Use The Index Luke'],
    careers: ['Database Administrator', 'Backend Developer', 'Data Engineer', 'Database Architect'],
  },
  'cybersecurity': {
    icon: '🔐', color: rose,
    summary: 'Cybersecurity protects systems, networks, and data from digital attacks. It is one of the fastest-growing fields with massive demand for skilled professionals worldwide.',
    steps: [
      { title: 'Networking Fundamentals', desc: 'OSI model, TCP/IP, DNS, HTTP/HTTPS, firewalls, VPNs', duration: '2-3 weeks' },
      { title: 'Linux & Command Line', desc: 'File system, permissions, processes, shell scripting, Bash basics', duration: '2-3 weeks' },
      { title: 'Security Concepts', desc: 'CIA triad, encryption, hashing, PKI, authentication, authorization', duration: '3-4 weeks' },
      { title: 'Ethical Hacking', desc: 'OWASP Top 10, penetration testing, Kali Linux, Burp Suite, Metasploit', duration: '4-6 weeks' },
      { title: 'Certifications', desc: 'CompTIA Security+, CEH, or start with TryHackMe & HackTheBox for practice', duration: 'Ongoing' },
    ],
    resources: ['TryHackMe (Free tier)', 'HackTheBox', 'OWASP Website (Free)', 'Cybrary (Free)'],
    careers: ['Security Analyst', 'Penetration Tester', 'SOC Analyst', 'Security Engineer'],
  },
  'networking': {
    icon: '🌍', color: navy,
    summary: 'Computer Networking is the foundation of the internet and all connected systems. Networking professionals design, implement, and maintain the infrastructure that keeps the world connected.',
    steps: [
      { title: 'Network Basics', desc: 'OSI & TCP/IP models, IP addressing, subnetting, MAC addresses', duration: '2-3 weeks' },
      { title: 'Routing & Switching', desc: 'Routers, switches, VLANs, STP, RIP, OSPF, BGP protocols', duration: '3-4 weeks' },
      { title: 'Network Services', desc: 'DHCP, DNS, NAT, FTP, HTTP, SMTP — how each protocol works', duration: '2-3 weeks' },
      { title: 'Network Security', desc: 'Firewalls, IDS/IPS, VPNs, ACLs, network hardening basics', duration: '2-3 weeks' },
      { title: 'Certifications', desc: 'CompTIA Network+, Cisco CCNA — start with Packet Tracer simulations', duration: 'Ongoing' },
    ],
    resources: ['Cisco Packet Tracer (Free)', 'Professor Messer (Free)', 'CompTIA Study Guide', 'NetworkChuck YouTube'],
    careers: ['Network Engineer', 'Network Administrator', 'Cloud Network Engineer', 'Security Engineer'],
  },
  'cloud computing': {
    icon: '☁️', color: blue,
    summary: 'Cloud Computing delivers computing services over the internet. Almost every modern application runs on cloud infrastructure, making this skill extremely valuable.',
    steps: [
      { title: 'Cloud Fundamentals', desc: 'IaaS, PaaS, SaaS, public/private/hybrid cloud, virtualization basics', duration: '1-2 weeks' },
      { title: 'Pick a Cloud Provider', desc: 'AWS, Azure, or GCP — create free account, learn core services (EC2, S3, RDS)', duration: '3-4 weeks' },
      { title: 'DevOps & Containers', desc: 'Git, CI/CD pipelines, Docker containers, basic Kubernetes', duration: '4-5 weeks' },
      { title: 'Infrastructure as Code', desc: 'Terraform, CloudFormation, Ansible — automate infrastructure setup', duration: '3-4 weeks' },
      { title: 'Certifications', desc: 'AWS Cloud Practitioner (entry), Solutions Architect Associate (intermediate)', duration: 'Ongoing' },
    ],
    resources: ['AWS Free Tier', 'Google Cloud Skills Boost (Free)', 'A Cloud Guru', 'KodeKloud'],
    careers: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect'],
  },
  'artificial intelligence': {
    icon: '🧬', color: purple,
    summary: 'Artificial Intelligence is the simulation of human intelligence by machines. AI now powers search engines, virtual assistants, medical diagnostics, and autonomous vehicles.',
    steps: [
      { title: 'AI Foundations', desc: 'History of AI, types of AI, search algorithms, problem solving, heuristics', duration: '2-3 weeks' },
      { title: 'Machine Learning Core', desc: 'Supervised, unsupervised, reinforcement learning fundamentals', duration: '3-4 weeks' },
      { title: 'NLP — Text & Language', desc: 'Tokenization, word embeddings, sentiment analysis, chatbots, LLM basics', duration: '3-4 weeks' },
      { title: 'Computer Vision', desc: 'Image processing, object detection, face recognition, OpenCV', duration: '3-4 weeks' },
      { title: 'AI Ethics & Projects', desc: 'Bias in AI, responsible AI, build an AI project and deploy it', duration: 'Ongoing' },
    ],
    resources: ['Elements of AI (Free)', 'fast.ai (Free)', 'Hugging Face (Free)', 'Papers With Code'],
    careers: ['AI Engineer', 'ML Researcher', 'NLP Engineer', 'Computer Vision Engineer'],
  },
  'mobile development': {
    icon: '📱', color: green,
    summary: 'Mobile Development involves building apps for smartphones and tablets. With billions of mobile users worldwide, mobile development skills are in extremely high demand.',
    steps: [
      { title: 'Choose Your Path', desc: 'Flutter (cross-platform) or Android (Kotlin) or iOS (Swift) — pick one', duration: '1 week' },
      { title: 'Language Basics', desc: 'Dart for Flutter, Kotlin for Android, or Swift for iOS — core syntax', duration: '2-3 weeks' },
      { title: 'UI Development', desc: 'Layouts, navigation, forms, lists, animations, responsive design for mobile', duration: '3-4 weeks' },
      { title: 'State & APIs', desc: 'State management, REST API integration, local storage, authentication', duration: '3-4 weeks' },
      { title: 'Publish Your App', desc: 'Testing, debugging, publish to Google Play or App Store', duration: '2-3 weeks' },
    ],
    resources: ['Flutter.dev Docs (Free)', 'Android Developers (Free)', 'Ray Wenderlich', 'AppBrewery Udemy'],
    careers: ['Flutter Developer', 'Android Developer', 'iOS Developer', 'React Native Developer'],
  },
  'biology + tech': {
    icon: '🧬', color: green,
    summary: 'Biology + Technology combines life sciences with computing to solve complex biological problems. Bioinformatics, genomics, and computational biology are revolutionizing medicine.',
    steps: [
      { title: 'Biology Foundations', desc: 'Cell biology, DNA/RNA, proteins, genetics, molecular biology basics', duration: '3-4 weeks' },
      { title: 'Bioinformatics Tools', desc: 'BLAST, NCBI databases, sequence alignment, phylogenetic trees', duration: '3-4 weeks' },
      { title: 'Python for Biology', desc: 'Biopython library, parsing biological data, automating lab analysis', duration: '3-4 weeks' },
      { title: 'Genomics & Data', desc: 'Next-generation sequencing, genome assembly, variant calling, R for biology', duration: '4-5 weeks' },
      { title: 'Research Projects', desc: 'Analyze real genomic datasets, publish findings, contribute to open science', duration: 'Ongoing' },
    ],
    resources: ['Rosalind (Free bioinformatics)', 'NCBI Resources (Free)', 'Biopython Tutorial', 'Coursera Genomics'],
    careers: ['Bioinformatics Scientist', 'Computational Biologist', 'Genomics Analyst', 'Research Scientist'],
  },
  'java': {
    icon: '☕', color: amber,
    summary: 'Java is one of the most widely used programming languages, powering enterprise applications, Android apps, and large-scale backend systems at companies like Google and Amazon.',
    steps: [
      { title: 'Java Basics', desc: 'Syntax, data types, loops, methods, arrays, String handling', duration: '2-3 weeks' },
      { title: 'OOP in Java', desc: 'Classes, objects, inheritance, polymorphism, interfaces, abstraction', duration: '3-4 weeks' },
      { title: 'Collections & Generics', desc: 'ArrayList, HashMap, LinkedList, Iterator, generic types', duration: '2-3 weeks' },
      { title: 'Spring Framework', desc: 'Spring Boot, REST APIs, dependency injection, JPA + Hibernate, databases', duration: '4-5 weeks' },
      { title: 'Build Projects', desc: 'REST API project, microservices with Spring Boot, deploy to cloud', duration: 'Ongoing' },
    ],
    resources: ['Oracle Java Tutorials (Free)', 'Baeldung (Free)', 'Spring.io Guides', 'LeetCode Java'],
    careers: ['Java Developer', 'Backend Engineer', 'Android Developer', 'Enterprise Software Engineer'],
  },
  'competitive programming': {
    icon: '🏆', color: rose,
    summary: 'Competitive Programming sharpens problem-solving and algorithmic thinking. It is essential for cracking technical interviews at top tech companies like Google, Amazon, and Microsoft.',
    steps: [
      { title: 'Programming Basics', desc: 'Pick C++ or Python, learn I/O, complexity (Big O), basic loops & conditions', duration: '2-3 weeks' },
      { title: 'Data Structures', desc: 'Arrays, stacks, queues, linked lists, trees, graphs, heaps, hash tables', duration: '4-5 weeks' },
      { title: 'Core Algorithms', desc: 'Sorting, searching, BFS, DFS, Dijkstra, dynamic programming basics', duration: '4-6 weeks' },
      { title: 'Advanced Topics', desc: 'Segment trees, tries, advanced DP, greedy algorithms, number theory', duration: '4-6 weeks' },
      { title: 'Regular Practice', desc: 'Solve daily on LeetCode/Codeforces, participate in weekly contests', duration: 'Ongoing' },
    ],
    resources: ['LeetCode (Free tier)', 'Codeforces (Free)', 'CP-Algorithms.com (Free)', 'NeetCode YouTube'],
    careers: ['Software Engineer at FAANG', 'Algorithm Engineer', 'Research Engineer', 'Systems Engineer'],
  },
  'blockchain': {
    icon: '⛓️', color: purple,
    summary: 'Blockchain is a decentralized, immutable ledger technology. It powers cryptocurrencies, smart contracts, DeFi, NFTs, and is transforming finance, supply chain, and healthcare.',
    steps: [
      { title: 'Blockchain Fundamentals', desc: 'How blockchain works, consensus mechanisms, public vs private chains', duration: '2-3 weeks' },
      { title: 'Cryptography Basics', desc: 'Hash functions, public/private keys, digital signatures, wallets', duration: '2-3 weeks' },
      { title: 'Ethereum & Solidity', desc: 'Smart contracts, EVM, Solidity syntax, deploying on testnets', duration: '4-5 weeks' },
      { title: 'Web3 Development', desc: 'ethers.js, MetaMask, building dApps, IPFS for decentralized storage', duration: '3-4 weeks' },
      { title: 'DeFi & Projects', desc: 'Build a DeFi app or NFT marketplace, audit smart contracts for security', duration: 'Ongoing' },
    ],
    resources: ['CryptoZombies (Free)', 'Ethereum.org Docs (Free)', 'Buildspace (Free)', 'Hardhat Docs'],
    careers: ['Blockchain Developer', 'Smart Contract Engineer', 'Web3 Developer', 'DeFi Engineer'],
  },
};

// ── Smart topic matcher ───────────────────────────────────────────────────
function findBestTopic(query) {
  const q = query.toLowerCase();
  let bestTopic = null;
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    // Exact topic match = highest score
    if (q === topic) { score = 100; }
    else if (q.includes(topic)) { score = 80; }
    else if (topic.includes(q) && q.length > 2) { score = 70; }
    else {
      // keyword matching
      for (const kw of keywords) {
        if (q.includes(kw)) score += kw.length > 4 ? 20 : 10;
        else if (kw.includes(q) && q.length > 3) score += 5;
      }
    }
    if (score > bestScore) { bestScore = score; bestTopic = topic; }
  }

  if (bestScore > 0 && ROADMAPS[bestTopic]) {
    return { topic: bestTopic, ...ROADMAPS[bestTopic] };
  }

  // Generic fallback roadmap for unknown topics
  return {
    topic: query,
    icon: '📚',
    color: teal,
    summary: `${query} is an exciting field to explore. Here is a general approach to learning any new technical topic effectively.`,
    steps: [
      { title: 'Understand the Basics', desc: `Search "${query} for beginners" on YouTube and read Wikipedia overview`, duration: '1-2 weeks' },
      { title: 'Find a Structured Course', desc: 'Look on Coursera, edX, or YouTube for free beginner courses on this topic', duration: '3-4 weeks' },
      { title: 'Read Documentation', desc: 'Find the official documentation or textbook and work through examples', duration: '3-4 weeks' },
      { title: 'Build Small Projects', desc: 'Apply what you learn by building 2-3 small hands-on projects', duration: '4-6 weeks' },
      { title: 'Join a Community', desc: 'Find Reddit communities, Discord servers, or forums related to this topic', duration: 'Ongoing' },
    ],
    resources: [`Search "${query}" on Coursera`, `Search "${query}" on YouTube`, 'Reddit communities', 'Stack Overflow'],
    careers: ['Varies by specialization', 'Research job listings for this topic', 'Talk to faculty for guidance'],
  };
}

// ── UI Components ─────────────────────────────────────────────────────────
function ScoreBar({ score, label }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? green : pct >= 40 ? amber : blue;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#94a3b8' }}>{label || 'Match'}</span>
        <span style={{ color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 10, height: 5 }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 10, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function FacultyCard({ faculty, index, onMessage }) {
  const colors = [teal, purple, blue, green, amber, rose];
  const color = colors[index % colors.length];
  const isAvailable = (faculty.availability_status || '').toLowerCase() === 'available';
  const tags = faculty.expertise_areas || (faculty.expertise ? faculty.expertise.split(',') : []);

  return (
    <div
      style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}`, position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {index === 0 && (
        <div style={{ position: 'absolute', top: 14, right: 14, background: teal, color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
          🏆 Best Match
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
          {(faculty.display_name || faculty.name || 'F').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: navy }}>{faculty.display_name || faculty.name}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{faculty.designation || 'Faculty'} • {faculty.department || 'General'}</div>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isAvailable ? '#d1fae5' : '#fee2e2', color: isAvailable ? '#065f46' : '#991b1b' }}>
          {isAvailable ? '✅ Available' : '⏸ Unavailable'}
        </div>
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ padding: '3px 10px', background: color + '15', color, borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      )}

      <ScoreBar score={faculty.score || (isAvailable ? 0.85 : 0.5)} label="Expertise Match" />

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={() => onMessage(faculty)}
          style={{ padding: '9px 16px', background: isAvailable ? teal : '#64748b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', flex: 1 }}
        >
          💬 {isAvailable ? 'Send Message' : 'Message Anyway'}
        </button>
        <a href={`mailto:${faculty.email}`} style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ padding: '9px 16px', background: '#f0fffe', color: teal, border: `1px solid ${teal}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%' }}>
            📧 Email
          </button>
        </a>
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f2a3d 0%, #1a3f5c 100%)', borderRadius: 14, padding: 24, marginBottom: 20, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{roadmap.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Learning Roadmap</div>
            <div style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>{roadmap.topic}</div>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: '12px 0' }}>{roadmap.summary}</p>

      {expanded && (
        <>
          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {roadmap.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, color: '#fff' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{step.title}</span>
                    <span style={{ fontSize: 11, color: teal, fontWeight: 600, background: 'rgba(45,212,191,0.15)', padding: '2px 8px', borderRadius: 10 }}>{step.duration}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Resources + Careers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: teal, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📚 Free Resources</div>
              {(roadmap.resources || []).map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 5 }}>• {r}</div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: amber, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>💼 Career Paths</div>
              {(roadmap.careers || []).map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 5 }}>• {c}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function Recommendations() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [searched, setSearched] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  const suggestions = [
    { label: '🤖 Machine Learning', q: 'machine learning' },
    { label: '🗄️ Databases', q: 'databases' },
    { label: '🔐 Cybersecurity', q: 'cybersecurity' },
    { label: '🐍 Python', q: 'python' },
    { label: '🌐 Web Dev', q: 'web development' },
    { label: '🧬 Biology + Tech', q: 'biology + tech' },
    { label: '☁️ Cloud', q: 'cloud computing' },
    { label: '🏆 Competitive Prog.', q: 'competitive programming' },
  ];

  async function handleSearch(q) {
    const searchQ = (q || query).trim();
    if (!searchQ) return;
    setQuery(searchQ);
    setErr('');
    setLoading(true);
    setSearched(true);
    setResults([]);

    // Instantly show roadmap — no API needed
    setRoadmap(findBestTopic(searchQ));

    try {
      const resp = await api.get('/api/recommendations', { params: { q: searchQ, limit: 20 } });
      let rows = resp.data.recommendations || [];

      // If no match, fetch ALL faculty as fallback
      if (rows.length === 0) {
        const all = await api.get('/api/recommendations', { params: { q: ' ', limit: 20 } });
        rows = (all.data.recommendations || []).map(r => ({ ...r, score: 0.4 }));
      }
      setResults(rows);
    } catch (e) {
      setErr('Could not fetch faculty — showing roadmap only.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(faculty) {
    if (!msgText.trim()) return;
    if (!faculty.user_id) {
      alert('This faculty is not linked to an account yet. Please email them at: ' + faculty.email);
      return;
    }
    setSending(true);
    try {
      await api.post('/api/messages', {
        receiver_user_id: faculty.user_id,
        text_content: msgText.trim()
      });
      setMsgSuccess(`Message sent to ${faculty.display_name || faculty.name}!`);
      setMsgText('');
      setTimeout(() => { setMsgSuccess(''); setSelectedFaculty(null); }, 2500);
    } catch (e) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 28, background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>🎯 Faculty Recommendation Engine</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Enter any topic — get an instant learning roadmap + matched faculty you can message directly.
        </p>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. machine learning, cybersecurity, DBMS, web development, blockchain..."
            style={{ flex: 1, padding: '14px 18px', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = teal}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            style={{ padding: '14px 28px', background: loading || !query.trim() ? '#94a3b8' : `linear-gradient(135deg, ${teal}, #0d9488)`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {loading ? '🔍 Searching...' : '🔍 Find Faculty'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Quick:</span>
          {suggestions.map(s => (
            <button key={s.q} onClick={() => handleSearch(s.q)}
              style={{ padding: '6px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onMouseOver={e => { e.currentTarget.style.background = '#f0fffe'; e.currentTarget.style.borderColor = teal; e.currentTarget.style.color = teal; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {err && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>⚠️ {err}</div>}

      {/* Initial state */}
      {!searched && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
          <h3 style={{ color: navy, marginBottom: 8, fontSize: 22 }}>Find Your Perfect Faculty Mentor</h3>
          <p style={{ color: '#64748b', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Type any topic to get an instant step-by-step learning roadmap and find faculty mentors you can message directly.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {suggestions.slice(0, 4).map(s => (
              <button key={s.q} onClick={() => handleSearch(s.q)}
                style={{ padding: '10px 20px', background: '#f0fffe', color: teal, border: `1px solid ${teal}`, borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* Roadmap — shows instantly */}
            {roadmap && <RoadmapCard roadmap={roadmap} />}

            {/* Faculty loading */}
            {loading && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '30px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>Finding matching faculty...</div>
              </div>
            )}

            {/* Faculty results */}
            {!loading && results.length > 0 && (
              <div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: teal, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>{results.length}</span>
                  {results[0]?.score < 0.5 ? 'All Faculty — reach out to anyone for guidance' : `Faculty matched for "${query}"`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {results.map((r, i) => (
                    <FacultyCard
                      key={r.faculty_id || r.user_id || i}
                      faculty={r}
                      index={i}
                      onMessage={f => { setSelectedFaculty(f); setMsgText(''); setMsgSuccess(''); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: navy, margin: '0 0 14px' }}>⚡ How It Works</h3>
              {[
                { step: '1', text: 'Enter your topic or research interest', color: teal },
                { step: '2', text: 'Get an instant step-by-step learning roadmap', color: purple },
                { step: '3', text: 'See matched faculty by expertise', color: blue },
                { step: '4', text: 'Message faculty directly from here', color: green },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                  <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: navy, margin: '0 0 14px' }}>💡 Search Tips</h3>
              {[
                { icon: '🔑', tip: 'Specific: "DBMS", "NLP", "PyTorch"' },
                { icon: '📝', tip: 'Broad: "AI", "security", "web"' },
                { icon: '🎯', tip: 'With tech: "Python + ML"' },
                { icon: '🌐', tip: 'Any topic gets a roadmap!' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{item.tip}</span>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${navy}, #1a3f5c)`, borderRadius: 14, padding: 20, color: '#fff' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>👨‍🏫 Browse All Faculty</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.5 }}>Message any faculty directly for guidance.</p>
              <button onClick={() => navigate('/messages')}
                style={{ padding: '9px 16px', background: teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                💬 Open Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {selectedFaculty && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${teal}, #0d9488)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                {(selectedFaculty.display_name || selectedFaculty.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: navy, fontSize: 16 }}>{selectedFaculty.display_name || selectedFaculty.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{selectedFaculty.designation} • {selectedFaculty.department}</div>
              </div>
            </div>

            {msgSuccess ? (
              <div style={{ padding: 20, background: '#f0fff8', border: `2px solid ${teal}`, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: 16 }}>{msgSuccess}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Check your messages inbox for their reply.</div>
              </div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: '#475569' }}>
                  💡 <strong>Suggested:</strong>
                  <button
                    onClick={() => setMsgText(`Hi ${selectedFaculty.display_name || selectedFaculty.name}, I am interested in ${query} and would love your guidance on how to get started. Could you mentor me on this topic?`)}
                    style={{ display: 'block', marginTop: 8, padding: '4px 12px', background: '#f0fffe', color: teal, border: `1px solid ${teal}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Use template for "{query}"
                  </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: navy, display: 'block', marginBottom: 8 }}>Your Message *</label>
                  <textarea
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder="Hi Professor, I am interested in..."
                    rows={5} maxLength={500}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = teal}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{msgText.length}/500</div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedFaculty(null)}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => sendMessage(selectedFaculty)}
                    disabled={sending || !msgText.trim()}
                    style={{ padding: '10px 24px', background: sending || !msgText.trim() ? '#94a3b8' : teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: sending || !msgText.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    {sending ? '⏳ Sending...' : '📨 Send Message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}