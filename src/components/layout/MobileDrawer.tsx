import { Drawer } from "@/components/ui/drawer";
import { Sidebar } from "./Sidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      size="sm"
      hideCloseButton={true}
      className="p-0 border-r border-hairline w-[290px] max-w-[85vw] md:hidden"
    >
      <Sidebar onItemClick={onClose} onClose={onClose} className="border-r-0 h-full" />
    </Drawer>
  );
}
