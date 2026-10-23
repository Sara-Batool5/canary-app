// Demo customers. `daysAgo` is turned into a real date when the demo is loaded,
// so the data always looks current.
export type DemoRow = {
  name: string
  plan: string
  revenue: number
  daysAgo: number
  tickets: number
  failedPayments: number
  usageChange: number
}

export const DEMO_ROWS: DemoRow[] = [
  { name: "Acme Analytics", plan: "Growth", revenue: 1250, daysAgo: 2, tickets: 1, failedPayments: 0, usageChange: 23 },
  { name: "Brightline Labs", plan: "Growth", revenue: 1060, daysAgo: 0, tickets: 1, failedPayments: 0, usageChange: 7 },
  { name: "Orbit Logistics", plan: "Starter", revenue: 330, daysAgo: 1, tickets: 0, failedPayments: 0, usageChange: -1 },
  { name: "Halcyon Health", plan: "Enterprise", revenue: 6720, daysAgo: 3, tickets: 0, failedPayments: 0, usageChange: 13 },
  { name: "Fernway Studio", plan: "Growth", revenue: 1430, daysAgo: 3, tickets: 0, failedPayments: 0, usageChange: 15 },
  { name: "Pinecrest Retail", plan: "Enterprise", revenue: 6560, daysAgo: 32, tickets: 5, failedPayments: 2, usageChange: -53 },
  { name: "Northwind Traders", plan: "Starter", revenue: 340, daysAgo: 1, tickets: 1, failedPayments: 0, usageChange: -8 },
  { name: "Lumen Robotics", plan: "Enterprise", revenue: 5320, daysAgo: 19, tickets: 3, failedPayments: 1, usageChange: -23 },
  { name: "Cobalt Freight", plan: "Scale", revenue: 3360, daysAgo: 4, tickets: 0, failedPayments: 0, usageChange: 3 },
  { name: "Silverleaf Foods", plan: "Growth", revenue: 1290, daysAgo: 2, tickets: 0, failedPayments: 0, usageChange: 11 },
  { name: "Quartz Finance", plan: "Growth", revenue: 1010, daysAgo: 0, tickets: 0, failedPayments: 0, usageChange: 19 },
  { name: "Bluepeak Software", plan: "Scale", revenue: 2790, daysAgo: 0, tickets: 0, failedPayments: 0, usageChange: 18 },
  { name: "Harbor & Co", plan: "Growth", revenue: 1470, daysAgo: 19, tickets: 1, failedPayments: 0, usageChange: -15 },
  { name: "Redwood Legal", plan: "Enterprise", revenue: 7040, daysAgo: 12, tickets: 1, failedPayments: 1, usageChange: -28 },
  { name: "Skyline Media", plan: "Enterprise", revenue: 7430, daysAgo: 5, tickets: 1, failedPayments: 0, usageChange: -5 },
  { name: "Tidewater Energy", plan: "Scale", revenue: 2630, daysAgo: 15, tickets: 3, failedPayments: 0, usageChange: -29 },
  { name: "Maple Street Bakery", plan: "Enterprise", revenue: 5830, daysAgo: 17, tickets: 1, failedPayments: 0, usageChange: -10 },
  { name: "Vertex Dental", plan: "Growth", revenue: 1490, daysAgo: 5, tickets: 1, failedPayments: 0, usageChange: -5 },
  { name: "Ironclad Security", plan: "Scale", revenue: 2760, daysAgo: 5, tickets: 1, failedPayments: 0, usageChange: -7 },
  { name: "Juniper Learning", plan: "Growth", revenue: 1440, daysAgo: 15, tickets: 1, failedPayments: 0, usageChange: -11 },
  { name: "Kestrel Aviation", plan: "Enterprise", revenue: 6510, daysAgo: 3, tickets: 0, failedPayments: 0, usageChange: 0 },
  { name: "Meridian Travel", plan: "Scale", revenue: 2760, daysAgo: 5, tickets: 0, failedPayments: 0, usageChange: 16 },
  { name: "Nimbus Cloudworks", plan: "Growth", revenue: 1470, daysAgo: 22, tickets: 4, failedPayments: 3, usageChange: -50 },
  { name: "Oakridge Realty", plan: "Growth", revenue: 1410, daysAgo: 40, tickets: 5, failedPayments: 2, usageChange: -27 },
  { name: "Paragon Pharma", plan: "Enterprise", revenue: 7280, daysAgo: 12, tickets: 1, failedPayments: 0, usageChange: -27 },
  { name: "Ripple Payments", plan: "Enterprise", revenue: 5390, daysAgo: 22, tickets: 5, failedPayments: 1, usageChange: -66 },
  { name: "Summit Outfitters", plan: "Starter", revenue: 310, daysAgo: 1, tickets: 0, failedPayments: 0, usageChange: 12 },
  { name: "Trellis Agency", plan: "Enterprise", revenue: 6540, daysAgo: 12, tickets: 3, failedPayments: 0, usageChange: -25 },
  { name: "Umbra Design", plan: "Growth", revenue: 1420, daysAgo: 1, tickets: 0, failedPayments: 0, usageChange: 24 },
  { name: "Violet Hotels", plan: "Starter", revenue: 330, daysAgo: 22, tickets: 5, failedPayments: 2, usageChange: -66 },
  { name: "Willow Wellness", plan: "Enterprise", revenue: 7320, daysAgo: 1, tickets: 0, failedPayments: 0, usageChange: 8 },
  { name: "Zenith Auto", plan: "Scale", revenue: 3630, daysAgo: 1, tickets: 1, failedPayments: 0, usageChange: 1 },
  { name: "Atlas Builders", plan: "Scale", revenue: 3600, daysAgo: 31, tickets: 5, failedPayments: 3, usageChange: -64 },
  { name: "Beacon Education", plan: "Starter", revenue: 290, daysAgo: 32, tickets: 4, failedPayments: 2, usageChange: -26 },
  { name: "Crescent Coffee", plan: "Growth", revenue: 990, daysAgo: 2, tickets: 0, failedPayments: 0, usageChange: 14 },
  { name: "Dune Interactive", plan: "Starter", revenue: 270, daysAgo: 17, tickets: 1, failedPayments: 0, usageChange: -10 },
  { name: "Ember Fitness", plan: "Starter", revenue: 310, daysAgo: 3, tickets: 0, failedPayments: 0, usageChange: 20 },
  { name: "Fable Publishing", plan: "Enterprise", revenue: 6610, daysAgo: 34, tickets: 5, failedPayments: 1, usageChange: -56 },
  { name: "Gable Insurance", plan: "Starter", revenue: 230, daysAgo: 17, tickets: 1, failedPayments: 0, usageChange: -22 },
  { name: "Horizon Clinics", plan: "Enterprise", revenue: 7200, daysAgo: 3, tickets: 0, failedPayments: 0, usageChange: 17 },
]

export type DemoTone = 'friendly' | 'formal' | 'short'

export function demoMessage(company: string, tone: DemoTone) {
  if (tone === 'formal') {
    return `Subject: Following up on your account

Dear ${company} team,

I am writing to follow up on your recent use of our service. We want to make sure it continues to meet your needs, and we would welcome the opportunity to address any questions or concerns.

Please let me know a convenient time for a short call this week.

Kind regards,
[Your name]`
  }
  if (tone === 'short') {
    return `Subject: Can I help?

Hi ${company} team, I wanted to check in and see how things are going. Is there anything I can help with? A quick call this week would be easy to set up.

Best,
[Your name]`
  }
  return `Subject: Quick check-in on your account

Hi ${company} team,

I noticed it has been a little while since your team was last active, and I wanted to see how things are going. If anything has been getting in the way, I would be glad to help sort it out.

Would a quick 15-minute call this week work? I can walk you through anything that is unclear.

Warm regards,
[Your name]`
}
