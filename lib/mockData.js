export const mockUsers = [
  {
    id: "1",
    full_name: "Rajveer Singh",
    role: "citizen",
    email: "rajveer@example.com",
    notification_enabled: true,
    points: 720,
    language_preference: "en",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Ankit Verma",
    role: "admin",
    email: "ankit@example.com",
    notification_enabled: true,
    points: 990,
    language_preference: "en",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "3",
    full_name: "Debaditya Sen",
    role: "unit_officer",
    email: "debaditya@example.com",
    notification_enabled: true,
    ward_zone: "Ward 5",
    points: 320,
    language_preference: "en",
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "4",
    full_name: "Rohit Mishra",
    role: "field_officer",
    email: "rohit@example.com",
    notification_enabled: true,
    points: 890,
    language_preference: "en",
    createdAt: "2024-01-20T11:00:00Z",
  },
  {
    id: "5",
    full_name: "Chirag Patel",
    role: "field_officer",
    email: "chirag@example.com",
    notification_enabled: true,
    points: 510,
    language_preference: "en",
    createdAt: "2024-02-15T10:30:00Z",
  },
  {
    id: "6",
    full_name: "Mrittika Roy",
    role: "citizen",
    email: "mrittika@example.com",
    notification_enabled: true,
    points: 640,
    language_preference: "en",
    createdAt: "2024-02-18T07:20:00Z",
  },
  {
    id: "7",
    full_name: "Siddhanta Das",
    role: "citizen",
    email: "siddhanta@example.com",
    notification_enabled: false,
    points: 430,
    language_preference: "en",
    createdAt: "2024-03-02T12:45:00Z",
  },
  {
    id: "8",
    full_name: "Ashmita Ghosh",
    role: "citizen",
    email: "ashmita@example.com",
    notification_enabled: true,
    points: 280,
    language_preference: "en",
    createdAt: "2024-03-12T06:30:00Z",
  },
  {
    id: "9",
    full_name: "Aditya Sharma",
    role: "citizen",
    email: "aditya@example.com",
    notification_enabled: true,
    points: 350,
    language_preference: "en",
    createdAt: "2024-03-20T14:10:00Z",
  },
  {
    id: "10",
    full_name: "Anwesha Banerjee",
    role: "citizen",
    email: "anwesha@example.com",
    notification_enabled: true,
    points: 410,
    language_preference: "en",
    createdAt: "2024-04-05T09:05:00Z",
  },
  {
    id: "11",
    full_name: "Hridoyta Sen",
    role: "citizen",
    email: "hridoyta@example.com",
    notification_enabled: false,
    points: 195,
    language_preference: "en",
    createdAt: "2024-04-12T16:35:00Z",
  },
  {
    id: "12",
    full_name: "Sashreek Mukherjee",
    role: "unit_officer",
    email: "sashreek@example.com",
    notification_enabled: true,
    ward_zone: "Ward 2",
    points: 540,
    language_preference: "en",
    createdAt: "2024-02-08T10:10:00Z",
  },
  {
    id: "13",
    full_name: "Arkajit Basu",
    role: "unit_officer",
    email: "arkajit@example.com",
    notification_enabled: true,
    ward_zone: "Ward 8",
    points: 610,
    language_preference: "en",
    createdAt: "2024-02-22T08:40:00Z",
  },
  {
    id: "14",
    full_name: "Siddhartha Nandi",
    role: "unit_officer",
    email: "siddhartha@example.com",
    notification_enabled: false,
    ward_zone: "Ward 11",
    points: 390,
    language_preference: "en",
    createdAt: "2024-03-03T13:15:00Z",
  },

  // Field Officers
  {
    id: "15",
    full_name: "Ankit Tiwari",
    role: "field_officer",
    email: "ankitt@example.com",
    notification_enabled: true,
    points: 770,
    language_preference: "en",
    createdAt: "2024-01-28T09:25:00Z",
  },
  {
    id: "16",
    full_name: "Rohit Pandey",
    role: "field_officer",
    email: "rohitp@example.com",
    notification_enabled: true,
    points: 460,
    language_preference: "en",
    createdAt: "2024-02-25T11:55:00Z",
  },
  {
    id: "17",
    full_name: "Debanjan Chakraborty",
    role: "field_officer",
    email: "debanjan@example.com",
    notification_enabled: true,
    points: 830,
    language_preference: "en",
    createdAt: "2024-03-10T10:05:00Z",
  },
  {
    id: "18",
    full_name: "Chirag Mehta",
    role: "field_officer",
    email: "chiragm@example.com",
    notification_enabled: false,
    points: 520,
    language_preference: "en",
    createdAt: "2024-03-18T15:45:00Z",
  },
  {
    id: "19",
    full_name: "Siddhant Agarwal",
    role: "field_officer",
    email: "siddhant@example.com",
    notification_enabled: true,
    points: 300,
    language_preference: "en",
    createdAt: "2024-04-01T07:50:00Z",
  },
  {
    id: "20",
    full_name: "Aditya Prakash",
    role: "admin",
    email: "adityap@example.com",
    notification_enabled: true,
    points: 950,
    language_preference: "en",
    createdAt: "2024-01-05T06:00:00Z",
  },
];

export const mockIssues = [
  {
    id: "1",
    ticket: "IMP-2024-0001",
    title: "Large pothole near Lanka Road",
    description:
      "There is a dangerous pothole near the BHU Lanka gate causing traffic congestion and accidents.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priorityScore: 32.5,
    upvotes: 15,
    aiCategory: "road",
    ai_confidence: 0.92,
    photoUrl:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg",
    latitude: 25.2769,
    longitude: 82.9995,
    address: "Lanka Road, Near BHU Gate, Varanasi, UP",
    reportedBy: "1",
    assignedTo: "4",
    isAnonymous: false,
    createdAt: "2024-03-01T09:30:00Z",
    updatedAt: "2024-03-05T14:20:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[3],
    wardOfficer: mockUsers[2],
  },

  {
    id: "2",
    ticket: "IMP-2024-0002",
    title: "Streetlight not working at Sigra",
    description:
      "The streetlight near Sigra crossing has not been working for a week.",
    category: "lighting",
    status: "resolved",
    severity: "medium",
    priorityScore: 22.3,
    upvotes: 8,
    aiCategory: "lighting",
    ai_confidence: 0.95,
    photoUrl:
      "https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg",
    latitude: 25.3117,
    longitude: 82.9903,
    address: "Sigra Crossing, Varanasi, UP",
    reportedBy: "4",
    isAnonymous: false,
    createdAt: "2024-02-20T18:45:00Z",
    updatedAt: "2024-02-28T10:15:00Z",
    reporter: mockUsers[3],
  },

  {
    id: "3",
    ticket: "IMP-2024-0003",
    title: "Overflowing garbage near Assi Ghat",
    description:
      "Garbage bins near Assi Ghat are overflowing and spreading foul smell.",
    category: "waste",
    status: "in_progress",
    severity: "high",
    priorityScore: 28.7,
    upvotes: 22,
    aiCategory: "waste",
    ai_confidence: 0.89,
    photoUrl:
      "https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg",
    latitude: 25.2883,
    longitude: 83.0061,
    address: "Assi Ghat Road, Varanasi, UP",
    reportedBy: "1",
    assignedTo: "3",
    isAnonymous: false,
    createdAt: "2024-03-10T08:15:00Z",
    updatedAt: "2024-03-10T08:15:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[2],
  },

  {
    id: "4",
    ticket: "IMP-2024-0004",
    title: "Water leakage near Dashashwamedh Ghat",
    description: "Water pipe leaking continuously near Dashashwamedh Ghat.",
    category: "water",
    status: "in_progress",
    severity: "medium",
    priorityScore: 19.5,
    upvotes: 5,
    aiCategory: "water",
    ai_confidence: 0.87,
    latitude: 25.3067,
    longitude: 83.0104,
    address: "Dashashwamedh Ghat, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-08T12:00:00Z",
    updatedAt: "2024-03-09T09:30:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
  },

  {
    id: "5",
    ticket: "IMP-2024-0005",
    title: "Broken sidewalk at Godowlia",
    description: "Cracked footpath near Godowlia market causing inconvenience.",
    category: "road",
    status: "pending",
    severity: "low",
    priorityScore: 12.8,
    upvotes: 3,
    latitude: 25.3096,
    longitude: 83.0075,
    address: "Godowlia Market, Varanasi, UP",
    reportedBy: "1",
    isAnonymous: false,
    createdAt: "2024-03-12T15:20:00Z",
    updatedAt: "2024-03-12T15:20:00Z",
    reporter: mockUsers[0],
  },

  {
    id: "6",
    ticket: "IMP-2024-0006",
    title: "Graffiti near Cantt Station",
    description: "Graffiti on railway wall near Varanasi Cantt Station.",
    category: "other",
    status: "resolved",
    severity: "low",
    priorityScore: 11.2,
    upvotes: 2,
    photoUrl:
      "https://images.pexels.com/photos/1152851/pexels-photo-1152851.jpeg",
    latitude: 25.3284,
    longitude: 82.986,
    address: "Varanasi Cantt Railway Station, UP",
    isAnonymous: true,
    anonymousContact: "anon@temp.mail",
    createdAt: "2024-02-25T10:00:00Z",
    updatedAt: "2024-03-02T16:45:00Z",
  },

  {
    id: "7",
    ticket: "IMP-2024-0007",
    title: "Damaged traffic sign near Ravindrapuri",
    description: "Traffic sign damaged near Ravindrapuri crossing.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priorityScore: 30.2,
    upvotes: 18,
    photoUrl:
      "https://images.pexels.com/photos/208087/pexels-photo-208087.jpeg",
    latitude: 25.2859,
    longitude: 83.0123,
    address: "Ravindrapuri Crossing, Varanasi, UP",
    reportedBy: "1",
    assignedTo: "4",
    isAnonymous: false,
    createdAt: "2024-03-15T11:20:00Z",
    updatedAt: "2024-03-15T11:20:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[3],
  },

  {
    id: "8",
    ticket: "IMP-2024-0008",
    title: "Broken bench at Nagar Nigam Park",
    description: "Bench broken near Nagar Nigam Park area.",
    category: "other",
    status: "in_progress",
    severity: "medium",
    priorityScore: 16.5,
    upvotes: 6,
    photoUrl:
      "https://images.pexels.com/photos/2305165/pexels-photo-2305165.jpeg",
    latitude: 25.3185,
    longitude: 83.0017,
    address: "Nagar Nigam Park, Sigra, Varanasi",
    reportedBy: "1",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-18T14:35:00Z",
    updatedAt: "2024-03-19T09:10:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[4],
  },

  {
    id: "9",
    ticket: "IMP-2024-0009",
    title: "Leaking fire hydrant at Maldahiya",
    description: "Fire hydrant leaking water continuously at Maldahiya.",
    category: "water",
    status: "in_progress",
    severity: "medium",
    priorityScore: 21.4,
    upvotes: 9,
    latitude: 25.3236,
    longitude: 82.995,
    address: "Maldahiya Crossing, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "3",
    isAnonymous: false,
    createdAt: "2024-03-20T08:45:00Z",
    updatedAt: "2024-03-20T08:45:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[2],
  },

  {
    id: "10",
    ticket: "IMP-2024-0010",
    title: "Open manhole near BHU Campus",
    description: "Manhole cover missing near BHU main road.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priorityScore: 45.8,
    upvotes: 32,
    photoUrl:
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
    latitude: 25.2679,
    longitude: 82.9912,
    address: "BHU Main Road, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "3",
    isAnonymous: false,
    createdAt: "2024-03-21T07:15:00Z",
    updatedAt: "2024-03-21T08:00:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "11",
    ticket: "IMP-2024-0011",
    title: "Flickering streetlights near Godowlia",
    description:
      "Multiple streetlights near Godowlia Chowk are flickering constantly. Very annoying and potentially dangerous.",
    category: "lighting",
    status: "in_progress",
    severity: "low",
    priorityScore: 14.3,
    upvotes: 4,
    latitude: 25.3095,
    longitude: 83.0067,
    address: "Godowlia Chowk, Varanasi, UP",
    reportedBy: "1",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-22T19:30:00Z",
    updatedAt: "2024-03-22T19:30:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[4],
  },

  {
    id: "12",
    ticket: "IMP-2024-0012",
    title: "Illegal dumping near Maldahiya",
    description:
      "Large amount of construction debris dumped illegally near residential buildings in Maldahiya area.",
    category: "waste",
    status: "resolved",
    severity: "medium",
    priorityScore: 24.6,
    upvotes: 11,
    photoUrl:
      "https://images.pexels.com/photos/3186574/pexels-photo-3186574.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3238,
    longitude: 82.9949,
    address: "Maldahiya Crossing, Varanasi, UP",
    reportedBy: "1",
    isAnonymous: false,
    createdAt: "2024-03-14T10:20:00Z",
    updatedAt: "2024-03-17T16:30:00Z",
    reporter: mockUsers[0],
  },

  {
    id: "13",
    ticket: "IMP-2024-0013",
    title: "Cracked pavement near Sigra Crossing",
    description:
      "Large cracks in the pavement near Sigra Crossing. Pedestrians facing difficulty crossing safely.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priorityScore: 33.7,
    upvotes: 27,
    photoUrl:
      "https://images.pexels.com/photos/257836/pexels-photo-257836.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3182,
    longitude: 82.9878,
    address: "Sigra Crossing, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "4",
    isAnonymous: false,
    createdAt: "2024-03-23T08:15:00Z",
    updatedAt: "2024-03-23T08:15:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[3],
  },

  {
    id: "14",
    ticket: "IMP-2024-0014",
    title: "Broken traffic light at Cantt Road",
    description:
      "Traffic light near Varanasi Cantt Road is malfunctioning and causing traffic congestion.",
    category: "other",
    status: "in_progress",
    severity: "high",
    priorityScore: 41.2,
    upvotes: 38,
    photoUrl:
      "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3291,
    longitude: 82.9873,
    address: "Cantt Road, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "3",
    isAnonymous: false,
    createdAt: "2024-03-21T07:45:00Z",
    updatedAt: "2024-03-22T10:30:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[2],
  },

  {
    id: "15",
    ticket: "IMP-2024-0015",
    title: "No lighting near Varanasi Junction entrance",
    description:
      "Streetlights near Varanasi Junction entrance have been out for weeks. Area is unsafe at night.",
    category: "lighting",
    status: "in_progress",
    severity: "high",
    priorityScore: 36.4,
    upvotes: 44,
    latitude: 25.3274,
    longitude: 82.9872,
    address: "Varanasi Junction Railway Station, UP",
    reportedBy: "4",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-19T21:30:00Z",
    updatedAt: "2024-03-19T21:30:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
  },

  {
    id: "16",
    ticket: "IMP-2024-0016",
    title: "Overflowing bins at Nagar Nigam Park",
    description:
      "Recycling bins at Nagar Nigam Park are overflowing and waste is spreading around.",
    category: "waste",
    status: "in_progress",
    severity: "medium",
    priorityScore: 20.8,
    upvotes: 13,
    photoUrl:
      "https://images.pexels.com/photos/3178938/pexels-photo-3178938.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3187,
    longitude: 83.0019,
    address: "Nagar Nigam Park, Sigra, Varanasi",
    reportedBy: "3",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-24T11:00:00Z",
    updatedAt: "2024-03-24T14:20:00Z",
    reporter: mockUsers[2],
    assignee: mockUsers[4],
  },

  {
    id: "17",
    ticket: "IMP-2024-0017",
    title: "Broken water fountain at BHU Library",
    description:
      "Water fountain near BHU Central Library has been broken for months.",
    category: "water",
    status: "in_progress",
    severity: "low",
    priorityScore: 9.3,
    upvotes: 7,
    latitude: 25.2678,
    longitude: 82.9914,
    address: "BHU Central Library, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "3",
    isAnonymous: false,
    createdAt: "2024-03-20T15:45:00Z",
    updatedAt: "2024-03-20T15:45:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "18",
    ticket: "IMP-2024-0018",
    title: "Damaged playground equipment at Shivpur Park",
    description: "Children’s playground slide is damaged and unsafe for use.",
    category: "other",
    status: "in_progress",
    severity: "high",
    priorityScore: 38.9,
    upvotes: 51,
    photoUrl:
      "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3514,
    longitude: 82.9789,
    address: "Shivpur Park, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-22T10:00:00Z",
    updatedAt: "2024-03-23T09:15:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
  },

  {
    id: "19",
    ticket: "IMP-2024-0019",
    title: "Fallen tree blocking road near Mahmoorganj",
    description:
      "Large tree branch has fallen and is blocking the road after heavy rain.",
    category: "other",
    status: "resolved",
    severity: "high",
    priorityScore: 42.1,
    upvotes: 29,
    photoUrl:
      "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3056,
    longitude: 82.9739,
    address: "Mahmoorganj Road, Varanasi, UP",
    reportedBy: "3",
    isAnonymous: false,
    createdAt: "2024-03-16T06:30:00Z",
    updatedAt: "2024-03-16T15:45:00Z",
    reporter: mockUsers[2],
  },

  {
    id: "20",
    ticket: "IMP-2024-0020",
    title: "Faded pedestrian crossing near Lanka",
    description:
      "Pedestrian crossing near Lanka area has faded markings making it unsafe.",
    category: "road",
    status: "in_progress",
    severity: "medium",
    priorityScore: 25.3,
    upvotes: 16,
    latitude: 25.2791,
    longitude: 82.9986,
    address: "Lanka Road, Varanasi, UP",
    reportedBy: "3",
    assignedTo: "4",
    isAnonymous: false,
    createdAt: "2024-03-25T09:20:00Z",
    updatedAt: "2024-03-25T09:20:00Z",
    reporter: mockUsers[2],
    assignee: mockUsers[3],
  },

  {
    id: "21",
    ticket: "IMP-2024-0021",
    title: "Broken restroom door lock at Assi Ghat",
    description:
      "Public restroom near Assi Ghat has broken door lock causing privacy issues.",
    category: "other",
    status: "in_progress",
    severity: "medium",
    priorityScore: 18.7,
    upvotes: 12,
    latitude: 25.2884,
    longitude: 82.9879,
    address: "Assi Ghat Public Toilet, Varanasi, UP",
    reportedBy: "4",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-24T16:10:00Z",
    updatedAt: "2024-03-24T16:10:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
  },
  {
    id: "22",
    ticket: "IMP-2024-0022",
    title: "Stagnant water pooling on street",
    description:
      "Large puddle of stagnant water has been sitting on Canal Street for over a week after the rain. Mosquito breeding ground and bad smell.",
    category: "water",
    status: "in_progress",
    severity: "medium",
    priorityScore: 23.4,
    upvotes: 14,
    latitude: 40.7185,
    longitude: -74.001,
    address: "345 Canal Street, Chinatown, NY",
    reportedBy: "3",
    assignedTo: "5",
    isAnonymous: false,
    createdAt: "2024-03-23T12:30:00Z",
    updatedAt: "2024-03-24T08:00:00Z",
    reporter: mockUsers[2],
    assignee: mockUsers[4],
  },
  {
    id: "31",
    ticket_id: "FO-VNS-2024-001",
    title: "[FO] Broken road near Dashashwamedh Ghat",
    description:
      "Previous repair work did not fully fix the pothole near the main ghat entrance. The area needs to be redone with proper asphalt filling as it poses risk to pilgrims and tourists.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priority_score: 35.2,
    upvotes: 17,
    photo_url:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3109,
    longitude: 83.0103,
    address: "Near Dashashwamedh Ghat, Godowlia, Varanasi, UP 221001",
    reported_by: "1",
    assignedTo: "4",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-18T10:00:00Z",
    updated_at: "2024-03-27T09:30:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[3],
    ward_officer: mockUsers[2],
    rework_requested: true,
    rework_reason:
      "Ward Officer review: The pothole repair was not completed to standard. The asphalt patch is uneven and already showing signs of cracking. Please redo the entire repair with proper depth and compaction.",
  },
  {
    id: "32",
    ticket_id: "FO-VNS-2024-002",
    title: "[FO] Waste bins not properly installed at Assi Ghat",
    description:
      "Replaced garbage bins are not properly secured and are missing lids. Need to complete the installation properly to maintain cleanliness at this major ghat.",
    category: "waste",
    status: "in_progress",
    severity: "medium",
    priority_score: 22.8,
    upvotes: 9,
    photo_url:
      "https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.282,
    longitude: 82.991,
    address: "Assi Ghat Road, Assi, Varanasi, UP 221005",
    reported_by: "4",
    assignedTo: "5",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-19T14:20:00Z",
    updated_at: "2024-03-27T11:15:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
    ward_officer: mockUsers[2],
    rework_requested: true,
    rework_reason:
      "The bins were placed but lids are missing and the bins are not secured to the ground. Please complete the installation by adding lids and securing all bins with proper anchors.",
  },
  {
    id: "33",
    ticket_id: "FO-VNS-2024-003",
    title: "[FO] Street light misaligned on Maidagin Road",
    description:
      "New street light was installed but is not aligned properly and the wiring is exposed. Safety concern for pedestrians on this busy market street.",
    category: "lighting",
    status: "in_progress",
    severity: "high",
    priority_score: 31.5,
    upvotes: 14,
    photo_url:
      "https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3189,
    longitude: 82.9876,
    address: "Maidagin Road, Chowk, Varanasi, UP 221001",
    reported_by: "1",
    assignedTo: "4",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-21T08:45:00Z",
    updated_at: "2024-03-27T13:00:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[3],
    ward_officer: mockUsers[2],
    rework_requested: true,
    rework_reason:
      "Installation quality check failed. The light fixture is tilted at a dangerous angle and electrical wiring is exposed, creating a safety hazard. Must realign the fixture and properly conceal all wiring per safety standards.",
  },
  {
    id: "34",
    ticket_id: "FO-VNS-2024-004",
    title: "[FO] Water supply pipe leak at Sigra",
    description:
      "Recently repaired water pipe connection near Sigra Stadium is still showing signs of leakage. The repair was not done properly and water is being wasted.",
    category: "water",
    status: "in_progress",
    severity: "medium",
    priority_score: 26.7,
    upvotes: 12,
    photo_url:
      "https://images.pexels.com/photos/1402407/pexels-photo-1402407.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.2916,
    longitude: 82.9865,
    address: "Near Sigra Stadium, Sigra, Varanasi, UP 221010",
    reported_by: "4",
    assignedTo: "5",
    is_anonymous: false,
    createdAt: "2024-03-23T11:30:00Z",
    updated_at: "2024-03-27T14:45:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
    rework_requested: true,
    rework_reason:
      "The pipe joint is still leaking water. The sealant or connection was not properly applied. Please redo the repair with proper materials and ensure there are no leaks before marking as complete.",
  },
  {
    id: "35",
    ticket_id: "FO-VNS-2024-005",
    title: "[FO] Potholes on Lanka Road near BHU",
    description:
      "Multiple potholes have developed on Lanka Road causing traffic disruption and accidents. This is a major route for students and needs immediate attention.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priority_score: 42.3,
    upvotes: 34,
    photo_url:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.2677,
    longitude: 82.9913,
    address: "Lanka Road, BHU Campus, Varanasi, UP 221005",
    reported_by: "1",
    assignedTo: "4",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-15T09:00:00Z",
    updated_at: "2024-03-27T10:00:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[3],
    ward_officer: mockUsers[2],
  },
  {
    id: "36",
    ticket_id: "FO-VNS-2024-006",
    title: "[FO] Non-functional street lights at Godowlia Chowk",
    description:
      "Several street lights at Godowlia Chowk intersection have stopped working, creating safety issues during evening hours in this busy commercial area.",
    category: "lighting",
    status: "pending",
    severity: "high",
    priority_score: 38.7,
    upvotes: 28,
    photo_url:
      "https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3145,
    longitude: 83.0087,
    address: "Godowlia Chowk, Varanasi, UP 221001",
    reported_by: "4",
    assignedTo: "4",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-20T08:30:00Z",
    updated_at: "2024-03-20T08:30:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[3],
    ward_officer: mockUsers[2],
  },
  {
    id: "37",
    ticket_id: "FO-VNS-2024-007",
    title: "[FO] Overflowing garbage at Rathyatra Crossing",
    description:
      "Commercial waste has been accumulating at Rathyatra for 3 days. Bins are overflowing and garbage is scattered on the road creating unhygienic conditions.",
    category: "waste",
    status: "in_progress",
    severity: "high",
    priority_score: 33.5,
    upvotes: 21,
    photo_url:
      "https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3298,
    longitude: 83.0042,
    address: "Rathyatra Crossing, Varanasi, UP 221001",
    reported_by: "1",
    assignedTo: "5",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-22T07:15:00Z",
    updated_at: "2024-03-26T14:30:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[4],
    ward_officer: mockUsers[2],
  },
  {
    id: "38",
    ticket_id: "FO-VNS-2024-008",
    title: "[FO] Water logging at Lahurabir Junction",
    description:
      "Severe water logging occurs at Lahurabir during rains due to blocked drainage. Water accumulation disrupts traffic and affects nearby shops.",
    category: "water",
    status: "pending",
    severity: "medium",
    priority_score: 28.4,
    upvotes: 19,
    photo_url:
      "https://images.pexels.com/photos/1402407/pexels-photo-1402407.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3223,
    longitude: 83.0012,
    address: "Lahurabir Junction, Varanasi, UP 221001",
    reported_by: "4",
    assignedTo: "4",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-24T10:45:00Z",
    updated_at: "2024-03-24T10:45:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[3],
    ward_officer: mockUsers[2],
  },
  {
    id: "39",
    ticket_id: "FO-VNS-2024-009",
    title: "[FO] Broken footpath tiles near Vishwanath Temple",
    description:
      "Footpath tiles are broken and displaced near the main approach to Kashi Vishwanath Temple, posing danger to elderly pilgrims and devotees.",
    category: "road",
    status: "in_progress",
    severity: "high",
    priority_score: 36.8,
    upvotes: 25,
    photo_url:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3105,
    longitude: 83.0107,
    address: "Near Vishwanath Temple, Varanasi, UP 221001",
    reported_by: "1",
    assignedTo: "5",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-16T11:20:00Z",
    updated_at: "2024-03-25T09:00:00Z",
    reporter: mockUsers[0],
    assignee: mockUsers[4],
    ward_officer: mockUsers[2],
  },
  {
    id: "40",
    ticket_id: "FO-VNS-2024-010",
    title: "[FO] Street light repair at Sarnath Road",
    description:
      "Multiple LED street lights on Sarnath Road towards the Deer Park are not functioning, affecting tourist movement during evening hours.",
    category: "lighting",
    status: "pending",
    severity: "medium",
    priority_score: 24.6,
    upvotes: 15,
    photo_url:
      "https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800",
    latitude: 25.3789,
    longitude: 83.0276,
    address: "Sarnath Road, Varanasi, UP 221007",
    reported_by: "4",
    assignedTo: "5",
    ward_officer_id: "3",
    is_anonymous: false,
    createdAt: "2024-03-25T06:30:00Z",
    updated_at: "2024-03-25T06:30:00Z",
    reporter: mockUsers[3],
    assignee: mockUsers[4],
    ward_officer: mockUsers[2],
  },
];

export const mockIssueUpdates = {
  1: [
    {
      id: "u1",
      issue_id: "1",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "1",
      created_at: "2024-03-01T09:30:00Z",
      updater: mockUsers[0],
    },
    {
      id: "u1b",
      issue_id: "1",
      status: "pending",
      comment: "Issue verified by Ward Officer. Assessment in progress.",
      updated_by: "3",
      created_at: "2024-03-01T14:20:00Z",
      updater: mockUsers[2],
    },
    {
      id: "u2",
      issue_id: "1",
      status: "in_progress",
      comment: "Verified by Ward Officer and assigned to field officer",
      updated_by: "3",
      created_at: "2024-03-05T10:00:00Z",
      updater: mockUsers[2],
    },
    {
      id: "u2b",
      issue_id: "1",
      status: "in_progress",
      comment:
        "Road repair team dispatched to location. Work scheduled for tomorrow morning.",
      updated_by: "4",
      created_at: "2024-03-05T14:20:00Z",
      updater: mockUsers[3],
    },
  ],
  2: [
    {
      id: "u3",
      issue_id: "2",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "4",
      created_at: "2024-02-20T18:45:00Z",
      updater: mockUsers[3],
    },
    {
      id: "u3b",
      issue_id: "2",
      status: "pending",
      comment: "Issue reviewed and priority level assigned",
      updated_by: "2",
      created_at: "2024-02-21T09:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u4",
      issue_id: "2",
      status: "in_progress",
      comment: "Verified by Admin and assigned to electrical team",
      updated_by: "2",
      created_at: "2024-02-22T10:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u4b",
      issue_id: "2",
      status: "in_progress",
      comment:
        "Electrician team on-site. Replacing faulty bulb and checking electrical connections.",
      updated_by: "2",
      created_at: "2024-02-27T14:30:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u4c",
      issue_id: "2",
      status: "resolved",
      comment:
        "Streetlight repair completed and fully operational. Quality check passed.",
      updated_by: "2",
      created_at: "2024-02-28T10:15:00Z",
      updater: mockUsers[1],
    },
  ],
  3: [
    {
      id: "u8",
      issue_id: "3",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "1",
      created_at: "2024-03-10T08:15:00Z",
      updater: mockUsers[0],
    },
    {
      id: "u8b",
      issue_id: "3",
      status: "pending",
      comment:
        "High community support detected. Issue marked as high priority.",
      updated_by: "3",
      created_at: "2024-03-10T11:30:00Z",
      updater: mockUsers[2],
    },
    {
      id: "u8c",
      issue_id: "3",
      status: "in_progress",
      comment: "Verified by Ward Officer and assigned to waste management team",
      updated_by: "3",
      created_at: "2024-03-10T15:00:00Z",
      updater: mockUsers[2],
    },
  ],
  4: [
    {
      id: "u5",
      issue_id: "4",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "4",
      created_at: "2024-03-08T12:00:00Z",
      updater: mockUsers[3],
    },
    {
      id: "u5b",
      issue_id: "4",
      status: "in_progress",
      comment: "Assigned to field officer for investigation",
      updated_by: "2",
      created_at: "2024-03-08T16:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u5c",
      issue_id: "4",
      status: "in_progress",
      comment:
        "Water department team investigating leak source. Parts ordered for repair.",
      updated_by: "5",
      created_at: "2024-03-09T09:30:00Z",
      updater: mockUsers[4],
    },
  ],
  5: [
    {
      id: "u9",
      issue_id: "5",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "1",
      created_at: "2024-03-12T15:20:00Z",
      updater: mockUsers[0],
    },
  ],
  6: [
    {
      id: "u6",
      issue_id: "6",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      created_at: "2024-02-25T10:00:00Z",
    },
    {
      id: "u6b",
      issue_id: "6",
      status: "in_progress",
      comment: "Issue verified. Cleaning crew scheduled for tomorrow.",
      updated_by: "2",
      created_at: "2024-02-26T14:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u7",
      issue_id: "6",
      status: "resolved",
      comment: "Graffiti removed successfully. Area cleaned and inspected.",
      updated_by: "2",
      created_at: "2024-03-02T16:45:00Z",
      updater: mockUsers[1],
    },
  ],
  7: [
    {
      id: "u10",
      issue_id: "7",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "1",
      created_at: "2024-03-15T11:20:00Z",
      updater: mockUsers[0],
    },
    {
      id: "u10b",
      issue_id: "7",
      status: "pending",
      comment: "Safety hazard confirmed. Escalated to high priority.",
      updated_by: "3",
      created_at: "2024-03-15T14:00:00Z",
      updater: mockUsers[2],
    },
    {
      id: "u10c",
      issue_id: "7",
      status: "in_progress",
      comment:
        "Verified by Ward Officer and assigned to field team. New sign ordered.",
      updated_by: "3",
      created_at: "2024-03-15T16:30:00Z",
      updater: mockUsers[2],
    },
  ],
  12: [
    {
      id: "u11",
      issue_id: "12",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "1",
      created_at: "2024-03-14T10:20:00Z",
      updater: mockUsers[0],
    },
    {
      id: "u11b",
      issue_id: "12",
      status: "in_progress",
      comment:
        "Verified and assigned to cleanup team. Scheduled for next business day.",
      updated_by: "2",
      created_at: "2024-03-14T15:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u11c",
      issue_id: "12",
      status: "in_progress",
      comment: "Debris removal in progress. Heavy equipment on-site.",
      updated_by: "2",
      created_at: "2024-03-17T10:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u11d",
      issue_id: "12",
      status: "resolved",
      comment:
        "All illegal dumping cleared. Area sanitized and restored to normal condition.",
      updated_by: "2",
      created_at: "2024-03-17T16:30:00Z",
      updater: mockUsers[1],
    },
  ],
  19: [
    {
      id: "u12",
      issue_id: "19",
      status: "pending",
      comment: "Issue submitted and awaiting review",
      updated_by: "3",
      created_at: "2024-03-16T06:30:00Z",
      updater: mockUsers[2],
    },
    {
      id: "u12b",
      issue_id: "19",
      status: "pending",
      comment: "Emergency situation identified. Fast-tracking approval.",
      updated_by: "2",
      created_at: "2024-03-16T07:00:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u12c",
      issue_id: "19",
      status: "in_progress",
      comment: "Emergency crew dispatched immediately. ETA 15 minutes.",
      updated_by: "2",
      created_at: "2024-03-16T07:15:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u12d",
      issue_id: "19",
      status: "in_progress",
      comment: "Tree removal team on-site. Safety perimeter established.",
      updated_by: "2",
      created_at: "2024-03-16T08:30:00Z",
      updater: mockUsers[1],
    },
    {
      id: "u12e",
      issue_id: "19",
      status: "resolved",
      comment:
        "Fallen tree completely removed. Sidewalk cleared and safe for pedestrians.",
      updated_by: "2",
      created_at: "2024-03-16T15:45:00Z",
      updater: mockUsers[1],
    },
  ],
};

export const mockComments = {
  1: [
    {
      id: "c1",
      issue_id: "1",
      user_id: "4",
      comment:
        "I also noticed this pothole yesterday. It's really dangerous, especially at night!",
      sentiment_score: -0.3,
      isAnonymous: false,
      createdAt: "2024-03-02T10:15:00Z",
      commenter: mockUsers[3],
    },
    {
      id: "c2",
      issue_id: "1",
      user_id: null,
      comment: "My car tire was damaged because of this. Please fix it soon!",
      sentiment_score: -0.5,
      isAnonymous: true,
      createdAt: "2024-03-03T14:30:00Z",
    },
    {
      id: "c3",
      issue_id: "1",
      user_id: "1",
      comment:
        "Thanks for the quick response! Looking forward to seeing it fixed.",
      sentiment_score: 0.6,
      isAnonymous: false,
      createdAt: "2024-03-06T09:00:00Z",
      commenter: mockUsers[0],
    },
  ],
  2: [
    {
      id: "c4",
      issue_id: "2",
      user_id: "1",
      comment: "Great job fixing this! The area feels much safer now.",
      sentiment_score: 0.8,
      isAnonymous: false,
      createdAt: "2024-02-28T18:20:00Z",
      commenter: mockUsers[0],
    },
  ],
  3: [
    {
      id: "c5",
      issue_id: "3",
      user_id: "4",
      comment: "This is becoming a health hazard. We need immediate action!",
      sentiment_score: -0.6,
      isAnonymous: false,
      createdAt: "2024-03-11T09:30:00Z",
      commenter: mockUsers[3],
    },
    {
      id: "c6",
      issue_id: "3",
      user_id: "3",
      comment:
        "I have assigned a waste management team to address this issue. They will be on site within 24 hours.",
      sentiment_score: 0.4,
      isAnonymous: false,
      createdAt: "2024-03-11T14:00:00Z",
      commenter: mockUsers[2],
    },
  ],
  4: [
    {
      id: "c7",
      issue_id: "4",
      user_id: "5",
      comment:
        "I am investigating the water leak. Will provide an update on estimated repair time soon.",
      sentiment_score: 0.3,
      isAnonymous: false,
      createdAt: "2024-03-09T10:00:00Z",
      commenter: mockUsers[4],
    },
    {
      id: "c8",
      issue_id: "4",
      user_id: "4",
      comment:
        "Thank you for looking into this. How long do you estimate the repair will take?",
      sentiment_score: 0.2,
      isAnonymous: false,
      createdAt: "2024-03-09T15:30:00Z",
      commenter: mockUsers[3],
    },
  ],
  7: [
    {
      id: "c9",
      issue_id: "7",
      user_id: "1",
      comment:
        "This sign is barely visible from 10 meters away. Very dangerous intersection!",
      sentiment_score: -0.4,
      isAnonymous: false,
      createdAt: "2024-03-16T08:00:00Z",
      commenter: mockUsers[0],
    },
    {
      id: "c10",
      issue_id: "7",
      user_id: "4",
      comment:
        "Working on this now. New sign will be installed today. Should be complete by end of day.",
      sentiment_score: 0.5,
      isAnonymous: false,
      createdAt: "2024-03-16T11:00:00Z",
      commenter: mockUsers[3],
    },
  ],
  10: [
    {
      id: "c11",
      issue_id: "10",
      user_id: "3",
      comment:
        "This is an emergency situation. I have dispatched our urgent response team immediately. Area will be secured within the hour.",
      sentiment_score: 0.6,
      isAnonymous: false,
      createdAt: "2024-03-21T07:30:00Z",
      commenter: mockUsers[2],
    },
    {
      id: "c12",
      issue_id: "10",
      user_id: null,
      comment:
        "Thank you for the quick response! I saw the team arrive and put up warning signs.",
      sentiment_score: 0.8,
      isAnonymous: true,
      createdAt: "2024-03-21T08:45:00Z",
    },
  ],
  13: [
    {
      id: "c13",
      issue_id: "13",
      user_id: "1",
      comment:
        "This affects wheelchair users and people with strollers. Really needs attention!",
      sentiment_score: -0.3,
      isAnonymous: false,
      createdAt: "2024-03-23T10:00:00Z",
      commenter: mockUsers[0],
    },
  ],
  15: [
    {
      id: "c14",
      issue_id: "15",
      user_id: "5",
      comment:
        "Electrical team is on the way. Estimated repair time is 2-3 hours.",
      sentiment_score: 0.4,
      isAnonymous: false,
      createdAt: "2024-03-19T22:00:00Z",
      commenter: mockUsers[4],
    },
  ],
};

export const mockReactions = {
  1: [
    {
      id: "r1",
      issue_id: "1",
      user_id: "1",
      reaction_type: "thumbsup",
      createdAt: "2024-03-01T10:00:00Z",
    },
    {
      id: "r2",
      issue_id: "1",
      user_id: "4",
      reaction_type: "thumbsup",
      createdAt: "2024-03-02T11:00:00Z",
    },
    {
      id: "r3",
      issue_id: "1",
      user_id: "3",
      reaction_type: "heart",
      createdAt: "2024-03-03T14:00:00Z",
    },
  ],
  2: [
    {
      id: "r4",
      issue_id: "2",
      user_id: "1",
      reaction_type: "celebrate",
      createdAt: "2024-02-28T19:00:00Z",
    },
    {
      id: "r5",
      issue_id: "2",
      user_id: "4",
      reaction_type: "celebrate",
      createdAt: "2024-02-28T20:00:00Z",
    },
  ],
  3: [
    {
      id: "r6",
      issue_id: "3",
      user_id: "4",
      reaction_type: "thumbsup",
      createdAt: "2024-03-11T10:00:00Z",
    },
  ],
};

export const mockNotifications = [
  {
    id: "n1",
    user_id: "1",
    issue_id: "1",
    message:
      'Your issue "Large pothole on Main Street" status changed to: in_progress',
    read: false,
    createdAt: "2024-03-05T14:20:00Z",
  },
  {
    id: "n2",
    user_id: "4",
    issue_id: "2",
    message: 'Your issue "Streetlight not working" status changed to: resolved',
    read: true,
    createdAt: "2024-02-28T10:15:00Z",
  },
  {
    id: "n3",
    user_id: "1",
    issue_id: "3",
    message:
      'Your issue "Overflowing garbage bins" has received 10 new upvotes',
    read: false,
    createdAt: "2024-03-11T15:30:00Z",
  },
  {
    id: "n4",
    user_id: "1",
    issue_id: "7",
    message:
      'Your issue "Damaged traffic sign on Broadway" has been assigned to Ward Officer Mike Johnson',
    read: false,
    createdAt: "2024-03-25T10:15:00Z",
  },
  {
    id: "n5",
    user_id: "1",
    issue_id: "8",
    message:
      'Your issue "Broken public bench in Riverside Park" status changed to: in_progress',
    read: false,
    createdAt: "2024-03-19T09:10:00Z",
  },
  {
    id: "n6",
    user_id: "1",
    issue_id: "12",
    message:
      'Your issue "Illegal dumping near residential area" status changed to: resolved',
    read: true,
    createdAt: "2024-03-17T16:30:00Z",
  },
  {
    id: "n7",
    user_id: "1",
    issue_id: "5",
    message: 'An admin commented on your issue "Broken sidewalk"',
    read: true,
    createdAt: "2024-03-13T11:00:00Z",
  },
  {
    id: "n8",
    user_id: "1",
    issue_id: "1",
    message:
      'Your issue "Large pothole on Main Street" has received 5 new upvotes',
    read: false,
    createdAt: "2024-03-24T14:30:00Z",
  },
  {
    id: "n9",
    user_id: "1",
    issue_id: "11",
    message:
      'Your issue "Flickering streetlights on 3rd Avenue" has been acknowledged by the city',
    read: false,
    createdAt: "2024-03-23T08:00:00Z",
  },
  {
    id: "n10",
    user_id: "1",
    message:
      'Congratulations! You earned the "City Guardian" badge for reporting 20 verified issues',
    read: true,
    createdAt: "2024-03-10T10:00:00Z",
  },
];

export const mockBadges = [
  {
    id: "b1",
    name: "First Reporter",
    description: "Report your first issue",
    icon: "🌟",
    points_required: 10,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "b2",
    name: "Community Helper",
    description: "Report 5 verified issues",
    icon: "🤝",
    points_required: 50,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "b3",
    name: "City Guardian",
    description: "Report 20 verified issues",
    icon: "🛡️",
    points_required: 200,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "b4",
    name: "Engagement Champion",
    description: "Comment on 10 different issues",
    icon: "💬",
    points_required: 100,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "b5",
    name: "Top Contributor",
    description: "Reach 500 points",
    icon: "🏆",
    points_required: 500,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const mockUserBadges = {
  1: [
    {
      id: "ub1",
      user_id: "1",
      badge_id: "b1",
      earned_at: "2024-03-01T09:30:00Z",
      badge: mockBadges[0],
    },
    {
      id: "ub2",
      user_id: "1",
      badge_id: "b2",
      earned_at: "2024-03-05T14:00:00Z",
      badge: mockBadges[1],
    },
    {
      id: "ub3",
      user_id: "1",
      badge_id: "b3",
      earned_at: "2024-03-10T10:00:00Z",
      badge: mockBadges[2],
    },
  ],
  2: [
    {
      id: "ub4",
      user_id: "2",
      badge_id: "b1",
      earned_at: "2024-01-15T08:00:00Z",
      badge: mockBadges[0],
    },
    {
      id: "ub5",
      user_id: "2",
      badge_id: "b2",
      earned_at: "2024-01-20T10:00:00Z",
      badge: mockBadges[1],
    },
    {
      id: "ub6",
      user_id: "2",
      badge_id: "b3",
      earned_at: "2024-02-01T12:00:00Z",
      badge: mockBadges[2],
    },
    {
      id: "ub7",
      user_id: "2",
      badge_id: "b4",
      earned_at: "2024-02-10T14:00:00Z",
      badge: mockBadges[3],
    },
    {
      id: "ub8",
      user_id: "2",
      badge_id: "b5",
      earned_at: "2024-02-25T16:00:00Z",
      badge: mockBadges[4],
    },
  ],
  4: [
    {
      id: "ub9",
      user_id: "4",
      badge_id: "b1",
      earned_at: "2024-02-20T18:45:00Z",
      badge: mockBadges[0],
    },
    {
      id: "ub10",
      user_id: "4",
      badge_id: "b2",
      earned_at: "2024-02-28T10:00:00Z",
      badge: mockBadges[1],
    },
    {
      id: "ub11",
      user_id: "4",
      badge_id: "b3",
      earned_at: "2024-03-08T12:00:00Z",
      badge: mockBadges[2],
    },
    {
      id: "ub12",
      user_id: "4",
      badge_id: "b5",
      earned_at: "2024-03-12T15:00:00Z",
      badge: mockBadges[4],
    },
  ],
};

// Current logged in user (for demo purposes)
export let currentMockUser = null;

export function setCurrentMockUser(user) {
  currentMockUser = user;
}

export function getMockUser() {
  return [...mockUsers];
}

export function createMockUser(email, fullName) {
  const newUser = {
    id: `user-${Date.now()}`,
    full_name: fullName,
    role: "citizen",
    email: email,
    notification_enabled: true,
    points: 0,
    language_preference: "en",
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
}

export function getIssues() {
  return [...mockIssues];
}

export function getIssueById(id) {
  return mockIssues.find((issue) => issue.id === id);
}

export function getCommentsByIssueId(issueId) {
  return mockComments.filter((comment) => comment.issue_id === issueId);
}

export function getReactionsByIssueId(issueId) {
  return mockReactions.filter((reaction) => reaction.issue_id === issueId);
}

export function getUpdatesByIssueId(issueId) {
  // Todo fix:  Issue ID Type mismatch error resolve
  return mockIssueUpdates[issueId] || [];
}

export function getNotificationsByUserId(userId) {
  return mockNotifications.filter((notif) => notif.user_id === userId);
}

export function getUnreadCount(userId) {
  return mockNotifications.filter(
    (notif) => notif.user_id === userId && !notif.read,
  ).length;
}

let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

export function getCurrentUser() {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem("currentUser");
  if (stored) {
    currentUser = JSON.parse(stored);
  }
  return currentUser;
}

export function getMockUsers() {
  return [...mockUsers];
}

// ===============================
// Issue Messaging – Mock Data
// ===============================

export const mockIssueMessages = [
  // -------- ISSUE 1 (Pothole) --------
  {
    id: "im-001",
    issue_id: 1,
    sender_id: 1, // John Doe (Citizen)
    recipient_id: 4, // Sarah (Field Officer)
    message: "Hi Sarah, any update on when the pothole repair will start?",
    is_read: true,
    created_at: "2024-03-06T10:00:00Z",
  },
  {
    id: "im-002",
    issue_id: 1,
    sender_id: 4,
    recipient_id: 1,
    message:
      "Hello! The repair team will be on site tomorrow at 8 AM. Work should take around 4–6 hours.",
    is_read: true,
    created_at: "2024-03-06T11:30:00Z",
  },
  {
    id: "im-003",
    issue_id: 1,
    sender_id: 1,
    recipient_id: 4,
    message: "Thanks! Will there be any traffic disruption?",
    is_read: true,
    created_at: "2024-03-06T12:00:00Z",
  },
  {
    id: "im-004",
    issue_id: 1,
    sender_id: 4,
    recipient_id: 1,
    message:
      "One lane will be closed temporarily with cones and signage. Expect minor delays.",
    is_read: true,
    created_at: "2024-03-06T14:15:00Z",
  },

  // -------- ISSUE 1 → Ward Officer --------
  {
    id: "im-005",
    issue_id: 1,
    sender_id: 1,
    recipient_id: 3, // Mike (Ward Officer)
    message:
      "Hi Mike, just checking if everything is on track from the ward side.",
    is_read: true,
    created_at: "2024-03-07T09:00:00Z",
  },
  {
    id: "im-006",
    issue_id: 1,
    sender_id: 3,
    recipient_id: 1,
    message:
      "Yes, everything is progressing well. The field team is fully aligned.",
    is_read: true,
    created_at: "2024-03-07T09:45:00Z",
  },

  // -------- ISSUE 3 (Garbage) --------
  {
    id: "im-007",
    issue_id: 3,
    sender_id: 1,
    recipient_id: 5, // David (Field Officer)
    message: "Hi David, the garbage bins are overflowing badly. Any update?",
    is_read: true,
    created_at: "2024-03-11T10:00:00Z",
  },
  {
    id: "im-008",
    issue_id: 3,
    sender_id: 5,
    recipient_id: 1,
    message: "Cleanup team will arrive within 2 hours. Area will be sanitized.",
    is_read: true,
    created_at: "2024-03-11T10:30:00Z",
  },
  {
    id: "im-009",
    issue_id: 3,
    sender_id: 1,
    recipient_id: 5,
    message: "Will pickup frequency be increased permanently?",
    is_read: true,
    created_at: "2024-03-11T11:00:00Z",
  },
  {
    id: "im-010",
    issue_id: 3,
    sender_id: 5,
    recipient_id: 1,
    message: "Yes, pickups will increase from twice to three times a week.",
    is_read: true,
    created_at: "2024-03-11T11:45:00Z",
  },

  // -------- ISSUE 3 → Ward Officer --------
  {
    id: "im-011",
    issue_id: 3,
    sender_id: 1,
    recipient_id: 3,
    message:
      "Hi Mike, can you confirm the increased pickup schedule is approved?",
    is_read: true,
    created_at: "2024-03-12T08:00:00Z",
  },
  {
    id: "im-012",
    issue_id: 3,
    sender_id: 3,
    recipient_id: 1,
    message:
      "Confirmed. The revised schedule is officially approved. Thanks for flagging this!",
    is_read: true,
    created_at: "2024-03-12T09:00:00Z",
  },

  // -------- ISSUE 7 (Traffic Sign) --------
  {
    id: "im-013",
    issue_id: 7,
    sender_id: 1,
    recipient_id: 4,
    message: "The damaged stop sign is dangerous. When will it be replaced?",
    is_read: true,
    created_at: "2024-03-16T09:00:00Z",
  },
  {
    id: "im-014",
    issue_id: 7,
    sender_id: 4,
    recipient_id: 1,
    message:
      "New sign arrives tomorrow. Installation will be done immediately.",
    is_read: true,
    created_at: "2024-03-16T10:30:00Z",
  },
  {
    id: "im-015",
    issue_id: 7,
    sender_id: 1,
    recipient_id: 4,
    message: "Please notify me once it’s installed.",
    is_read: false,
    created_at: "2024-03-16T11:00:00Z",
  },
  {
    id: "im-016",
    issue_id: 7,
    sender_id: 1,
    recipient_id: 3,
    message: "Hi Mike, just looping you in — sign replacement is scheduled.",
    is_read: true,
    created_at: "2024-03-16T12:00:00Z",
  },
  {
    id: "im-017",
    issue_id: 7,
    sender_id: 3,
    recipient_id: 1,
    message:
      "Thanks. I’ll inspect the installation personally after completion.",
    is_read: false,
    created_at: "2024-03-16T13:00:00Z",
  },
];

export function getIssueMessages(issueId) {
  // fix === instead of == (TODO)
  return mockIssueMessages.filter((msg) => msg.issue_id == issueId);
}

const mockMessages = [
  {
    id: "msg-001",
    from_user_id: "2",
    to_user_id: "3",
    message:
      "Hi Mike, please prioritize the missing manhole cover on Main Street. This is a serious safety hazard and needs immediate attention.",
    created_at: "2024-03-25T09:15:00Z",
    read: true,
    issue_ids: ["10"],
  },
  {
    id: "msg-002",
    from_user_id: "3",
    to_user_id: "2",
    message:
      "Understood! I have dispatched a team to secure the area immediately. We will have temporary barriers in place within the hour and permanent fix by end of day.",
    created_at: "2024-03-25T09:30:00Z",
    read: true,
  },
  {
    id: "msg-003",
    from_user_id: "2",
    to_user_id: "3",
    message:
      "Perfect. Keep me updated on the progress. Also, make sure to document everything with photos.",
    created_at: "2024-03-25T10:00:00Z",
    read: true,
  },
  {
    id: "msg-004",
    from_user_id: "3",
    to_user_id: "2",
    message:
      "Area secured with barriers and warning signs. Replacement manhole cover has arrived. Installation in progress. Photos uploaded to the issue tracker.",
    created_at: "2024-03-25T11:45:00Z",
    read: true,
  },
  {
    id: "msg-005",
    from_user_id: "3",
    to_user_id: "2",
    message:
      "Update: Manhole cover successfully installed and tested. Area is safe. Marking issue as resolved.",
    created_at: "2024-03-25T14:30:00Z",
    read: false,
  },
  {
    id: "msg-006",
    from_user_id: "2",
    to_user_id: "4",
    message:
      "Sarah, great work on resolving the street lighting issues in the downtown area. The residents have been very appreciative. Can you provide a summary report?",
    created_at: "2024-03-24T16:20:00Z",
    read: true,
  },
  {
    id: "msg-007",
    from_user_id: "4",
    to_user_id: "2",
    message:
      "Thank you! I have completed 8 streetlight repairs this week. Will send detailed report by EOD with before/after photos and maintenance notes.",
    created_at: "2024-03-24T16:45:00Z",
    read: true,
  },
  {
    id: "msg-008",
    from_user_id: "4",
    to_user_id: "2",
    message:
      "Report submitted. All lighting fixtures have been upgraded to LED as well, which should reduce energy costs by approximately 40%.",
    created_at: "2024-03-24T18:30:00Z",
    read: false,
  },
  {
    id: "msg-009",
    from_user_id: "2",
    to_user_id: "5",
    message:
      "David, I need your assistance with the water leak on Spring Street. This has been escalated as high priority. Can you take a look today?",
    created_at: "2024-03-26T08:00:00Z",
    read: true,
    issue_ids: ["7"],
  },
  {
    id: "msg-010",
    from_user_id: "5",
    to_user_id: "2",
    message:
      "On it! Heading to Spring Street now. Will assess the situation and report back within the hour.",
    created_at: "2024-03-26T08:15:00Z",
    read: true,
  },
  {
    id: "msg-011",
    from_user_id: "5",
    to_user_id: "2",
    message:
      "Assessed the leak - it is a main pipe issue, not just a surface leak. We will need to excavate and replace a 20-foot section of pipe. Requesting approval for emergency repair.",
    created_at: "2024-03-26T09:10:00Z",
    read: true,
  },
  {
    id: "msg-012",
    from_user_id: "2",
    to_user_id: "5",
    message:
      "Emergency repair approved. Do you need additional equipment or personnel? I can send a support team if needed.",
    created_at: "2024-03-26T09:25:00Z",
    read: true,
  },
  {
    id: "msg-013",
    from_user_id: "5",
    to_user_id: "2",
    message:
      "Yes, please send a support team with a hydraulic excavator. Also, we will need to shut off water to 3 blocks during repair (approximately 4-6 hours). Should I notify residents?",
    created_at: "2024-03-26T09:40:00Z",
    read: false,
  },
  {
    id: "msg-014",
    from_user_id: "2",
    to_user_id: "3",
    message:
      "Mike, I am reassigning the broken bench in Central Park to Sarah. You already have 8 active issues and this will help balance the workload. Thank you for your hard work!",
    created_at: "2024-03-27T10:30:00Z",
    read: false,
    issue_ids: ["15"],
  },
  {
    id: "msg-015",
    from_user_id: "2",
    to_user_id: "4",
    message:
      "Sarah, I have assigned you the broken bench repair in Central Park (TKT-015). It is a low-priority issue but should be completed this week if possible.",
    created_at: "2024-03-27T10:35:00Z",
    read: false,
    issue_ids: ["15"],
  },
  {
    id: "msg-016",
    from_user_id: "3",
    to_user_id: "2",
    message:
      "Quick question about the traffic light issue on 5th Avenue - should we coordinate with the traffic department or handle it directly?",
    created_at: "2024-03-26T14:20:00Z",
    read: true,
    issue_ids: ["3"],
  },
  {
    id: "msg-017",
    from_user_id: "2",
    to_user_id: "3",
    message:
      "Please coordinate with the traffic department. They need to approve any work on traffic signals. I will send you the contact person.",
    created_at: "2024-03-26T14:35:00Z",
    read: true,
  },
  {
    id: "msg-018",
    from_user_id: "4",
    to_user_id: "2",
    message:
      "I noticed we are running low on LED bulb inventory for streetlights. Should I submit a purchase request?",
    created_at: "2024-03-27T11:00:00Z",
    read: false,
  },
  {
    id: "msg-019",
    from_user_id: "5",
    to_user_id: "2",
    message:
      "Storm drain on Park Avenue is now cleared. Heavy rainfall last night caused significant debris buildup but flow is restored to normal.",
    created_at: "2024-03-27T07:45:00Z",
    read: false,
    issue_ids: ["8"],
  },
  {
    id: "msg-020",
    from_user_id: "3",
    to_user_id: "2",
    message:
      "All high-priority issues in Ward 5 have been addressed. Currently working through medium-priority items. ETA for completion: 3 days.",
    created_at: "2024-03-27T15:30:00Z",
    read: false,
  },
];

export function initializeMessagesIfNeeded() {
  const existing = localStorage.getItem("messages");
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem("messages", JSON.stringify(mockMessages));
  }
}
