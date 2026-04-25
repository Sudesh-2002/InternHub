export const MOCK_JOBS = [
  { id:1, title:"Frontend Developer Intern", company:"TechCorp", location:"Colombo", type:"on-site", description:"Build modern UIs with React and Tailwind. Work alongside senior engineers on real products.", posted:"2 days ago", logo:"TC" },
  { id:2, title:"Data Analyst Intern", company:"DataFlow", location:"Remote", type:"remote", description:"Analyze datasets, build dashboards, and present insights to stakeholders using Python and SQL.", posted:"3 days ago", logo:"DF" },
  { id:3, title:"Marketing Intern", company:"BrandUp", location:"Gampaha", type:"on-site", description:"Support the marketing team with campaigns, social media, and content creation.", posted:"5 days ago", logo:"BU" },
  { id:4, title:"Backend Developer Intern", company:"CloudBase", location:"Remote", type:"remote", description:"Work on Node.js APIs and database design. Exposure to AWS and Docker.", posted:"1 week ago", logo:"CB" },
  { id:5, title:"UI/UX Design Intern", company:"PixelLab", location:"Kandy", type:"on-site", description:"Design wireframes and prototypes for web and mobile apps using Figma.", posted:"1 week ago", logo:"PL" },
  { id:6, title:"DevOps Intern", company:"InfraX", location:"Remote", type:"remote", description:"Help maintain CI/CD pipelines, monitor infrastructure, and automate deployments.", posted:"2 weeks ago", logo:"IX" },
];

export const MOCK_APPLICATIONS = [
  { id:1, title:"Frontend Developer Intern", company:"TechCorp", appliedDate:"Apr 10, 2025", status:"accepted" },
  { id:2, title:"Data Analyst Intern", company:"DataFlow", appliedDate:"Apr 12, 2025", status:"pending" },
  { id:3, title:"Marketing Intern", company:"BrandUp", appliedDate:"Apr 14, 2025", status:"rejected" },
  { id:4, title:"UI/UX Design Intern", company:"PixelLab", appliedDate:"Apr 18, 2025", status:"pending" },
];

export const MOCK_NOTIFICATIONS = [
  { id:1, message:"TechCorp accepted your application for Frontend Developer Intern.", time:"2 hours ago", type:"accepted" },
  { id:2, message:"BrandUp reviewed your application for Marketing Intern.", time:"1 day ago", type:"rejected" },
  { id:3, message:"New internship posted matching your skills: DevOps Intern at InfraX.", time:"2 days ago", type:"info" },
  { id:4, message:"DataFlow is reviewing your application.", time:"3 days ago", type:"info" },
];

export const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

export const icons = {
  home:      ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  browse:    "M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z",
  apps:      ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"],
  profile:   ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8"],
  bell:      ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  logout:    ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  map:       "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  briefcase: ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z", "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
  check:     "M20 6L9 17l-5-5",
  x:         ["M18 6L6 18", "M6 6l12 12"],
  clock:     ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2", "M12 6v6l4 2"],
  upload:    ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  chevron:   "M9 18l6-6-6-6",
  filter:    ["M22 3H2l8 9.46V19l4 2v-8.54L22 3"],
};