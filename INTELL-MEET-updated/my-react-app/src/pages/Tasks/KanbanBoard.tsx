import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

const initialTasks = [
  { id: '1', title: 'Schedule meeting with stakeholders', status: 'To Do', priority: 'High', date: '2026-04-05' },
  { id: '2', title: 'Complete transcription processing', status: 'In Progress', priority: 'Urgent', date: '2026-04-02' },
  { id: '3', title: 'Update team access roles', status: 'Done', priority: 'Low', date: '2026-03-29' },
];

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  date: string;
}

function SortableTask({ task }: { task: TaskData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
        className="group relative bg-[#050B14] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all cursor-grab active:cursor-grabbing mb-4"
    >
        <div className="flex items-start justify-between mb-4">
            <h4 className="font-bold text-white leading-snug max-w-[80%]">{task.title}</h4>
        </div>
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${task.priority === 'Urgent' ? 'bg-red-500/20 text-red-500' : task.priority === 'High' ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {task.priority}
                </span>
            </div>
        </div>
    </div>
  );
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="flex h-full flex-col">
        <header className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-white mb-2">Workspace Tasks</h2>
                <p className="text-white/40">Manage action items extracted from recent meetings.</p>
            </div>
            <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all">
                <Plus size={20} />
                <span>New Task</span>
            </button>
        </header>

        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
                {['To Do', 'In Progress', 'In Review', 'Done'].map(column => (
                    <div key={column} className="flex flex-col h-full group/column">
                        <div className="flex items-center justify-between mb-6 px-2">
                           <div className="flex items-center space-x-3">
                                <span className={`w-2 h-2 rounded-full ${column === 'To Do' ? 'bg-white/40' : column === 'In Progress' ? 'bg-cyan-400' : column === 'In Review' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                <h3 className="font-black text-white/60 tracking-wider text-sm uppercase">{column}</h3>
                                <span className="bg-white/5 text-white/40 text-[10px] px-2 py-0.5 rounded-full font-black">
                                    {tasks.filter(t => t.status === column).length}
                                </span>
                           </div>
                           <Plus size={18} className="text-white/20 group-hover/column:text-white transition-colors cursor-pointer" />
                        </div>
                        
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-4 min-h-[400px]">
                            <SortableContext 
                                items={tasks.filter(t => t.status === column).map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tasks.filter(t => t.status === column).map((task) => (
                                    <SortableTask key={task.id} task={task} />
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                ))}
            </div>
        </DndContext>
    </div>
  );
}
