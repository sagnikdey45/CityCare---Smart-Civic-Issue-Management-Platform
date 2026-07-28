export const mockAdminIssues = [
  {
    id: "1",
    ticket_id: "VNS-2024-001",
    title: "Pothole on Main Road near City Mall",
    description:
      "Large pothole causing traffic issues and safety hazard for two-wheelers.",
    category: "road",
    status: "pending",
    severity: "high",
    priority_score: 8.5,
    address: "Main Road, Sigra, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "road_damage",
    ai_confidence: 0.95,
    is_anonymous: false,
    reported_by: "user-1",
    upvotes: 24,
  },
  {
    id: "2",
    ticket_id: "VNS-2024-002",
    title: "Overflowing garbage bin at Godowlia Market",
    description:
      "Garbage bin has been overflowing for 3 days, causing hygiene issues.",
    category: "waste",
    status: "in_progress",
    severity: "medium",
    priority_score: 6.2,
    address: "Godowlia Market, Varanasi",
    assigned_to: "officer-1",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "waste_management",
    ai_confidence: 0.88,
    is_anonymous: false,
    reported_by: "user-2",
    upvotes: 15,
  },
  {
    id: "3",
    ticket_id: "VNS-2024-003",
    title: "Street lights not working in Durgakund area",
    description:
      "Multiple street lights have been non-functional for over a week.",
    category: "lighting",
    status: "pending",
    severity: "high",
    priority_score: 7.8,
    address: "Durgakund, Near BHU Gate, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "street_lighting",
    ai_confidence: 0.92,
    is_anonymous: false,
    reported_by: "user-3",
    upvotes: 31,
  },
  {
    id: "4",
    ticket_id: "VNS-2024-004",
    title: "Water leakage from main pipeline",
    description:
      "Continuous water leakage causing road damage and water wastage.",
    category: "water",
    status: "in_progress",
    severity: "high",
    priority_score: 9.1,
    address: "Lanka, Near Assi Ghat, Varanasi",
    assigned_to: "officer-2",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "water_supply",
    ai_confidence: 0.91,
    is_anonymous: false,
    reported_by: "user-4",
    upvotes: 42,
  },
  {
    id: "5",
    ticket_id: "VNS-2024-005",
    title: "Blocked drainage near Dashashwamedh Ghat",
    description:
      "Drainage system completely blocked, causing waterlogging during rain.",
    category: "drainage",
    status: "resolved",
    severity: "medium",
    priority_score: 5.4,
    address: "Dashashwamedh Ghat Road, Varanasi",
    assigned_to: "officer-1",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "drainage",
    ai_confidence: 0.89,
    is_anonymous: false,
    reported_by: "user-5",
    upvotes: 18,
  },
  {
    id: "6",
    ticket_id: "VNS-2024-006",
    title: "Broken footpath tiles near Railway Station",
    description:
      "Footpath tiles broken making it difficult for pedestrians to walk.",
    category: "road",
    status: "pending",
    severity: "low",
    priority_score: 4.2,
    address: "Varanasi Junction Railway Station, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "infrastructure",
    ai_confidence: 0.85,
    is_anonymous: true,
    reported_by: null,
    upvotes: 8,
  },
  {
    id: "7",
    ticket_id: "VNS-2024-007",
    title: "Large pothole on Main Road causing accidents",
    description:
      "Deep pothole at busy intersection has caused multiple vehicle accidents.",
    category: "road",
    status: "pending",
    severity: "high",
    priority_score: 9.5,
    address: "Main Road, Sigra, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "road_damage",
    ai_confidence: 0.94,
    is_anonymous: false,
    reported_by: "user-6",
    upvotes: 56,
  },
  {
    id: "8",
    ticket_id: "VNS-2024-008",
    title: "Garbage collection not done for 5 days in Cantonment area",
    description:
      "Regular garbage collection has stopped, creating health hazard.",
    category: "waste",
    status: "pending",
    severity: "high",
    priority_score: 8.2,
    address: "Cantonment Area, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "waste_management",
    ai_confidence: 0.93,
    is_anonymous: false,
    reported_by: "user-7",
    upvotes: 38,
  },
  {
    id: "9",
    ticket_id: "VNS-2024-009",
    title: "Stray animals blocking road",
    description:
      "Stray cattle regularly block the main road causing traffic jams.",
    category: "other",
    status: "pending",
    severity: "medium",
    priority_score: 5.8,
    address: "Golghar, Varanasi",
    assigned_to: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "other",
    ai_confidence: 0.78,
    is_anonymous: false,
    reported_by: "user-8",
    upvotes: 12,
  },
  {
    id: "10",
    ticket_id: "VNS-2024-010",
    title: "No water supply in Sunderpur for 2 days",
    description:
      "Entire area has no water supply, affecting hundreds of families.",
    category: "water",
    status: "in_progress",
    severity: "high",
    priority_score: 9.8,
    address: "Sunderpur, Varanasi",
    assigned_to: "officer-3",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ai_category: "water_supply",
    ai_confidence: 0.96,
    is_anonymous: false,
    reported_by: "user-9",
    upvotes: 78,
  },
];

export const mockAdminOfficers = [
  {
    id: "officer-1",
    full_name: "Rajesh Kumar",
    email: "rajesh.kumar@varanasi.gov.in",
    phone: "+91 9876543210",
    role: "ward_officer",
    ward_zone: "Zone A - Sigra",
    accountApproved: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "officer-2",
    full_name: "Priya Sharma",
    email: "priya.sharma@varanasi.gov.in",
    phone: "+91 9876543211",
    role: "ward_officer",
    ward_zone: "Zone B - Lanka",
    accountApproved: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "officer-3",
    full_name: "Amit Singh",
    email: "amit.singh@varanasi.gov.in",
    phone: "+91 9876543212",
    role: "field_worker",
    ward_zone: "Zone C - Sunderpur",
    accountApproved: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "officer-4",
    full_name: "Sunita Devi",
    email: "sunita.devi@varanasi.gov.in",
    phone: "+91 9876543213",
    role: "field_worker",
    ward_zone: "Zone A - Sigra",
    accountApproved: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pending-officer-1",
    full_name: "Vikram Yadav",
    email: "vikram.yadav@varanasi.gov.in",
    phone: "+91 9876543214",
    role: "ward_officer",
    ward_zone: "Zone D - Godowlia",
    accountApproved: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pending-officer-2",
    full_name: "Meera Gupta",
    email: "meera.gupta@varanasi.gov.in",
    phone: "+91 9876543215",
    role: "field_worker",
    ward_zone: "Zone B - Lanka",
    accountApproved: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pending-officer-3",
    full_name: "Rahul Verma",
    email: "rahul.verma@varanasi.gov.in",
    phone: "+91 9876543216",
    role: "ward_officer",
    ward_zone: "Zone E - Cantonment",
    accountApproved: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockAdminAuditLogs = [
  {
    id: "audit-1",
    action: "Officer Approved",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "officer-4",
    notes: "Approved field worker application for Zone A",
  },
  {
    id: "audit-2",
    action: "Issue Escalated",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "VNS-2024-003",
    notes: "Escalated street lighting issue due to SLA breach",
  },
  {
    id: "audit-3",
    action: "Issue Reassigned",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "VNS-2024-004",
    notes: "Reassigned to officer-2 for immediate attention",
  },
  {
    id: "audit-4",
    action: "Duplicates Merged",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "VNS-2024-001",
    notes: "Merged 2 duplicate pothole reports",
  },
  {
    id: "audit-5",
    action: "Issue Verified",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "VNS-2024-002",
    notes: "Marked issue as in progress after verification",
  },
  {
    id: "audit-6",
    action: "Officer Rejected",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "rejected-officer-1",
    notes: "Rejected application due to incomplete documentation",
  },
  {
    id: "audit-7",
    action: "Issue Closed",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "VNS-2024-005",
    notes: "Issue resolved and marked as closed",
  },
  {
    id: "audit-8",
    action: "Officer Approved",
    performed_by: "City Admin",
    performer_role: "admin",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString(),
    affected_entity: "officer-3",
    notes: "Approved field worker application for Zone C",
  },
];

export const initializeCityAdminMockData = () => {
  if (!localStorage.getItem("cityAdminIssues")) {
    localStorage.setItem("cityAdminIssues", JSON.stringify(mockAdminIssues));
  }
  if (!localStorage.getItem("cityAdminOfficers")) {
    localStorage.setItem(
      "cityAdminOfficers",
      JSON.stringify(mockAdminOfficers),
    );
  }
  if (!localStorage.getItem("cityAdminAuditLogs")) {
    localStorage.setItem(
      "cityAdminAuditLogs",
      JSON.stringify(mockAdminAuditLogs),
    );
  }
};

export const getCityAdminIssues = () => {
  const data = localStorage.getItem("cityAdminIssues");
  return data ? JSON.parse(data) : mockAdminIssues;
};

export const setCityAdminIssues = (issues) => {
  localStorage.setItem("cityAdminIssues", JSON.stringify(issues));
};

export const getCityAdminOfficers = () => {
  const data = localStorage.getItem("cityAdminOfficers");
  return data ? JSON.parse(data) : mockAdminOfficers;
};

export const setCityAdminOfficers = (officers) => {
  localStorage.setItem("cityAdminOfficers", JSON.stringify(officers));
};

export const getCityAdminAuditLogs = () => {
  const data = localStorage.getItem("cityAdminAuditLogs");
  return data ? JSON.parse(data) : mockAdminAuditLogs;
};

export const addCityAdminAuditLog = (log) => {
  const logs = getCityAdminAuditLogs();
  const newLog = {
    ...log,
    id: `audit-${Date.now()}`,
  };
  logs.unshift(newLog);
  localStorage.setItem("cityAdminAuditLogs", JSON.stringify(logs));
};
