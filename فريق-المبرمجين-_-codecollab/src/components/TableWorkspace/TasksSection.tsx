import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TaskItem, TaskPriority, TaskStatus, TableItem, TableMember } from '../../types';
import { playSuccessSound } from '../../utils/sound';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  Flame,
  Check
} from 'lucide-react';

interface TasksSectionProps {
  table: TableItem;
  members: TableMember[];
}

export const TasksSection: React.FC<TasksSectionProps> = ({ table, members }) => {
  const { currentUser, userProfile } = useAuth();
  const { t, isRtl } = useLanguage();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add Task Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Listen to tasks in real-time
  useEffect(() => {
    const tasksRef = collection(db, 'tables', table.id, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TaskItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            assignedTo: data.assignedTo || '',
            assignedToName: data.assignedToName || '',
            dueDate: data.dueDate || '',
            creatorId: data.creatorId || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        setTasks(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/tasks`);
      }
    );

    return () => unsubscribe();
  }, [table.id]);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim()) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const assignedMember = members.find((m) => m.userId === assignedTo);

      await addDoc(collection(db, 'tables', table.id, 'tasks'), {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo || '',
        assignedToName: assignedMember ? assignedMember.displayName : '',
        dueDate: dueDate || '',
        creatorId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });

      playSuccessSound();
      setIsAddOpen(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setAssignedTo('');
      setDueDate('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tables/${table.id}/tasks`);
    } finally {
      setSaving(false);
    }
  };

  // Change Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateDoc(doc(db, 'tables', table.id, 'tasks', taskId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tables/${table.id}/tasks/${taskId}`);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      await deleteDoc(doc(db, 'tables', table.id, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tables/${table.id}/tasks/${taskId}`);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const columns: { status: TaskStatus; label: string; bg: string; dot: string }[] = [
    { status: 'todo', label: t('statusTodo'), bg: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-400' },
    { status: 'in_progress', label: t('statusInProgress'), bg: 'border-indigo-400 dark:border-indigo-600', dot: 'bg-indigo-500' },
    { status: 'review', label: t('statusReview'), bg: 'border-amber-400 dark:border-amber-600', dot: 'bg-amber-500' },
    { status: 'done', label: t('statusDone'), bg: 'border-emerald-400 dark:border-emerald-600', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('tasksBoardTitle')}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                {doneTasks} / {totalTasks} منجز
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-28 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addTask')}</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 bg-slate-100/60 dark:bg-slate-950/40">
        {loading ? (
          <div className="flex justify-center py-20 text-slate-400 text-xs">
            جاري تحميل مهام المشروع...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-w-[700px]">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.status);

              return (
                <div
                  key={col.status}
                  className="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 h-full overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pe-1">
                    {colTasks.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        لا توجد مهام هنا
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            {/* Priority badge & Delete */}
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                                  task.priority === 'urgent'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse'
                                    : task.priority === 'high'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : task.priority === 'medium'
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {task.priority === 'urgent' && <Flame className="w-3 h-3" />}
                                <span>{task.priority}</span>
                              </span>

                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                                title="حذف المهمة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Title & Desc */}
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Meta & Stage shifts */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                              {task.assignedToName ? (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-indigo-500" />
                                  <span className="truncate max-w-[80px]">{task.assignedToName}</span>
                                </span>
                              ) : (
                                <span className="italic">غير معين</span>
                              )}

                              {task.dueDate && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>{task.dueDate}</span>
                                </span>
                              )}
                            </div>

                            {/* Quick status cycle button */}
                            <div className="flex items-center justify-between gap-1 pt-1">
                              {task.status !== 'todo' && (
                                <button
                                  onClick={() => {
                                    const prevStatus =
                                      task.status === 'done' ? 'review' : task.status === 'review' ? 'in_progress' : 'todo';
                                    handleUpdateStatus(task.id, prevStatus);
                                  }}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                  title="رجوع للمرحلة السابقة"
                                >
                                  {isRtl ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                                </button>
                              )}

                              <div className="flex-1" />

                              {task.status !== 'done' && (
                                <button
                                  onClick={() => {
                                    const nextStatus =
                                      task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'review' : 'done';
                                    handleUpdateStatus(task.id, nextStatus);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white text-[10px] font-semibold transition-colors"
                                >
                                  <span>تقدم</span>
                                  {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('addTask')}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('taskTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: بناء واجهة تسجيل الدخول والناف بار"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('taskDesc')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="المتطلبات الدقيقة لهذه المهمة..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('taskPriority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="low">{t('priorityLow')}</option>
                    <option value="medium">{t('priorityMedium')}</option>
                    <option value="high">{t('priorityHigh')}</option>
                    <option value="urgent">{t('priorityUrgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المرحلة الأولى
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="todo">{t('statusTodo')}</option>
                    <option value="in_progress">{t('statusInProgress')}</option>
                    <option value="review">{t('statusReview')}</option>
                    <option value="done">{t('statusDone')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('taskAssignee')}
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">غير محدد</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('taskDueDate')}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {t('addTask')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
