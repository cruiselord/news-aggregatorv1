export type BiasType = "pro-gov" | "independent" | "opposition"

export interface Story {
  id: string
  headline: string
  summary: string
  sourceCount: number
  readTime: string
  isBlindspot: boolean
  blindspotPercent?: number
  blindspotSide?: string
  thumbnail: string
  date: string
  biasBreakdown: { proGov: number; independent: number; opposition: number }
  topic: string
}

export interface Source {
  id: string
  name: string
  bias: BiasType
  factuality: number
  region: string
  ownership: string
  ownerName: string
  founded: string
  description: string
  url: string
  followers: number
  articlesThisWeek: number
}

export interface TrendingItem {
  topic: string
  articleCount: number
}

export interface LeaderboardUser {
  rank: number
  username: string
  points: number
  badge: string
  avatar: string
}

export const topics = [
  { name: "Politics", icon: "🏛️", slug: "politics", storyCount: 312 },
  { name: "Economy", icon: "📈", slug: "economy", storyCount: 214 },
  { name: "Security", icon: "🛡️", slug: "security", storyCount: 178 },
  { name: "Sports", icon: "⚽", slug: "sports", storyCount: 156 },
  { name: "Entertainment", icon: "🎬", slug: "entertainment", storyCount: 134 },
  { name: "Health", icon: "🏥", slug: "health", storyCount: 98 },
  { name: "Tech", icon: "💻", slug: "tech", storyCount: 76 },
]

export const sources: Source[] = [
  { id: "premium-times", name: "Premium Times", bias: "independent", factuality: 8.5, region: "National", ownership: "Private", ownerName: "Premium Times Services Ltd", founded: "2011", description: "Premium Times is an independent Nigerian news outlet known for investigative journalism and fact-based reporting. It has won multiple awards for its in-depth coverage of corruption and governance.", url: "https://premiumtimesng.com", followers: 12400, articlesThisWeek: 45 },
  { id: "punch-ng", name: "Punch", bias: "independent", factuality: 7.8, region: "National", ownership: "Private", ownerName: "Punch Nigeria Ltd", founded: "1971", description: "The Punch is one of Nigeria's most widely read newspapers, known for its bold editorial stance and comprehensive national coverage.", url: "https://punchng.com", followers: 15600, articlesThisWeek: 52 },
  { id: "channels-tv", name: "Channels TV", bias: "independent", factuality: 8.2, region: "National", ownership: "Private", ownerName: "Channels Media Group", founded: "1995", description: "Channels Television is one of Nigeria's leading broadcast media, providing 24-hour news coverage with a reputation for balanced reporting.", url: "https://channelstv.com", followers: 18200, articlesThisWeek: 38 },
  { id: "vanguard-ng", name: "Vanguard", bias: "independent", factuality: 7.2, region: "National", ownership: "Private", ownerName: "Vanguard Media Ltd", founded: "1984", description: "Vanguard is a major Nigerian daily newspaper covering politics, business, and social issues with a moderate editorial stance.", url: "https://vanguardngr.com", followers: 9800, articlesThisWeek: 41 },
  { id: "daily-trust", name: "Daily Trust", bias: "pro-gov", factuality: 6.8, region: "Northern", ownership: "Private", ownerName: "Media Trust Ltd", founded: "1998", description: "Daily Trust is Northern Nigeria's leading newspaper. It provides extensive coverage of Northern affairs and has been noted for its sometimes government-friendly editorial line.", url: "https://dailytrust.com", followers: 7600, articlesThisWeek: 36 },
  { id: "the-cable", name: "TheCable", bias: "independent", factuality: 8.0, region: "National", ownership: "Private", ownerName: "Cable Newspaper Ltd", founded: "2014", description: "TheCable is a digital-first news platform focused on holding government accountable through investigative journalism.", url: "https://thecable.ng", followers: 6200, articlesThisWeek: 28 },
  { id: "sahara-reporters", name: "Sahara Reporters", bias: "opposition", factuality: 6.5, region: "National", ownership: "Private", ownerName: "Sahara Reporters Media Group", founded: "2006", description: "Sahara Reporters is known for its citizen journalism approach and strong opposition stance. It frequently publishes leaked documents and whistleblower reports.", url: "https://saharareporters.com", followers: 11200, articlesThisWeek: 55 },
  { id: "nta", name: "NTA News", bias: "pro-gov", factuality: 5.5, region: "National", ownership: "Government", ownerName: "Federal Government of Nigeria", founded: "1977", description: "The Nigerian Television Authority is the state-owned broadcaster. Its coverage tends to favor the ruling government's narrative.", url: "https://nta.ng", followers: 4800, articlesThisWeek: 22 },
  { id: "arise-tv", name: "Arise TV", bias: "independent", factuality: 7.5, region: "National", ownership: "Private", ownerName: "Arise News Group", founded: "2013", description: "Arise TV provides premium news content with a focus on business and international affairs, maintaining editorial independence.", url: "https://arise.tv", followers: 8900, articlesThisWeek: 31 },
  { id: "guardian-ng", name: "The Guardian", bias: "independent", factuality: 7.9, region: "National", ownership: "Private", ownerName: "Guardian Newspapers Ltd", founded: "1983", description: "The Guardian Nigeria is a respected broadsheet known for its intellectual approach to journalism and comprehensive coverage.", url: "https://guardian.ng", followers: 7100, articlesThisWeek: 33 },
  { id: "leadership-ng", name: "Leadership", bias: "pro-gov", factuality: 6.2, region: "Northern", ownership: "Private", ownerName: "Leadership Group Ltd", founded: "2001", description: "Leadership newspaper has Northern Nigeria roots and is sometimes seen as sympathetic to the ruling party's perspective.", url: "https://leadership.ng", followers: 3400, articlesThisWeek: 25 },
  { id: "peoples-gazette", name: "Peoples Gazette", bias: "opposition", factuality: 7.0, region: "National", ownership: "Private", ownerName: "Peoples Gazette Inc", founded: "2020", description: "Peoples Gazette is a digital news outlet known for its investigative journalism and critical coverage of government activities.", url: "https://gazettengr.com", followers: 5100, articlesThisWeek: 32 },
]

export const stories: Story[] = [
  {
    id: "fuel-subsidy-removal",
    headline: "Fuel Subsidy Removal: States Announce New Transport Fares Amid Public Outcry",
    summary: "Multiple state governments have announced revised transport fares following the latest fuel price adjustment, with citizens expressing concern over rising costs.",
    sourceCount: 14,
    readTime: "8 min",
    isBlindspot: false,
    thumbnail: "/placeholder-news-1.jpg",
    date: "Feb 28, 2026",
    biasBreakdown: { proGov: 35, independent: 50, opposition: 15 },
    topic: "economy",
  },
  {
    id: "2027-election-inec",
    headline: "INEC Begins Voter Registration Drive for 2027 General Elections",
    summary: "The Independent National Electoral Commission has launched a nationwide voter registration exercise ahead of the 2027 elections.",
    sourceCount: 18,
    readTime: "6 min",
    isBlindspot: false,
    thumbnail: "/placeholder-news-2.jpg",
    date: "Feb 28, 2026",
    biasBreakdown: { proGov: 30, independent: 45, opposition: 25 },
    topic: "politics",
  },
  {
    id: "insecurity-northwest",
    headline: "Military Launches Operation in Northwest as Banditry Escalates",
    summary: "The Nigerian military has deployed additional troops to the Northwest region following increased bandit attacks on communities.",
    sourceCount: 11,
    readTime: "7 min",
    isBlindspot: true,
    blindspotPercent: 82,
    blindspotSide: "Pro-Government",
    thumbnail: "/placeholder-news-3.jpg",
    date: "Feb 27, 2026",
    biasBreakdown: { proGov: 82, independent: 12, opposition: 6 },
    topic: "security",
  },
  {
    id: "naira-exchange-rate",
    headline: "Naira Hits New Low Against Dollar as CBN Announces Policy Changes",
    summary: "The Central Bank of Nigeria has announced new monetary policy measures as the naira continues to depreciate against major currencies.",
    sourceCount: 22,
    readTime: "5 min",
    isBlindspot: false,
    thumbnail: "/placeholder-news-4.jpg",
    date: "Feb 27, 2026",
    biasBreakdown: { proGov: 25, independent: 55, opposition: 20 },
    topic: "economy",
  },
  {
    id: "education-asuu-strike",
    headline: "ASUU Threatens New Strike Over Unfulfilled Government Promises",
    summary: "The Academic Staff Union of Universities has issued a two-week ultimatum to the federal government over unpaid allowances.",
    sourceCount: 9,
    readTime: "4 min",
    isBlindspot: true,
    blindspotPercent: 89,
    blindspotSide: "Opposition",
    thumbnail: "/placeholder-news-5.jpg",
    date: "Feb 26, 2026",
    biasBreakdown: { proGov: 5, independent: 6, opposition: 89 },
    topic: "politics",
  },
  {
    id: "tech-startup-funding",
    headline: "Nigerian Fintech Raises $50M in Series B, Expands Across West Africa",
    summary: "A Lagos-based fintech company has secured $50 million in Series B funding, becoming one of the largest raises in the region this year.",
    sourceCount: 8,
    readTime: "3 min",
    isBlindspot: false,
    thumbnail: "/placeholder-news-6.jpg",
    date: "Feb 26, 2026",
    biasBreakdown: { proGov: 20, independent: 65, opposition: 15 },
    topic: "tech",
  },
  {
    id: "afcon-qualifiers",
    headline: "Super Eagles Qualify for AFCON 2027 with Dominant Win Over Ghana",
    summary: "Nigeria's Super Eagles have secured qualification for the Africa Cup of Nations with a convincing victory over rivals Ghana.",
    sourceCount: 16,
    readTime: "4 min",
    isBlindspot: false,
    thumbnail: "/placeholder-news-7.jpg",
    date: "Feb 25, 2026",
    biasBreakdown: { proGov: 15, independent: 70, opposition: 15 },
    topic: "sports",
  },
  {
    id: "health-cholera-outbreak",
    headline: "Cholera Outbreak in Borno: NCDC Deploys Emergency Response Teams",
    summary: "The Nigeria Centre for Disease Control has deployed rapid response teams to Borno State following a cholera outbreak affecting multiple communities.",
    sourceCount: 7,
    readTime: "5 min",
    isBlindspot: true,
    blindspotPercent: 75,
    blindspotSide: "Pro-Government",
    thumbnail: "/placeholder-news-8.jpg",
    date: "Feb 25, 2026",
    biasBreakdown: { proGov: 75, independent: 20, opposition: 5 },
    topic: "health",
  },
]

export const trendingItems: TrendingItem[] = [
  { topic: "Fuel Subsidy", articleCount: 45 },
  { topic: "2027 Elections", articleCount: 38 },
  { topic: "Naira Exchange Rate", articleCount: 32 },
  { topic: "ASUU Strike", articleCount: 28 },
  { topic: "Banditry Crisis", articleCount: 24 },
  { topic: "Tech Startups", articleCount: 18 },
  { topic: "AFCON 2027", articleCount: 15 },
  { topic: "Cholera Outbreak", articleCount: 12 },
]

export const leaderboardUsers: LeaderboardUser[] = [
  { rank: 1, username: "AdaObi_Lagos", points: 4250, badge: "Bias Buster", avatar: "AO" },
  { rank: 2, username: "ChiefReader_NG", points: 3890, badge: "News Hawk", avatar: "CR" },
  { rank: 3, username: "TruthSeeker9ja", points: 3670, badge: "Fact Finder", avatar: "TS" },
  { rank: 4, username: "NaijaAnalyst", points: 3450, badge: "Deep Diver", avatar: "NA" },
  { rank: 5, username: "BalancedView_NG", points: 3200, badge: "Bias Buster", avatar: "BV" },
  { rank: 6, username: "LagosNewsJunkie", points: 2980, badge: "News Hawk", avatar: "LN" },
  { rank: 7, username: "AbujaWatcher", points: 2750, badge: "Fact Finder", avatar: "AW" },
  { rank: 8, username: "MediaWatch_NG", points: 2600, badge: "Deep Diver", avatar: "MW" },
  { rank: 9, username: "PH_Reader", points: 2450, badge: "News Hawk", avatar: "PR" },
  { rank: 10, username: "KanoNews", points: 2300, badge: "Fact Finder", avatar: "KN" },
]

export const quizQuestions = [
  {
    id: 1,
    question: "Which Nigerian outlet was the FIRST to report on the fuel subsidy removal?",
    options: ["Premium Times", "Channels TV", "Punch", "Daily Trust"],
    correct: 0,
    explanation: "Premium Times broke the story 2 hours before other major outlets picked it up.",
  },
  {
    id: 2,
    question: "What percentage of Nigerian news coverage this week was classified as 'Independent'?",
    options: ["35%", "48%", "62%", "71%"],
    correct: 1,
    explanation: "48% of total coverage across all tracked outlets was rated as Independent this week.",
  },
  {
    id: 3,
    question: "Which story had the biggest 'Naija Blindspot' this week?",
    options: ["Fuel Subsidy", "ASUU Strike", "Northwest Security", "Naira Exchange"],
    correct: 1,
    explanation: "The ASUU Strike had 89% opposition-leaning coverage — the biggest blindspot this week.",
  },
  {
    id: 4,
    question: "How many Nigerian news sources does NaijaPulse currently track?",
    options: ["12", "24", "38", "52"],
    correct: 2,
    explanation: "NaijaPulse tracks 38 Nigerian news sources across different bias categories.",
  },
  {
    id: 5,
    question: "Which region produces the most pro-government coverage?",
    options: ["Southwest", "Southeast", "North Central", "Northwest"],
    correct: 3,
    explanation: "Northwest-based outlets produce the highest proportion of pro-government coverage.",
  },
]

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

export const timelineEvents = [
  {
    date: "Feb 28, 2026",
    status: "neutral" as const,
    title: "INEC announces final voter registration figures",
    coverageCount: 14,
    biasBreakdown: { proGov: 30, independent: 50, opposition: 20 },
  },
  {
    date: "Feb 21, 2026",
    status: "disputed" as const,
    title: "Opposition alliance announces joint candidate selection process",
    coverageCount: 18,
    biasBreakdown: { proGov: 15, independent: 40, opposition: 45 },
  },
  {
    date: "Feb 14, 2026",
    status: "crisis" as const,
    title: "Electoral violence reported in three states during local polls",
    coverageCount: 22,
    biasBreakdown: { proGov: 45, independent: 35, opposition: 20 },
  },
  {
    date: "Feb 7, 2026",
    status: "neutral" as const,
    title: "Ruling party completes nationwide ward congresses",
    coverageCount: 12,
    biasBreakdown: { proGov: 55, independent: 30, opposition: 15 },
  },
  {
    date: "Jan 31, 2026",
    status: "neutral" as const,
    title: "National Assembly passes electoral reform bill",
    coverageCount: 20,
    biasBreakdown: { proGov: 35, independent: 45, opposition: 20 },
  },
  {
    date: "Jan 24, 2026",
    status: "disputed" as const,
    title: "Controversy over proposed electronic voting amendments",
    coverageCount: 16,
    biasBreakdown: { proGov: 25, independent: 35, opposition: 40 },
  },
  {
    date: "Jan 15, 2026",
    status: "neutral" as const,
    title: "INEC launches 2027 election timeline and budget request",
    coverageCount: 10,
    biasBreakdown: { proGov: 28, independent: 52, opposition: 20 },
  },
]
