// Comprehensive Indian Tech & Corporate Dataset

const CITIES = [
  'Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi', 'Noida', 'Gurgaon', 'Chennai', 
  'Jaipur', 'Ahmedabad', 'Indore', 'Bhopal', 'Lucknow', 'Kanpur', 'Nagpur', 'Kolkata', 
  'Kochi', 'Coimbatore', 'Mysore', 'Surat', 'Vadodara', 'Patna', 'Ranchi', 'Bhubaneswar', 
  'Vizag', 'Chandigarh', 'Mohali', 'Nashik', 'Aurangabad', 'Goa', 'Trivandrum', 'Mangalore', 
  'Rajkot', 'Vijayawada', 'Madurai', 'Guwahati', 'Agra', 'Ludhiana', 'Dehradun', 'Faridabad', 
  'Ghaziabad', 'Jamshedpur'
];

const SKILLS = [
  'Java', 'Spring Boot', 'Hibernate', 'Python', 'Django', 'Flask', 'React', 'Next.js', 
  'Angular', 'Vue', 'Node.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'Linux', 'REST API', 
  'GraphQL', 'Firebase', 'Tailwind', 'Bootstrap', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 
  'Redux', 'Socket.io', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Canva', 'Power BI', 
  'Excel', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 
  'Cyber Security', 'Networking', 'Flutter', 'React Native', 'Android', 'Kotlin', 'Swift', 
  'C++', 'Go', 'Rust', 'Microservices', 'CI/CD', 'System Design', 'Data Structures', 
  'Algorithms', 'Unit Testing', 'Jest', 'Selenium', 'Postman', 'Webflow', 'SEO', 'Content Writing', 
  'Copywriting', 'Social Media Marketing', 'Performance Marketing', 'Google Ads', 'Email Marketing', 
  'Financial Modeling', 'Accounting', 'Tally', 'Valuation', 'Human Resources', 'Talent Acquisition', 
  'Technical Recruiting', 'Public Relations', 'Sales Strategy', 'Cold Outbound', 'Lead Generation', 
  'Product Management', 'Agile', 'Scrum', 'JIRA', 'Business Analysis', 'Tableau', 'R', 
  'Data Analytics', 'Penetration Testing', 'Ethical Hacking', 'Data Engineering', 'Apache Spark', 'Kafka'
];

// SVG Logo Generator helper for unique crisp brand badges
function createSvgLogo(initials, bgColor, textColor = '#FFFFFF') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="${bgColor}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="34" font-weight="bold">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const COMPANIES = [
  // Startups (25)
  {
    companyName: 'Razorpay',
    logoUrl: createSvgLogo('RZP', '#0C2340'),
    website: 'https://razorpay.com',
    industry: 'Fintech & Payment Gateway',
    companySize: '1000-5000',
    description: 'Razorpay is India\'s leading payments and banking platform for businesses, powering online payments for over 8 million merchants.',
    location: 'Bangalore'
  },
  {
    companyName: 'CRED',
    logoUrl: createSvgLogo('CRED', '#1A1A1A'),
    website: 'https://cred.club',
    industry: 'Fintech & Rewards',
    companySize: '500-1000',
    description: 'CRED is a high-trust community of creditworthy individuals offering financial rewards, credit card bill management, and premium commerce.',
    location: 'Bangalore'
  },
  {
    companyName: 'Meesho',
    logoUrl: createSvgLogo('MSH', '#F43F5E'),
    website: 'https://meesho.com',
    industry: 'Social E-commerce',
    companySize: '1000-5000',
    description: 'Meesho is India\'s fastest growing e-commerce marketplace enabling small businesses and resellers to sell online effortlessly.',
    location: 'Bangalore'
  },
  {
    companyName: 'Zepto',
    logoUrl: createSvgLogo('ZEP', '#7C3AED'),
    website: 'https://zeptonow.com',
    industry: 'Quick Commerce & Logistics',
    companySize: '1000-5000',
    description: 'Zepto is India\'s premier 10-minute grocery delivery startup, revolutionizing quick commerce with ultra-fast dark store logistics.',
    location: 'Mumbai'
  },
  {
    companyName: 'Groww',
    logoUrl: createSvgLogo('GRW', '#10B981'),
    website: 'https://groww.in',
    industry: 'WealthTech & Investing',
    companySize: '1000-5000',
    description: 'Groww is a financial technology platform offering direct mutual funds, stocks, ETFs, and IPO investments to millions of Indian retail investors.',
    location: 'Bangalore'
  },
  {
    companyName: 'BrowserStack',
    logoUrl: createSvgLogo('BS', '#0284C7'),
    website: 'https://browserstack.com',
    industry: 'Developer Tools & Cloud Testing',
    companySize: '1000-5000',
    description: 'BrowserStack is the world\'s leading software testing platform, enabling over 50,000 teams to test websites and mobile apps on 3000+ real browsers and devices.',
    location: 'Mumbai'
  },
  {
    companyName: 'Postman',
    logoUrl: createSvgLogo('PM', '#FF6C37'),
    website: 'https://postman.com',
    industry: 'API Development Platform',
    companySize: '500-1000',
    description: 'Postman is the leading API platform used by over 30 million developers across Fortune 500 companies to build, test, and manage APIs.',
    location: 'Bangalore'
  },
  {
    companyName: 'Unacademy',
    logoUrl: createSvgLogo('UNA', '#0891B2'),
    website: 'https://unacademy.com',
    industry: 'EdTech & Learning',
    companySize: '1000-5000',
    description: 'Unacademy is India\'s largest learning platform, empowering students with top educators for competitive examination preparation.',
    location: 'Bangalore'
  },
  {
    companyName: 'Urban Company',
    logoUrl: createSvgLogo('UC', '#0F172A'),
    website: 'https://urbancompany.com',
    industry: 'Home Services & Commerce',
    companySize: '1000-5000',
    description: 'Urban Company is Asia\'s largest home services platform offering beauty, cleaning, plumbing, carpentry, and appliance repair services.',
    location: 'Gurgaon'
  },
  {
    companyName: 'NoBroker',
    logoUrl: createSvgLogo('NB', '#EF4444'),
    website: 'https://nobroker.in',
    industry: 'PropTech & Real Estate',
    companySize: '1000-5000',
    description: 'NoBroker is India\'s first PropTech unicorn connecting property owners and buyers/tenants directly without paying brokerage fees.',
    location: 'Bangalore'
  },
  {
    companyName: 'Swiggy',
    logoUrl: createSvgLogo('SWG', '#FC8019'),
    website: 'https://swiggy.com',
    industry: 'Food Delivery & Instamart',
    companySize: '5000-10000',
    description: 'Swiggy is India\'s leading on-demand convenience platform connecting consumers to food outlets, quick commerce groceries, and courier delivery.',
    location: 'Bangalore'
  },
  {
    companyName: 'Zomato',
    logoUrl: createSvgLogo('ZOM', '#CB202D'),
    website: 'https://zomato.com',
    industry: 'Food Tech & Dining Out',
    companySize: '5000-10000',
    description: 'Zomato is a multinational food aggregation and dining discovery giant operating across hundreds of cities with Blinkit quick commerce.',
    location: 'Gurgaon'
  },
  {
    companyName: 'Paytm',
    logoUrl: createSvgLogo('PAY', '#002E6E'),
    website: 'https://paytm.com',
    industry: 'Fintech & Digital Commerce',
    companySize: '10000+',
    description: 'Paytm is India\'s digital payment pioneer providing merchant QR codes, Soundbox, financial services, and consumer bill payments.',
    location: 'Noida'
  },
  {
    companyName: 'Nykaa',
    logoUrl: createSvgLogo('NYK', '#FC2779'),
    website: 'https://nykaa.com',
    industry: 'Omnichannel Beauty & Fashion',
    companySize: '1000-5000',
    description: 'Nykaa is India\'s premier beauty and lifestyle retailer bringing global cosmetic and fashion brands to millions of consumers.',
    location: 'Mumbai'
  },
  {
    companyName: 'Ola Cabs',
    logoUrl: createSvgLogo('OLA', '#1C1C1C'),
    website: 'https://olacabs.com',
    industry: 'Mobility & Electric Vehicles',
    companySize: '5000-10000',
    description: 'Ola is one of the world\'s largest ride-hailing mobility platforms and electric two-wheeler EV manufacturers in India.',
    location: 'Bangalore'
  },
  {
    companyName: 'PhonePe',
    logoUrl: createSvgLogo('PE', '#5F259F'),
    website: 'https://phonepe.com',
    industry: 'Fintech & UPI Infrastructure',
    companySize: '5000-10000',
    description: 'PhonePe is India\'s largest UPI payments app handling over 45% of national UPI transaction volume alongside insurance and wealth services.',
    location: 'Bangalore'
  },
  {
    companyName: 'Upstox',
    logoUrl: createSvgLogo('UPS', '#6366F1'),
    website: 'https://upstox.com',
    industry: 'Brokerage & Trading Platform',
    companySize: '500-1000',
    description: 'Upstox is a technology-first discount brokerage backed by Ratan Tata, making equity and derivatives trading seamless for retail traders.',
    location: 'Mumbai'
  },
  {
    companyName: 'PhysicsWallah',
    logoUrl: createSvgLogo('PW', '#2563EB'),
    website: 'https://pw.live',
    industry: 'EdTech & Offline Centers',
    companySize: '5000-10000',
    description: 'PhysicsWallah (PW) is an affordable EdTech movement providing top-rank JEE, NEET, and school preparation via apps and Vidyapeeth centers.',
    location: 'Noida'
  },
  {
    companyName: 'Lenskart',
    logoUrl: createSvgLogo('LK', '#000042'),
    website: 'https://lenskart.com',
    industry: 'D2C Eyewear Retail',
    companySize: '5000-10000',
    description: 'Lenskart is India\'s largest eyewear brand operating 2000+ omnichannel stores and automated lens manufacturing units.',
    location: 'Gurgaon'
  },
  {
    companyName: 'ShareChat',
    logoUrl: createSvgLogo('SC', '#F59E0B'),
    website: 'https://sharechat.com',
    industry: 'Vernacular Social Media & Short Video',
    companySize: '1000-5000',
    description: 'ShareChat and Moj are India\'s largest regional language social networking and short-video platforms with 300M+ active users.',
    location: 'Bangalore'
  },
  {
    companyName: 'Cars24',
    logoUrl: createSvgLogo('C24', '#FF5A00'),
    website: 'https://cars24.com',
    industry: 'AutoTech E-commerce',
    companySize: '1000-5000',
    description: 'Cars24 is India\'s leading AutoTech platform for buying, selling, and financing pre-owned vehicles with automated inspection centers.',
    location: 'Gurgaon'
  },
  {
    companyName: 'CoinDCX',
    logoUrl: createSvgLogo('DCX', '#3B82F6'),
    website: 'https://coindcx.com',
    industry: 'Web3 & Crypto Exchange',
    companySize: '500-1000',
    description: 'CoinDCX is India\'s safest crypto exchange and Web3 startup providing secure access to digital assets and blockchain products.',
    location: 'Mumbai'
  },
  {
    companyName: 'Spinny',
    logoUrl: createSvgLogo('SPN', '#EC4899'),
    website: 'https://spinny.com',
    industry: 'Used Car Retailing',
    companySize: '1000-5000',
    description: 'Spinny is a trusted D2C car buying and selling platform offering transparent 200-point inspected vehicles with money-back guarantees.',
    location: 'Gurgaon'
  },
  {
    companyName: 'Cult.fit',
    logoUrl: createSvgLogo('CLT', '#111827'),
    website: 'https://cult.fit',
    industry: 'Fitness & HealthTech',
    companySize: '1000-5000',
    description: 'Cult.fit is a health and fitness ecosystem offering trainer-led workout centers, online fitness classes, and sports turf bookings.',
    location: 'Bangalore'
  },
  {
    companyName: 'Portronics',
    logoUrl: createSvgLogo('POR', '#D97706'),
    website: 'https://portronics.com',
    industry: 'Consumer Tech & Gadgets',
    companySize: '500-1000',
    description: 'Portronics is a leading Indian portable gadgets and smart electronic accessories brand with wide nationwide retail presence.',
    location: 'Delhi'
  },

  // MNCs (27)
  {
    companyName: 'Google',
    logoUrl: createSvgLogo('G', '#4285F4'),
    website: 'https://google.com/careers',
    industry: 'Search, Cloud & AI Software',
    companySize: '10000+',
    description: 'Google is a global technology leader in search engines, cloud computing, artificial intelligence, Android OS, and enterprise software.',
    location: 'Hyderabad'
  },
  {
    companyName: 'Microsoft',
    logoUrl: createSvgLogo('MSFT', '#00A4EF'),
    website: 'https://careers.microsoft.com',
    industry: 'Enterprise Software & Azure Cloud',
    companySize: '10000+',
    description: 'Microsoft develops software, consumer electronics, Azure cloud computing, Windows OS, and enterprise productivity suites.',
    location: 'Hyderabad'
  },
  {
    companyName: 'Amazon',
    logoUrl: createSvgLogo('AMZN', '#FF9900', '#000000'),
    website: 'https://amazon.jobs',
    industry: 'E-commerce, AWS & Logistics',
    companySize: '10000+',
    description: 'Amazon is the world\'s largest e-commerce and cloud computing corporation (AWS), driving innovation in AI, logistics, and digital streaming.',
    location: 'Bangalore'
  },
  {
    companyName: 'Adobe',
    logoUrl: createSvgLogo('ADBE', '#FF0000'),
    website: 'https://adobe.com/careers',
    industry: 'Creative Software & Digital Experience',
    companySize: '10000+',
    description: 'Adobe empowers creative professionals with Photoshop, Illustrator, Premiere Pro, Figma, and enterprise Experience Cloud analytics.',
    location: 'Noida'
  },
  {
    companyName: 'IBM',
    logoUrl: createSvgLogo('IBM', '#052FAD'),
    website: 'https://ibm.com/jobs',
    industry: 'Hybrid Cloud & Enterprise AI',
    companySize: '10000+',
    description: 'IBM produces hybrid cloud solutions, Watson AI systems, mainframe infrastructure, and global business consulting services.',
    location: 'Bangalore'
  },
  {
    companyName: 'Intel Corporation',
    logoUrl: createSvgLogo('INTC', '#0068B5'),
    website: 'https://intel.com/jobs',
    industry: 'Semiconductors & Silicon Engineering',
    companySize: '10000+',
    description: 'Intel is a semiconductor giant designing microprocessors, GPUs, data center AI accelerators, and autonomous vehicle technologies.',
    location: 'Bangalore'
  },
  {
    companyName: 'Oracle',
    logoUrl: createSvgLogo('ORCL', '#C74634'),
    website: 'https://oracle.com/careers',
    industry: 'Database Systems & Cloud Infrastructure',
    companySize: '10000+',
    description: 'Oracle offers cloud database management systems, Oracle Cloud Infrastructure (OCI), ERP suites, and enterprise software.',
    location: 'Hyderabad'
  },
  {
    companyName: 'Deloitte',
    logoUrl: createSvgLogo('DTT', '#86BC25'),
    website: 'https://deloitte.com/careers',
    industry: 'Audit, Tax & Management Consulting',
    companySize: '10000+',
    description: 'Deloitte is one of the Big Four global professional services organizations delivering consulting, technology, risk, and tax services.',
    location: 'Hyderabad'
  },
  {
    companyName: 'Accenture',
    logoUrl: createSvgLogo('ACN', '#A100FF'),
    website: 'https://accenture.com/careers',
    industry: 'IT Services & Digital Transformation',
    companySize: '10000+',
    description: 'Accenture is a Fortune Global 500 company specializing in IT services, cloud migration, cybersecurity, and strategic digital consulting.',
    location: 'Bangalore'
  },
  {
    companyName: 'Tata Consultancy Services (TCS)',
    logoUrl: createSvgLogo('TCS', '#1E3A8A'),
    website: 'https://tcs.com/careers',
    industry: 'IT Services, Business Solutions & Consulting',
    companySize: '10000+',
    description: 'TCS is India\'s largest IT services exporter operating across 50+ countries delivering enterprise transformation and cloud solutions.',
    location: 'Mumbai'
  },
  {
    companyName: 'Infosys',
    logoUrl: createSvgLogo('INFY', '#007CC3'),
    website: 'https://infosys.com/careers',
    industry: 'Next-Gen Digital Services & Consulting',
    companySize: '10000+',
    description: 'Infosys is a global leader in next-generation digital services, cloud enablement, and artificial intelligence transformation.',
    location: 'Bangalore'
  },
  {
    companyName: 'Wipro',
    logoUrl: createSvgLogo('WIP', '#0070B8'),
    website: 'https://wipro.com/careers',
    industry: 'Information Technology & Consulting',
    companySize: '10000+',
    description: 'Wipro Limited is a global technology services and consulting company focused on building innovative cloud, cyber, and data platforms.',
    location: 'Bangalore'
  },
  {
    companyName: 'Capgemini',
    logoUrl: createSvgLogo('CAP', '#0070AD'),
    website: 'https://capgemini.com/careers',
    industry: 'Technology, Transformation & Engineering',
    companySize: '10000+',
    description: 'Capgemini is a global leader in partnering with companies to transform and manage business through technology and cloud engineering.',
    location: 'Pune'
  },
  {
    companyName: 'Cognizant',
    logoUrl: createSvgLogo('CTSH', '#0033A0'),
    website: 'https://cognizant.com/careers',
    industry: 'IT Services & Modern Application Modernization',
    companySize: '10000+',
    description: 'Cognizant engineers modern businesses to improve daily lives with cloud infrastructure, digital products, and analytics.',
    location: 'Chennai'
  },
  {
    companyName: 'HCLTech',
    logoUrl: createSvgLogo('HCL', '#0066B3'),
    website: 'https://hcltech.com/careers',
    industry: 'Global Technology Services & Products',
    companySize: '10000+',
    description: 'HCLTech is a global technology company supercharging progress for enterprise clients through Supercharging Progress in engineering.',
    location: 'Noida'
  },
  {
    companyName: 'Tech Mahindra',
    logoUrl: createSvgLogo('TECHM', '#E11D48'),
    website: 'https://techmahindra.com',
    industry: 'IT & Network Services',
    companySize: '10000+',
    description: 'Tech Mahindra offers innovative digital experience services, 5G telecom engineering, and enterprise cloud solutions globally.',
    location: 'Pune'
  },
  {
    companyName: 'Persistent Systems',
    logoUrl: createSvgLogo('PERS', '#0284C7'),
    website: 'https://persistent.com',
    industry: 'Digital Engineering & Modernization',
    companySize: '5000-10000',
    description: 'Persistent Systems builds software products, cloud platforms, and data infrastructure for healthcare, banking, and tech software clients.',
    location: 'Pune'
  },
  {
    companyName: 'Zoho Corporation',
    logoUrl: createSvgLogo('ZOHO', '#008000'),
    website: 'https://zoho.com/careers',
    industry: 'SaaS & Enterprise Business Applications',
    companySize: '10000+',
    description: 'Zoho offers a suite of 55+ business applications across CRM, finance, HR, and collaboration used by 100M+ global users.',
    location: 'Chennai'
  },
  {
    companyName: 'Freshworks',
    logoUrl: createSvgLogo('FRSH', '#FF5722'),
    website: 'https://freshworks.com',
    industry: 'Customer Experience & ITSM SaaS',
    companySize: '5000-10000',
    description: 'Freshworks creates easy-to-use SaaS software for customer service, IT service management (ITSM), and CRM.',
    location: 'Chennai'
  },
  {
    companyName: 'SAP Labs',
    logoUrl: createSvgLogo('SAP', '#008FD3'),
    website: 'https://sap.com/careers',
    industry: 'Enterprise ERP & Cloud Applications',
    companySize: '10000+',
    description: 'SAP is the market leader in enterprise application software, helping companies of all sizes run intelligent ERP supply chains.',
    location: 'Bangalore'
  },
  {
    companyName: 'Cisco Systems',
    logoUrl: createSvgLogo('CSCO', '#1BA0D7'),
    website: 'https://cisco.com/careers',
    industry: 'Networking, Security & IoT',
    companySize: '10000+',
    description: 'Cisco designs hardware, routers, Webex video systems, cloud cybersecurity platforms, and telecommunications equipment.',
    location: 'Bangalore'
  },
  {
    companyName: 'Samsung R&D',
    logoUrl: createSvgLogo('SSG', '#1428A0'),
    website: 'https://samsung.com/careers',
    industry: 'Consumer Electronics, Mobile & AI Research',
    companySize: '10000+',
    description: 'Samsung R&D Institute India develops mobile camera AI algorithms, 5G wireless protocols, SmartThings IoT, and Galaxy software.',
    location: 'Noida'
  },
  {
    companyName: 'Nvidia',
    logoUrl: createSvgLogo('NVDA', '#76B900'),
    website: 'https://nvidia.com/careers',
    industry: 'AI Computing, GPUs & Chip Design',
    companySize: '10000+',
    description: 'Nvidia pioneered GPU-accelerated computing, powering the world\'s leading artificial intelligence, supercomputers, and graphics engines.',
    location: 'Pune'
  },
  {
    companyName: 'Salesforce',
    logoUrl: createSvgLogo('CRM', '#00A1E0'),
    website: 'https://salesforce.com/careers',
    industry: 'CRM & Cloud Software',
    companySize: '10000+',
    description: 'Salesforce is the global CRM leader empowering companies to connect with customers through AI-driven sales, service, and marketing clouds.',
    location: 'Hyderabad'
  },
  {
    companyName: 'Goldman Sachs',
    logoUrl: createSvgLogo('GS', '#7298DA'),
    website: 'https://goldmansachs.com/careers',
    industry: 'Financial Technology & Investment Banking',
    companySize: '10000+',
    description: 'Goldman Sachs is a premier financial institution engineering high-frequency trading platforms, risk analytics, and quantitative software.',
    location: 'Bangalore'
  },
  {
    companyName: 'JP Morgan Chase',
    logoUrl: createSvgLogo('JPMC', '#111827'),
    website: 'https://jpmorganchase.com/careers',
    industry: 'Banking Technology & Global Markets',
    companySize: '10000+',
    description: 'JP Morgan Chase is a financial services leader employing thousands of software engineers in India building cloud-native banking platforms.',
    location: 'Mumbai'
  },
  {
    companyName: 'Uber',
    logoUrl: createSvgLogo('UBER', '#000000'),
    website: 'https://uber.com/careers',
    industry: 'Transportation & Mobility Tech',
    companySize: '5000-10000',
    description: 'Uber develops real-time routing algorithms, dispatch technology, and payment processing systems connecting riders and drivers globally.',
    location: 'Bangalore'
  }
];

// Domains for diversified job generation
const DOMAINS = [
  {
    titlePrefixes: ['Software Development Intern', 'Junior Software Engineer', 'SDE 1', 'Associate Software Developer'],
    domain: 'Software',
    category: 'Engineering & Technology',
    skills: ['Java', 'C++', 'Data Structures', 'Algorithms', 'Git', 'REST API', 'SQL']
  },
  {
    titlePrefixes: ['Frontend Developer Intern', 'React Developer', 'Full Stack Developer', 'Web Development Intern', 'Vue.js Specialist'],
    domain: 'Web Development',
    category: 'Engineering & Technology',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Redux', 'TypeScript']
  },
  {
    titlePrefixes: ['Backend Developer Intern', 'Node.js Developer', 'Java Backend Engineer', 'Python Django Developer'],
    domain: 'Backend Development',
    category: 'Engineering & Technology',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Java', 'Spring Boot', 'Python', 'Redis']
  },
  {
    titlePrefixes: ['AI / ML Research Intern', 'Machine Learning Engineer', 'AI Engineer', 'Deep Learning Intern'],
    domain: 'AI & ML',
    category: 'Data & Analytics',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'SQL']
  },
  {
    titlePrefixes: ['Data Analyst Intern', 'Data Science Intern', 'Junior Data Engineer', 'BI Analyst'],
    domain: 'Data Science',
    category: 'Data & Analytics',
    skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'R', 'Data Analytics', 'Apache Spark']
  },
  {
    titlePrefixes: ['Cyber Security Analyst Intern', 'Ethical Hacker Intern', 'InfoSec Trainee', 'Security Engineer'],
    domain: 'Cyber Security',
    category: 'Engineering & Technology',
    skills: ['Cyber Security', 'Networking', 'Penetration Testing', 'Ethical Hacking', 'Linux', 'Python']
  },
  {
    titlePrefixes: ['DevOps Intern', 'Cloud Infrastructure Engineer', 'SRE Associate', 'Cloud Operations Specialist'],
    domain: 'DevOps & Cloud',
    category: 'Engineering & Technology',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git', 'Azure', 'GCP']
  },
  {
    titlePrefixes: ['UI/UX Design Intern', 'Product Designer', 'User Researcher', 'UI Designer'],
    domain: 'UI UX Design',
    category: 'Design & Creative',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Wireframing', 'Prototyping', 'User Research']
  },
  {
    titlePrefixes: ['Mobile App Developer Intern', 'Flutter Developer', 'Android Developer (Kotlin)', 'iOS Developer (Swift)'],
    domain: 'Mobile App',
    category: 'Engineering & Technology',
    skills: ['Flutter', 'React Native', 'Android', 'Kotlin', 'Swift', 'REST API', 'Firebase']
  },
  {
    titlePrefixes: ['Digital Marketing Intern', 'Social Media Specialist', 'SEO Associate', 'Performance Marketing Intern'],
    domain: 'Marketing',
    category: 'Marketing & Sales',
    skills: ['Social Media Marketing', 'Performance Marketing', 'SEO', 'Google Ads', 'Content Writing', 'Canva']
  },
  {
    titlePrefixes: ['Business Analyst Intern', 'Product Operations Intern', 'Associate Product Manager', 'QA Testing Engineer'],
    domain: 'Product & Business',
    category: 'Business & Management',
    skills: ['Business Analysis', 'Product Management', 'JIRA', 'Agile', 'SQL', 'Excel', 'Unit Testing', 'Selenium']
  },
  {
    titlePrefixes: ['Financial Analyst Intern', 'HR Specialist Intern', 'Technical Recruiter', 'Content Writer'],
    domain: 'Business & Operations',
    category: 'Finance & Commerce',
    skills: ['Financial Modeling', 'Excel', 'Tally', 'Human Resources', 'Talent Acquisition', 'Content Writing']
  }
];

// Generator function for 250+ realistic listings
function generateListings(companiesList) {
  const listings = [];
  let count = 0;

  // We loop over companies multiple times with varied combinations to reach 260+ items
  for (let round = 0; round < 5; round++) {
    for (let cIdx = 0; cIdx < companiesList.length; cIdx++) {
      if (count >= 265) break;

      const comp = companiesList[cIdx];
      const domainObj = DOMAINS[(cIdx + round) % DOMAINS.length];
      const isInternship = (count % 3 !== 0); // ~67% internships, ~33% full-time jobs
      const workModes = ['remote', 'hybrid', 'onsite'];
      const mode = workModes[(count + round) % workModes.length];
      
      // Select city from 40+ list or hybrid/remote HQ
      const city = mode === 'remote' ? 'Remote' : CITIES[(cIdx + count) % CITIES.length];
      const state = mode === 'remote' ? 'India' : 'India';

      const titlePrefix = domainObj.titlePrefixes[(count + round) % domainObj.titlePrefixes.length];
      const title = `${titlePrefix}${isInternship ? '' : ' - Full Time'}`;

      let stipendMin = 0;
      let stipendMax = 0;

      if (isInternship) {
        // Internship stipend per month (₹8,000 to ₹60,000)
        stipendMin = Math.floor((Math.random() * 4 + 1)) * 5000 + 5000;
        stipendMax = stipendMin + Math.floor((Math.random() * 3 + 1)) * 5000;
      } else {
        // Full time job monthly package equivalent (₹30,000 to ₹150,000)
        stipendMin = Math.floor((Math.random() * 6 + 4)) * 5000 + 10000;
        stipendMax = stipendMin + Math.floor((Math.random() * 5 + 2)) * 10000;
      }

      const durationMonths = isInternship ? ((count % 4) + 3) : 12;
      const openings = (count % 4) + 1;

      // Dates
      const now = Date.now();
      const startDate = new Date(now + ((count % 10) + 2) * 24 * 60 * 60 * 1000);
      const deadline = new Date(now + ((count % 20) + 10) * 24 * 60 * 60 * 1000);

      // Unique skills subset
      const requiredSkills = [...new Set([
        ...domainObj.skills.slice(0, 3),
        SKILLS[(count * 3) % SKILLS.length],
        SKILLS[(count * 5 + 1) % SKILLS.length],
        SKILLS[(count * 7 + 2) % SKILLS.length]
      ])].filter(Boolean);

      const description = `We are hiring for a ${title} at ${comp.companyName}. As part of our ${domainObj.domain} team, you will collaborate with experienced engineering and product mentors on high-impact production systems serving millions of users.`;

      const responsibilities = [
        `Develop, maintain, and optimize robust systems using ${requiredSkills.slice(0, 2).join(' and ')}.`,
        `Collaborate with cross-functional product and design teams in agile sprints.`,
        `Write clean, testable, and maintainable code adhering to industry best practices.`,
        `Participate in code reviews, technical discussions, and architecture planning.`
      ];

      listings.push({
        companyId: comp._id,
        title,
        category: domainObj.category || 'Other',
        type: isInternship ? 'internship' : 'job',
        workMode: mode,
        location: `${city}, ${state}`,
        stipendMin,
        stipendMax,
        durationMonths,
        startDate,
        applicationDeadline: deadline,
        skillsRequired: requiredSkills,
        openings,
        description,
        responsibilities,
        status: 'active',
        applicantCount: Math.floor(Math.random() * 12)
      });

      count++;
    }
  }

  return listings;
}

module.exports = {
  CITIES,
  SKILLS,
  COMPANIES,
  generateListings
};
