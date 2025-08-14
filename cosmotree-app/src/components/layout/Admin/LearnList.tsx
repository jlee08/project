import React, { useState, useEffect, FormEvent } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AdminGuideCard } from './AdminGuideCard';
import Icon from '../../UI/Icon';

export interface Lesson {
  id?: string;
  title: string;
  content: string;
}

export interface Module {
  id?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  subtitle: string;
  imageUrl: string;
  lessons: Lesson[];
}

const difficultyBadge = (d: Module['difficulty'] | undefined) => {
  switch (d) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'Advanced':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

export const LearnList: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState<{
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | undefined;
    title: string;
    subtitle: string;
    imageFile: File | null;
  }>({ difficulty: 'Beginner', title: '', subtitle: '', imageFile: null });
  const [modulePreview, setModulePreview] = useState<string>('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    index: number;
    title: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'modules'), snapshot => {
      const mods: Module[] = [];
      snapshot.forEach(docSnap => {
        mods.push({ id: docSnap.id, ...(docSnap.data() as Module) });
      });
      setModules(mods);
    });
    return () => unsub();
  }, []);

  // Module handlers
  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!newModule.title.trim() || !newModule.subtitle.trim()) return;
    if (modules.some(m => m.title === newModule.title.trim())) {
      alert('Module title already exists.');
      return;
    }
    const url = modulePreview;
    await addDoc(collection(db, 'modules'), {
      difficulty: newModule.difficulty,
      title: newModule.title.trim(),
      subtitle: newModule.subtitle.trim(),
      imageUrl: url,
      lessons: [],
      createdAt: serverTimestamp(),
    });
    setNewModule({ difficulty: 'Beginner', title: '', subtitle: '', imageFile: null });
    setModulePreview('');
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    await deleteDoc(doc(db, 'modules', moduleId));
    if (expandedModuleId === moduleId) setExpandedModuleId(null);
  };

  const handleStartEditModule = (mod: Module) => {
    setEditingModule({ ...mod });
  };

  const handleUpdateModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editingModule.id) return;
    const { id, title, subtitle, difficulty, imageUrl } = editingModule;
    if (!title.trim() || !subtitle.trim()) return;
    await updateDoc(doc(db, 'modules', id), {
      title: title.trim(),
      subtitle: subtitle.trim(),
      difficulty,
      imageUrl,
    });
    setEditingModule(null);
  };

  // Lesson handlers
  const handleAddLesson = async (moduleId: string, title: string, content: string) => {
    if (!title.trim() || !content.trim()) return;
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    if (mod.lessons.some(l => l.title === title.trim())) {
      alert('Lesson title already exists.');
      return;
    }
    const updatedLessons = [...mod.lessons, { title: title.trim(), content: content.trim() }];
    await updateDoc(doc(db, 'modules', moduleId), { lessons: updatedLessons });
  };

  const handleDeleteLesson = async (moduleId: string, index: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const updatedLessons = mod.lessons.filter((_, i) => i !== index);
    await updateDoc(doc(db, 'modules', moduleId), { lessons: updatedLessons });
  };

  const handleStartEditLesson = (moduleId: string, index: number, lesson: Lesson) => {
    setEditingLesson({ moduleId, index, title: lesson.title, content: lesson.content });
  };

  const handleUpdateLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    const { moduleId, index, title, content } = editingLesson;
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const updatedLessons = mod.lessons.map((l, i) =>
      i === index ? { title: title.trim(), content: content.trim() } : l
    );
    await updateDoc(doc(db, 'modules', moduleId), { lessons: updatedLessons });
    setEditingLesson(null);
  };

  return (
    <div className="space-y-6">
      {/* Admin Guide Card */}
      <AdminGuideCard
        title="Learning Module Management"
        description="Create and manage learning modules with lessons. Organize content by difficulty levels and structure educational materials."
        tips={[
          "Modules support Beginner, Intermediate, and Advanced difficulty levels",
          "Each module can contain multiple lessons with detailed content",
          "Use clear, descriptive titles for better user experience",
          "Preview module content before publishing"
        ]}
        icon="book"
      />

      {/* Header & Add Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>
            <p className="text-gray-600 mt-1">Total modules: {modules.length}</p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Icon name="book" className="w-5 h-5" />
            <span className="text-sm font-medium">Educational Content</span>
          </div>
        </div>

        {/* Add New Module Form */}
        <form onSubmit={handleAddModule} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" />
            Add New Module
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newModule.difficulty}
                onChange={e => setNewModule({ ...newModule, difficulty: e.target.value as any })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                maxLength={15}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newModule.title}
                onChange={e => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="Module title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                maxLength={40}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newModule.subtitle}
                onChange={e => setNewModule({ ...newModule, subtitle: e.target.value })}
                placeholder="Module description"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={modulePreview}
              onChange={e => setModulePreview(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add Module
          </button>
        </form>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Icon name="book" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-600">Create your first learning module to get started.</p>
          </div>
        ) : (
          modules.map(mod => (
            <div key={mod.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${difficultyBadge(mod.difficulty)}`}>
                      {mod.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{mod.subtitle}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="book" className="w-4 h-4" />
                    <span>{mod.lessons.length} lessons</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEditModule(mod)}
                    className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-200"
                  >
                    <Icon name="edit" className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id!)}
                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                  <button
                    onClick={() => setExpandedModuleId(expandedModuleId === mod.id ? null : mod.id!)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-white hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-200"
                  >
                    <Icon name={expandedModuleId === mod.id ? "chevron-up" : "chevron-down"} className="w-4 h-4" />
                    <span className="text-sm font-medium">Lessons</span>
                  </button>
                </div>
              </div>

              {/* Lessons Section */}
              {expandedModuleId === mod.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Lessons ({mod.lessons.length})</h4>
                  
                  {mod.lessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No lessons yet. Add the first lesson below.</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {mod.lessons.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                            <p className="text-sm text-gray-600 truncate">{lesson.content.substring(0, 100)}...</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditLesson(mod.id!, index, lesson)}
                              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Icon name="edit" className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(mod.id!, index)}
                              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Icon name="trash" className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Lesson Form */}
                  <LessonForm module={mod} onAdd={handleAddLesson} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Module</h3>
            <form onSubmit={handleUpdateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  value={editingModule.title}
                  onChange={e => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  value={editingModule.subtitle}
                  onChange={e => setEditingModule({ ...editingModule, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  value={editingModule.difficulty}
                  onChange={e => setEditingModule({ ...editingModule, difficulty: e.target.value as any })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Lesson</h3>
            <form onSubmit={handleUpdateLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  value={editingLesson.title}
                  onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  value={editingLesson.content}
                  onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Lesson Form Component
interface LessonFormProps {
  module: Module;
  onAdd: (moduleId: string, title: string, content: string) => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ module, onAdd }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAdd(module.id!, title, content);
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Icon name="plus" className="w-4 h-4" />
        Add New Lesson
      </h5>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter lesson title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Content</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter lesson content..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" />
          Add Lesson
        </button>
      </div>
    </form>
  );
};
