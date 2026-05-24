import {
  Tag,
  Users,
  Settings,
  LayoutGrid,
  LucideIcon,
  LayoutTemplate,
  CarFront,
  Car,
  CirclePlus
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/overview",
          label: "Overview",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Cars",
          icon: CarFront,
          submenus: [
            {
              href: "/cars",
              label: "All Cars"
            },
            {
              href: "/cars/add",
              label: "Add New Car"
            },
          ]
        },
        {
          href: "/templates",
          label: "Templates",
          icon: LayoutTemplate
        },
        {
          href: "/tags",
          label: "Tags",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings
        }
      ]
    }
  ];
}
