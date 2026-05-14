export type Course = {
  code: string;
  title: string;
  units: number;
  department: string;
  level: number;
  semester: "Harmattan" | "Rain";
  lecturer: string;
  schedule: string;
  type: "Core" | "Elective" | "GST";
};

export const COURSES: Course[] = [
  {
    code: "CSC 401",
    title: "Advanced Algorithms & Complexity",
    units: 3,
    department: "Computer Science",
    level: 400,
    semester: "Harmattan",
    lecturer: "Prof. A. Okafor",
    schedule: "Mon 10:00 – Hall B",
    type: "Core",
  },
  {
    code: "CSC 411",
    title: "Distributed Systems",
    units: 3,
    department: "Computer Science",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. I. Bello",
    schedule: "Wed 14:00 – LT 3",
    type: "Core",
  },
  {
    code: "CSC 421",
    title: "Cryptography & Network Security",
    units: 3,
    department: "Computer Science",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. C. Adeyemi",
    schedule: "Thu 08:00 – LT 1",
    type: "Core",
  },
  {
    code: "CSC 431",
    title: "Machine Learning Foundations",
    units: 3,
    department: "Computer Science",
    level: 400,
    semester: "Harmattan",
    lecturer: "Prof. T. Eze",
    schedule: "Fri 10:00 – Hall A",
    type: "Elective",
  },
  {
    code: "CSC 441",
    title: "Blockchain & Decentralized Applications",
    units: 2,
    department: "Computer Science",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. K. Mensah",
    schedule: "Tue 12:00 – LT 2",
    type: "Elective",
  },
  {
    code: "MTH 401",
    title: "Numerical Analysis II",
    units: 3,
    department: "Mathematics",
    level: 400,
    semester: "Harmattan",
    lecturer: "Prof. L. Onuoha",
    schedule: "Mon 14:00 – LT 4",
    type: "Core",
  },
  {
    code: "EEE 415",
    title: "Embedded Systems Design",
    units: 3,
    department: "Electrical Engineering",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. R. Ibrahim",
    schedule: "Wed 10:00 – Eng. Lab 2",
    type: "Elective",
  },
  {
    code: "BIO 405",
    title: "Computational Biology",
    units: 2,
    department: "Biological Sciences",
    level: 400,
    semester: "Harmattan",
    lecturer: "Prof. M. Achebe",
    schedule: "Thu 12:00 – Sci. Block C",
    type: "Elective",
  },
  {
    code: "GST 401",
    title: "Entrepreneurship & Innovation",
    units: 2,
    department: "General Studies",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. P. Adebayo",
    schedule: "Fri 14:00 – Main Aud.",
    type: "GST",
  },
  {
    code: "GST 411",
    title: "Research Methodology",
    units: 1,
    department: "General Studies",
    level: 400,
    semester: "Harmattan",
    lecturer: "Dr. E. Nwosu",
    schedule: "Tue 16:00 – LT 5",
    type: "GST",
  },
];

export const FEE_AMOUNT_USD = "0.01"; // x402 price (USDC). Treat as symbolic fee.
export const DISPLAY_FEE_NGN = "₦485,000.00";
export const DISPLAY_FEE_USD = "$320.00";
