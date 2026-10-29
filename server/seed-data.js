// Pure demo data. Used by seed-demo.js. Every demo account uses the password below.
const PASSWORD = 'Demo@12345';

const users = [
  { key: 'aarav',  name: 'Aarav Sharma',  email: 'aarav.seller@demo.com',  role: 'seller',  avatar: 'aarav',  days: 80 },
  { key: 'priya',  name: 'Priya Patel',   email: 'priya.seller@demo.com',  role: 'seller',  avatar: 'priya',  days: 78, google: true }, // signed up with Google, no password
  { key: 'rohan',  name: 'Rohan Mehta',   email: 'rohan.seller@demo.com',  role: 'seller',  avatar: 'rohan',  days: 76 },
  { key: 'neha',   name: 'Neha Verma',    email: 'neha.student@demo.com',  role: 'student', avatar: 'neha',   days: 70 },
  { key: 'karan',  name: 'Karan Singh',   email: 'karan.student@demo.com', role: 'student', avatar: 'karan',  days: 66 },
  { key: 'isha',   name: 'Isha Joshi',    email: 'isha.student@demo.com',  role: 'student', avatar: 'isha',   days: 50 },
  { key: 'vikram', name: 'Vikram Desai',  email: 'vikram.student@demo.com', role: 'student', avatar: 'vikram', days: 45 },
  { key: 'ananya', name: 'Ananya Rao',    email: 'ananya.student@demo.com', role: 'student', avatar: 'ananya', days: 30 },
  { key: 'newbie', name: 'Rahul Nair',    email: 'unverified@demo.com',    role: 'student', verified: false, days: 1 }, // never entered the OTP
];

// seller, price, category, days = how long ago it was listed, status
const products = [
  { slug: 'mern-ecommerce-razorpay', seller: 'aarav', price: 1499, category: 'E-commerce', days: 75, status: 'approved',
    stack: ['React', 'Node', 'Express', 'MongoDB', 'Razorpay'], demo: 'https://example.com/demo/mern-store',
    title: 'MERN E-commerce Store with Razorpay',
    desc: 'A complete online store you can submit as a final-year project.\n\nFeatures: product catalogue with search and filters, cart, wishlist, coupon codes, Razorpay checkout with signature verification, order history, and an admin dashboard for products and orders.\n\nIncludes: full source code, Postman collection, database seed script, ER diagram and a 20-page report template.' },
  { slug: 'hospital-management-system', seller: 'aarav', price: 1999, category: 'Web App', days: 70, status: 'approved',
    stack: ['React', 'Express', 'MongoDB', 'JWT', 'Chart.js'],
    title: 'Hospital Management System',
    desc: 'Role-based hospital system for admins, doctors and patients.\n\nFeatures: appointment booking, doctor schedules, patient records, prescriptions, bill generation as PDF, and analytics charts on the admin dashboard.\n\nIncludes: source code, sample data, UML diagrams and a viva question list.' },
  { slug: 'ai-resume-analyzer', seller: 'priya', price: 1299, category: 'AI / ML', days: 62, status: 'approved',
    stack: ['Python', 'Flask', 'NLP', 'React', 'spaCy'], demo: 'https://example.com/demo/resume-ai',
    title: 'AI Resume Analyzer',
    desc: 'Upload a resume and a job description and get a match score with missing keywords.\n\nFeatures: PDF and DOCX parsing, skill extraction with spaCy, scoring explanation, improvement tips, and a React front end with charts.\n\nIncludes: trained model files, notebook, source code and setup video link.' },
  { slug: 'realtime-chat-socketio', seller: 'rohan', price: 799, category: 'Web App', days: 58, status: 'approved',
    stack: ['Socket.io', 'React', 'Node', 'MongoDB'],
    title: 'Real-time Chat App with Socket.io',
    desc: 'WhatsApp-style chat for the web.\n\nFeatures: private and group rooms, typing indicator, online status, image sharing with Multer, message history, and emoji picker.\n\nIncludes: client and server source, deployment guide for Render and Vercel.' },
  { slug: 'online-exam-portal', seller: 'aarav', price: 1799, category: 'Web App', days: 55, status: 'approved',
    stack: ['React', 'Node', 'MongoDB', 'Roles', 'PDF'],
    title: 'Online Exam Portal with Auto Grading',
    desc: 'Teachers create timed MCQ tests, students attempt them, results are graded instantly.\n\nFeatures: question bank, random question order, countdown timer, tab-switch warnings, leaderboard, and PDF result cards.\n\nIncludes: source code, sample question sets and project report outline.' },
  { slug: 'food-delivery-react-native', seller: 'rohan', price: 2299, category: 'Mobile App', days: 50, status: 'approved',
    stack: ['React Native', 'Node', 'MongoDB', 'Maps', 'Stripe'],
    title: 'Food Delivery App (React Native)',
    desc: 'Customer app, restaurant panel and delivery tracking in one project.\n\nFeatures: restaurant listing, cart and checkout, live order status, map tracking, push notifications, and a web panel for restaurants.\n\nIncludes: Expo project, backend API, Figma file and APK build instructions.' },
  { slug: 'student-result-management', seller: 'priya', price: 599, category: 'Web App', days: 45, status: 'approved',
    stack: ['React', 'Express', 'MySQL', 'PDF'],
    title: 'Student Result Management System',
    desc: 'Simple and clean system for schools and colleges.\n\nFeatures: marks entry, grade calculation, report card PDF, rank lists, and a student login to view results.\n\nIncludes: source code, SQL dump and a short report.' },
  { slug: 'movie-ticket-booking', seller: 'priya', price: 999, category: 'Web App', days: 40, status: 'approved',
    stack: ['MERN', 'Seat map', 'QR', 'Nodemailer'],
    title: 'Movie Ticket Booking System',
    desc: 'Book seats for movies like a real cinema site.\n\nFeatures: interactive seat map, showtimes per screen, booking lock to avoid double booking, QR e-tickets by email, and admin tools to add movies and shows.\n\nIncludes: full source and sample data.' },
  { slug: 'crypto-tracker-dashboard', seller: 'rohan', price: 499, category: 'Web App', days: 30, status: 'approved',
    stack: ['React', 'Chart.js', 'REST API', 'Tailwind'], demo: 'https://example.com/demo/crypto',
    title: 'Crypto Price Tracker Dashboard',
    desc: 'A good-looking dashboard that tracks live coin prices.\n\nFeatures: watchlist, price alerts, portfolio value chart, dark and light themes, and responsive layout.\n\nIncludes: React source and API setup notes.' },
  { slug: 'phaser-platformer-game', seller: 'rohan', price: 699, category: 'Game', days: 22, status: 'approved',
    stack: ['Phaser', 'JavaScript', 'Node', 'MongoDB'],
    title: '2D Platformer Game with Leaderboard',
    desc: 'Play in the browser and compete on the global leaderboard.\n\nFeatures: 5 levels, enemies and power-ups, sound effects, score saving with a Node API, and mobile touch controls.\n\nIncludes: game source, sprite assets (free licence) and level editor notes.' },
  // not live yet: waiting for admin review
  { slug: 'job-portal-mern', seller: 'aarav', price: 1599, category: 'Web App', days: 6, status: 'pending',
    stack: ['MERN', 'Multer', 'Roles', 'Search'],
    title: 'Job Portal for Recruiters and Applicants',
    desc: 'Recruiters post jobs, applicants upload resumes and apply.\n\nFeatures: job search with filters, resume upload, application tracking, and email alerts.\n\nIncludes: source code and sample data.' },
  { slug: 'library-management', seller: 'priya', price: 899, category: 'Web App', days: 4, status: 'pending',
    stack: ['React', 'Node', 'MongoDB', 'Reports'],
    title: 'Library Management System',
    desc: 'Manage books, members, issue and return, and fines.\n\nFeatures: barcode-style book IDs, due date reminders, fine calculation and monthly reports.\n\nIncludes: source code and a project report.' },
  // rejected by admin
  { slug: 'simple-blog-cms', seller: 'rohan', price: 399, category: 'Web App', days: 12, status: 'rejected',
    stack: ['React', 'Node', 'Markdown'],
    title: 'Simple Blog CMS',
    desc: 'A small blog engine with a markdown editor.\n\nFeatures: posts, categories and comments.' },
];

const coupons = [
  { code: 'WELCOME10', percent: 10, maxUses: 0,  days: 80, active: true },
  { code: 'STUDENT20', percent: 20, maxUses: 50, days: 60, active: true },
  { code: 'FESTIVE25', percent: 25, maxUses: 100, days: 70, expiredDaysAgo: 15, active: true },  // expired
  { code: 'SUMMER15',  percent: 15, maxUses: 0,  days: 40, active: false },                       // switched off
];

// u = buyer, p = project, d = days ago, c = coupon, st = 'created' for an abandoned payment, r = [stars, comment]
const purchases = [
  { u: 'neha',   p: 'mern-ecommerce-razorpay',    d: 60, c: 'WELCOME10', r: [5, 'Set it up in one evening. The Razorpay flow worked on the first try and the report template saved me a lot of time.'] },
  { u: 'karan',  p: 'mern-ecommerce-razorpay',    d: 52,             r: [4, 'Clean code and a clear folder structure. I would love a cart that syncs across devices, but great value.'] },
  { u: 'isha',   p: 'mern-ecommerce-razorpay',    d: 33, c: 'STUDENT20', r: [5, 'My examiner asked about the payment verification and I could actually explain it. Worth it.'] },
  { u: 'vikram', p: 'mern-ecommerce-razorpay',    d: 20,             r: [5, 'Everything in the description is in the zip. Admin dashboard looks professional.'] },
  { u: 'ananya', p: 'mern-ecommerce-razorpay',    d: 9 },
  { u: 'neha',   p: 'hospital-management-system', d: 48,             r: [5, 'The role-based access is done properly and the PDF bills are a nice touch.'] },
  { u: 'vikram', p: 'hospital-management-system', d: 35, c: 'FESTIVE25', r: [4, 'Good project. The setup guide could mention the Node version, but it ran fine on 20.'] },
  { u: 'isha',   p: 'hospital-management-system', d: 2, st: 'created' },
  { u: 'karan',  p: 'ai-resume-analyzer',         d: 41,             r: [4, 'The scoring explanation is what made it stand out in my demo. Model files were included as promised.'] },
  { u: 'isha',   p: 'ai-resume-analyzer',         d: 25, c: 'WELCOME10', r: [5, 'Best AI project I found at this price. The notebook helped me understand the NLP part.'] },
  { u: 'ananya', p: 'ai-resume-analyzer',         d: 11,             r: [3, 'Works well, but installing spaCy models took some effort on Windows.'] },
  { u: 'neha',   p: 'realtime-chat-socketio',     d: 38,             r: [5, 'Typing indicator and image sharing both work smoothly. Deployed on Render in 15 minutes.'] },
  { u: 'vikram', p: 'realtime-chat-socketio',     d: 30,             r: [4, 'Solid base for a chat app. I added video calls on top of it.'] },
  { u: 'karan',  p: 'online-exam-portal',         d: 29, c: 'STUDENT20', r: [5, 'The tab-switch warning and timer impressed my faculty. Sample question sets saved time.'] },
  { u: 'ananya', p: 'online-exam-portal',         d: 14,             r: [4, 'Great structure. The leaderboard page needs a little styling polish.'] },
  { u: 'isha',   p: 'food-delivery-react-native', d: 24,             r: [5, 'Real app feel, and the restaurant panel is a big plus. Figma file was a bonus.'] },
  { u: 'neha',   p: 'food-delivery-react-native', d: 8,              r: [4, 'Needs a Google Maps key, which the README explains. Tracking screen looks great.'] },
  { u: 'vikram', p: 'student-result-management',  d: 28, c: 'WELCOME10', r: [4, 'Simple and exactly what I needed for my college submission.'] },
  { u: 'karan',  p: 'student-result-management',  d: 18,             r: [3, 'Good for a submission, though the UI is basic. Easy to customise.'] },
  { u: 'ananya', p: 'movie-ticket-booking',       d: 19, c: 'FESTIVE25', r: [5, 'The seat locking logic is very well done. QR tickets arrive by email instantly.'] },
  { u: 'isha',   p: 'movie-ticket-booking',       d: 12,             r: [4, 'Nice seat map. I wish there were more sample movies in the seed data.'] },
  { u: 'neha',   p: 'crypto-tracker-dashboard',   d: 15,             r: [5, 'Beautiful dashboard for the price, and the themes are a nice touch.'] },
  { u: 'karan',  p: 'crypto-tracker-dashboard',   d: 7,  c: 'STUDENT20', r: [4, 'Clean React code. API rate limits are mentioned in the notes, which helped.'] },
  { u: 'ananya', p: 'phaser-platformer-game',     d: 10,             r: [5, 'Fun to play and easy to extend with my own levels. Mobile controls work well.'] },
  { u: 'vikram', p: 'phaser-platformer-game',     d: 3 },
];

// slugs each student has saved
const wishlists = {
  neha:   ['hospital-management-system', 'phaser-platformer-game', 'movie-ticket-booking'],
  karan:  ['hospital-management-system', 'food-delivery-react-native'],
  isha:   ['online-exam-portal', 'crypto-tracker-dashboard', 'realtime-chat-socketio'],
  vikram: ['ai-resume-analyzer'],
  ananya: ['food-delivery-react-native', 'student-result-management'],
};

module.exports = { PASSWORD, users, products, coupons, purchases, wishlists };
