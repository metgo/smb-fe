import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";

interface DraggableWidgetProps {
  id: string;
  index: number;
  children: React.ReactNode;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  isEditMode: boolean;
}

interface DragItem {
  id: string;
  index: number;
}

export default function DraggableWidget({
  id,
  index,
  children,
  onMove,
  isEditMode,
}: DraggableWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "WIDGET",
    item: { id, index },
    canDrag: isEditMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem>({
    accept: "WIDGET",
    hover: (item) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // ✅ Combine refs using a callback ref
  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(drop(node));
  };

  if (!isEditMode) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={dragDropRef}
      className={`relative group transition-all duration-200
        ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Drag Handle */}
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2
                   px-4 py-2 bg-teal-500 hover:bg-teal-600
                   text-white rounded-full cursor-grab
                   active:cursor-grabbing z-20 shadow-lg
                   flex items-center gap-2"
      >
        <GripVertical className="w-4 h-4" />
        <span className="text-xs font-medium">Drag to reorder</span>
      </div>

      {/* Widget Content */}
      <div
        className="ring-2 ring-teal-500 ring-offset-4
                      dark:ring-offset-gray-950
                      ring-offset-gray-50 rounded-lg"
      >
        {children}
      </div>
    </div>
  );
}
