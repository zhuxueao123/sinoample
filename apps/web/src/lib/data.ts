import {
  Building2,
  GraduationCap,
  HeartPulse,
  Hotel,
  Plane,
  Store,
  Wrench
} from "lucide-react";

export const productCategories = [
  {
    name: "Snack & Drink Vending Machines",
    slug: "snack-drink-vending-machines",
    description:
      "Flexible machines for beverages, snacks, and mixed daily convenience items.",
    tags: ["Cooling", "Cashless", "High Capacity"]
  },
  {
    name: "Coffee Vending Machines",
    slug: "coffee-vending-machines",
    description:
      "Automated hot beverage units for workplaces, hospitality, and public venues.",
    tags: ["Hot Drinks", "Compact", "Office Ready"]
  },
  {
    name: "Fresh Food Vending Machines",
    slug: "fresh-food-vending-machines",
    description:
      "Temperature-controlled machines for meals, salads, sandwiches, and chilled goods.",
    tags: ["Fresh Food", "Temperature Control", "Smart Lock"]
  },
  {
    name: "Combo Vending Machines",
    slug: "combo-vending-machines",
    description:
      "One-machine setups for operators who need drinks, snacks, and flexible SKUs.",
    tags: ["Multi SKU", "Operator Friendly", "Modular"]
  },
  {
    name: "Smart Vending Machines",
    slug: "smart-vending-machines",
    description:
      "Connected machines with telemetry, cashless payments, and remote management.",
    tags: ["IoT", "Remote Management", "Telemetry"]
  },
  {
    name: "Customized Vending Machines",
    slug: "customized-vending-machines",
    description:
      "OEM and ODM vending solutions for branded deployments and special categories.",
    tags: ["OEM", "ODM", "Branding"]
  }
];

export const featuredProducts = [
  {
    name: "SA-COMBO 42 Smart Combo Vendor",
    slug: "sa-combo-42-smart-combo-vendor",
    categorySlug: "combo-vending-machines",
    category: "Combo Vending Machines",
    description:
      "A flexible refrigerated machine for snacks, drinks, and high-turnover daily items.",
    features: ["42 selections", "Cashless payment ready", "Remote stock monitoring"],
    specs: [
      ["Capacity", "Up to 420 items"],
      ["Payment", "Card, QR, NFC, optional cash"],
      ["Network", "4G / Wi-Fi / Ethernet"]
    ]
  },
  {
    name: "SA-COFFEE 18 Office Coffee Vendor",
    slug: "sa-coffee-18-office-coffee-vendor",
    categorySlug: "coffee-vending-machines",
    category: "Coffee Vending Machines",
    description:
      "A compact hot beverage machine designed for offices, hotels, and managed facilities.",
    features: ["Bean-to-cup options", "Touch display", "Easy daily service"],
    specs: [
      ["Drink Types", "Coffee, milk drinks, hot water"],
      ["Interface", "Touchscreen"],
      ["Use Case", "Office, hotel, campus"]
    ]
  },
  {
    name: "SA-FRESH 36 Chilled Food Vendor",
    slug: "sa-fresh-36-chilled-food-vendor",
    categorySlug: "fresh-food-vending-machines",
    category: "Fresh Food Vending Machines",
    description:
      "A chilled vending system for meals, fresh food packs, and convenience retail.",
    features: ["Chilled cabinet", "Smart pickup", "Meal-ready layout"],
    specs: [
      ["Temperature", "2-8°C configurable"],
      ["Capacity", "Up to 360 items"],
      ["Best For", "Hospitals, campuses, transit"]
    ]
  }
];

export const solutions = [
  {
    title: "Office Vending Solutions",
    slug: "office-vending-solutions",
    icon: Building2,
    description:
      "Keep employees supplied with drinks, snacks, coffee, and light meals without adding facility workload."
  },
  {
    title: "School & Campus Vending",
    slug: "school-campus-vending",
    icon: GraduationCap,
    description:
      "Durable machines and managed product layouts for student areas, libraries, and campus housing."
  },
  {
    title: "Hospital & Healthcare Vending",
    slug: "hospital-healthcare-vending",
    icon: HeartPulse,
    description:
      "Reliable 24/7 access to food and essentials for staff, visitors, and patients."
  },
  {
    title: "Hotel & Apartment Vending",
    slug: "hotel-apartment-vending",
    icon: Hotel,
    description:
      "Compact unattended retail for lobbies, corridors, gyms, and residential communities."
  },
  {
    title: "Airport & Transportation Vending",
    slug: "airport-transportation-vending",
    icon: Plane,
    description:
      "High-traffic vending systems with cashless payment support and fast restocking workflows."
  },
  {
    title: "Retail & Franchise Vending",
    slug: "retail-franchise-vending",
    icon: Store,
    description:
      "Scalable machines for operators building route networks, branded retail corners, or franchise programs."
  },
  {
    title: "OEM / ODM Solutions",
    slug: "oem-odm-solutions",
    icon: Wrench,
    description:
      "Custom machine configuration, cabinet branding, payment integration, and product category adaptation."
  }
];

export const blogPosts = [
  {
    title: "How to Choose a Vending Machine for Your Business",
    slug: "how-to-choose-a-vending-machine-for-your-business",
    excerpt:
      "A practical buying guide for operators comparing product category, location, payment, and service needs.",
    category: "Buying Guide"
  },
  {
    title: "Smart Vending Machine Trends for Global Operators",
    slug: "smart-vending-machine-trends-for-global-operators",
    excerpt:
      "Remote management, cashless payments, telemetry, and flexible category formats are changing vending operations.",
    category: "Industry Insights"
  },
  {
    title: "Payment Systems for International Vending Projects",
    slug: "payment-systems-for-international-vending-projects",
    excerpt:
      "What B2B buyers should prepare before selecting card readers, QR payments, NFC, and local payment options.",
    category: "Operations"
  }
];

export const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "United Arab Emirates",
  "Saudi Arabia",
  "Australia",
  "Singapore",
  "Other"
];
