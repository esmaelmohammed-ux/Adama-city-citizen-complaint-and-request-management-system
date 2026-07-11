export const guestStats = [
  { iconKey: 'citizens', value: '48,200+', labelKey: 'stats.registeredCitizens', tone: 'purple' },
  { iconKey: 'resolved', value: '12,500+', labelKey: 'stats.complaintsResolved', tone: 'green' },
  { iconKey: 'requests', value: '9,300+', labelKey: 'stats.serviceRequests', tone: 'orange' },
  { iconKey: 'departments', value: '12', labelKey: 'stats.departments', tone: 'gray' },
];

export const heroStats = [
  { value: '48K+', labelKey: 'stats.citizensServed' },
  { value: '12K+', labelKey: 'stats.issuesResolved' },
  { value: '94%', labelKey: 'stats.responseRate' },
];

export const municipalServices = [
  { iconKey: 'roadMaintenance', titleKey: 'services.roadMaintenance', descKey: 'services.roadMaintenanceDesc', link: '/register' },
  { iconKey: 'wasteManagement', titleKey: 'services.wasteManagement', descKey: 'services.wasteManagementDesc', link: '/register' },
  { iconKey: 'waterSupply', titleKey: 'services.waterSupply', descKey: 'services.waterSupplyDesc', link: '/register' },
  { iconKey: 'streetLighting', titleKey: 'services.streetLighting', descKey: 'services.streetLightingDesc', link: '/register' },
  { iconKey: 'drainageIssues', titleKey: 'services.drainageIssues', descKey: 'services.drainageIssuesDesc', link: '/register' },
  { iconKey: 'buildingPermits', titleKey: 'services.buildingPermits', descKey: 'services.buildingPermitsDesc', link: '/register' },
];

export const complaintCategories = [
  { iconKey: 'road', labelKey: 'complaints.roadDamage' },
  { iconKey: 'water', labelKey: 'complaints.waterProblems' },
  { iconKey: 'light', labelKey: 'complaints.electricity' },
  { iconKey: 'waste', labelKey: 'complaints.wasteCollection' },
  { iconKey: 'noise', labelKey: 'complaints.noiseComplaint' },
  { iconKey: 'building', labelKey: 'complaints.illegalConstruction' },
  { iconKey: 'safety', labelKey: 'complaints.publicSafety' },
  { iconKey: 'traffic', labelKey: 'complaints.trafficIssues' },
  { iconKey: 'leaf', labelKey: 'complaints.environmental' },
  { iconKey: 'clean', labelKey: 'complaints.sanitation' },
  { iconKey: 'document', labelKey: 'complaints.generalComplaint' },
];

export const howItWorks = [
  { step: '01', iconKey: 'user', titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
  { step: '02', iconKey: 'edit', titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
  { step: '03', iconKey: 'assign', titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
  { step: '04', iconKey: 'track', titleKey: 'howItWorks.step4Title', descKey: 'howItWorks.step4Desc' },
];

export const newsItems = [
  {
    imageKey: 'digitalServicesLaunch',
    tagKey: 'news.announcement',
    tagTone: 'blue',
    date: '2026-06-20',
    titleKey: 'news.item1Title',
    excerptKey: 'news.item1Excerpt',
  },
  {
    imageKey: 'roadRehabilitation',
    tagKey: 'news.infrastructure',
    tagTone: 'orange',
    date: '2026-06-15',
    titleKey: 'news.item2Title',
    excerptKey: 'news.item2Excerpt',
  },
  {
    imageKey: 'waterSupplyUpdate',
    tagKey: 'news.notice',
    tagTone: 'green',
    date: '2026-06-10',
    titleKey: 'news.item3Title',
    excerptKey: 'news.item3Excerpt',
  },
];

export const testimonials = [
  {
    avatarKey: 'abebeGirma',
    name: 'Abebe Girma',
    roleKey: 'testimonials.role1',
    quoteKey: 'testimonials.quote1',
  },
  {
    avatarKey: 'fatumaAhmed',
    name: 'Fatuma Ahmed',
    roleKey: 'testimonials.role2',
    quoteKey: 'testimonials.quote2',
  },
  {
    avatarKey: 'bekeleTadesse',
    name: 'Bekele Tadesse',
    roleKey: 'testimonials.role3',
    quoteKey: 'testimonials.quote3',
  },
];

export const faqItems = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
];

export const footerQuickLinks = [
  { labelKey: 'nav.home', href: '#home' },
  { labelKey: 'footer.aboutUs', href: '#about' },
  { labelKey: 'nav.services', href: '#services' },
  { labelKey: 'footer.submitComplaint', href: '/register' },
  { labelKey: 'footer.trackRequest', href: '/login' },
  { labelKey: 'footer.newsEvents', href: '#news' },
  { labelKey: 'nav.faq', href: '#faq' },
];

export const footerSocialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'X (Twitter)', href: 'https://x.com', icon: 'x' },
  { label: 'Telegram', href: 'https://t.me', icon: 'telegram' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
];

export const footerServices = [
  'services.roadMaintenance',
  'services.wasteManagement',
  'services.waterSupply',
  'services.streetLighting',
  'services.buildingPermits',
  'footer.businessLicenses',
  'footer.landServices',
  'complaints.environmental',
];

export const navLinks = [
  { labelKey: 'nav.home', href: '#home' },
  { labelKey: 'nav.about', href: '#about' },
  { labelKey: 'nav.services', href: '#services' },
  { labelKey: 'nav.complaints', href: '#complaints' },
  { labelKey: 'nav.news', href: '#news' },
  { labelKey: 'nav.faq', href: '#faq' },
  { labelKey: 'nav.contact', href: '#contact' },
];
