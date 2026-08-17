import { Icons } from "@/components/icons";

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: keyof typeof Icons;
  permission?: string;
  step: number;
  description: string;
}

export interface NavSectionConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

export const NAV_SECTIONS: NavSectionConfig[] = [
  {
    id: "main",
    title: "Asosiy",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/",
        icon: "LayoutDashboard",
        step: 7,
        description: "Asosiy KPI ko'rsatkichlar, grafiklar va tezkor holat xulosasi",
      },
    ],
  },
  {
    id: "operations",
    title: "Operatsiyalar",
    items: [
      {
        id: "payments",
        label: "To'lovlar",
        path: "/payments",
        icon: "CreditCard",
        step: 4,
        description: "Tasdiq kutayotgan cheklar navbati va barcha to'lovlar tarixi",
      },
      {
        id: "orders",
        label: "Buyurtmalar",
        path: "/orders",
        icon: "ShoppingCart",
        step: 5,
        description: "Barcha buyurtmalar, holatlar, yetkazishlar va qaytarishlar",
      },
      {
        id: "users",
        label: "Foydalanuvchilar",
        path: "/users",
        icon: "Users",
        step: 6,
        description: "Foydalanuvchilar bazasi, balanslar, bloklash va ledger tarixi",
      },
    ],
  },
  {
    id: "catalog",
    title: "Katalog & Narx",
    items: [
      {
        id: "catalog",
        label: "Katalog",
        path: "/catalog",
        icon: "FolderTree",
        step: 8,
        description: "Mahsulotlar, kategoriyalar, paketlar va sinxronizatsiya",
      },
      {
        id: "pricing",
        label: "Marja va Kurs",
        path: "/pricing",
        icon: "TrendingUp",
        permission: "manage_pricing",
        step: 8,
        description: "Valyuta kursi, dinamik marja qoidalari va narx kaskadi",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      {
        id: "broadcasts",
        label: "Broadcast",
        path: "/broadcasts",
        icon: "Send",
        permission: "broadcast",
        step: 9,
        description: "Auditoriya segmentatsiyasi va ommaviy xabarnomalar",
      },
    ],
  },
  {
    id: "system",
    title: "Tizim & Boshqaruv",
    items: [
      {
        id: "system",
        label: "Tizim Holati",
        path: "/system",
        icon: "Activity",
        step: 10,
        description: "Serverlar, ma'lumotlar bazasi, Redis, navbatlar va webhooklar",
      },
      {
        id: "settings",
        label: "Sozlamalar",
        path: "/settings",
        icon: "Settings",
        permission: "manage_settings",
        step: 10,
        description: "Do'kon parametrlari, to'lov tizimlari va matnlar sozlamalari",
      },
      {
        id: "admins",
        label: "Adminlar & Audit",
        path: "/admins",
        icon: "ShieldCheck",
        permission: "manage_admins",
        step: 10,
        description: "Admin foydalanuvchilar, rollar va xavfsizlik audit jurnali",
      },
      ...(import.meta.env.DEV
        ? [
            {
              id: "styleguide",
              label: "Styleguide",
              path: "/styleguide",
              icon: "Palette" as const,
              step: 0,
              description: "Poydevor dizayn tizimi komponentlari va tokenlar ko'rgazmasi",
            },
          ]
        : []),
    ],
  },
];

export function findNavItemByPath(pathname: string): NavItemConfig | undefined {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.path === "/" && pathname === "/") return item;
      if (item.path !== "/" && (pathname === item.path || pathname.startsWith(item.path + "/"))) {
        return item;
      }
    }
  }
  return undefined;
}
