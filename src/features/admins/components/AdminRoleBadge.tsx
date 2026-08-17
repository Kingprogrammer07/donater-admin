import { Badge } from "@/components/ui/badge";

export interface AdminRoleBadgeProps {
  role: string;
}

export function AdminRoleBadge({ role }: AdminRoleBadgeProps) {
  switch (role) {
    case "owner":
      return (
        <Badge variant="brand" styleType="subtle" className="text-[12px] font-bold">
          Owner (Ega)
        </Badge>
      );
    case "admin":
      return (
        <Badge variant="brand" styleType="subtle" className="text-[12px] font-semibold">
          Admin
        </Badge>
      );
    case "support":
      return (
        <Badge variant="ok" styleType="subtle" className="text-[12px] font-medium">
          Support
        </Badge>
      );
    case "viewer":
    default:
      return (
        <Badge variant="neutral" styleType="subtle" className="text-[12px] font-medium">
          Viewer (Kuzatuvchi)
        </Badge>
      );
  }
}
