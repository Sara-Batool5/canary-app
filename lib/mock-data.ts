export const currentUser = {
  name: 'Maya Lindqvist',
  email: 'maya@northwind.io',
  role: 'Head of Customer Success',
  initials: 'ML',
}

export type HealthStatus = 'healthy' | 'at-risk' | 'critical'

export const sampleCustomers: {
  name: string
  mrr: string
  health: HealthStatus
}[] = [
  { name: 'Acme Analytics', mrr: '$4,200', health: 'healthy' },
  { name: 'Brightline Labs', mrr: '$1,850', health: 'at-risk' },
  { name: 'Orbit Logistics', mrr: '$6,900', health: 'critical' },
]

export const riskTrend = [
  { month: 'May', atRisk: 18, revenueAtRisk: 42 },
  { month: 'Jun', atRisk: 22, revenueAtRisk: 51 },
  { month: 'Jul', atRisk: 19, revenueAtRisk: 47 },
  { month: 'Aug', atRisk: 27, revenueAtRisk: 66 },
  { month: 'Sep', atRisk: 24, revenueAtRisk: 61 },
  { month: 'Oct', atRisk: 31, revenueAtRisk: 78 },
]

export type StatTrend = 'positive' | 'negative'

export const dashboardStats: {
  label: string
  value: string
  change: string
  trend: StatTrend
  spark: number[]
}[] = [
  {
    label: 'Total customers',
    value: '1,284',
    change: '+2.1%',
    trend: 'positive',
    spark: [1180, 1196, 1210, 1222, 1241, 1258, 1284],
  },
  {
    label: 'At-risk customers',
    value: '31',
    change: '+7',
    trend: 'negative',
    spark: [18, 22, 19, 27, 24, 28, 31],
  },
  {
    label: 'Revenue at risk',
    value: '$78.4k',
    change: '+$17.2k',
    trend: 'negative',
    spark: [42, 51, 47, 66, 61, 70, 78],
  },
  {
    label: 'Revenue saved',
    value: '$124.6k',
    change: '+$12.4k',
    trend: 'positive',
    spark: [64, 72, 81, 90, 101, 112, 124],
  },
]

export const attentionAccounts: {
  name: string
  plan: string
  mrr: string
  reason: string
  health: HealthStatus
}[] = [
  {
    name: 'Orbit Logistics',
    plan: 'Enterprise',
    mrr: '$6,900',
    reason: 'Usage down 62% in 30 days',
    health: 'critical',
  },
  {
    name: 'Halcyon Health',
    plan: 'Scale',
    mrr: '$3,450',
    reason: 'Champion left the company',
    health: 'critical',
  },
  {
    name: 'Brightline Labs',
    plan: 'Growth',
    mrr: '$1,850',
    reason: '4 open support tickets',
    health: 'at-risk',
  },
  {
    name: 'Fernway Studio',
    plan: 'Growth',
    mrr: '$1,200',
    reason: 'Failed payment, retrying',
    health: 'at-risk',
  },
  {
    name: 'Pinecrest Retail',
    plan: 'Scale',
    mrr: '$2,780',
    reason: 'Renewal in 14 days, no reply',
    health: 'at-risk',
  },
]

export const notificationCount = 3
