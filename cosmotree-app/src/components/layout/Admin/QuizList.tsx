import React, { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AdminGuideCard } from './AdminGuideCard';
import Icon from '../../UI/Icon';
import Swal from 'sweetalert2';

export type QuizType = 'MultipleChoice' | 'ShortAnswer';
export interface Quiz {
  type: QuizType;
  question: string;
  choices?: string[];
  answer: string;
  explanation?: string;
}

interface Module {
  id: string;
  title: string;
  quizzes: Quiz[];
}

export const QuizList: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  const [quizType, setQuizType] = useState<QuizType>('MultipleChoice');
  const [viewType, setViewType] = useState<QuizType>('MultipleChoice');
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState<string[]>(Array(4).fill(''));
  const [answer, setAnswer] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'modules'), snapshot => {
      const mods: Module[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        mods.push({ id: docSnap.id, title: data.title, quizzes: data.quizzes || [] });
      });
      setModules(mods);
    });
    return () => unsub();
  }, []);

  const handleAddOrUpdateQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !question.trim()) return;
    const module = modules.find(m => m.id === selectedModuleId);
    if (!module) return;
    const trimmedQ = question.trim();
    // duplicate question check
    const others = module.quizzes.filter((_, i) => i !== (editingIndex ?? -1));
    if (others.some(q => q.question === trimmedQ)) {
      alert('Quiz question must be unique.');
      return;
    }
    let updated = [...module.quizzes];
    if (quizType === 'MultipleChoice') {
      const trimmedChoices = choices.map(c => c.trim());
      // ensure no empty and unique
      if (trimmedChoices.some(c => c === '')) {
        alert('All choices must be filled.');
        return;
      }
      if (new Set(trimmedChoices).size !== trimmedChoices.length) {
        alert('Choices must be unique.');
        return;
      }
      const trimAnswer = answer.trim();
      if (!trimAnswer) {
        alert('Answer is required.');
        return;
      }
      if (!trimmedChoices.includes(trimAnswer)) {
        alert('Answer must match one of the choices.');
        return;
      }
      const quiz: Quiz = {
        type: 'MultipleChoice',
        question: trimmedQ,
        choices: trimmedChoices,
        answer: trimAnswer,
        explanation: explanation.trim() || undefined,
      };
      if (editingIndex !== null) updated[editingIndex] = quiz;
      else updated.push(quiz);
    } else {
      const trimSA = shortAnswer.trim();
      if (!trimSA) {
        alert('Answer is required.');
        return;
      }
      const quiz: Quiz = { 
        type: 'ShortAnswer', 
        question: trimmedQ, 
        answer: trimSA,
        explanation: explanation.trim() || undefined,
      };
      if (editingIndex !== null) updated[editingIndex] = quiz;
      else updated.push(quiz);
    }
    await updateDoc(doc(db, 'modules', selectedModuleId), { quizzes: updated });
    // reset form
    setQuestion('');
    setChoices(Array(5).fill(''));
    setAnswer('');
    setShortAnswer('');
    setExplanation('');
    setEditingIndex(null);
  };

  const handleDeleteQuiz = async (index: number) => {

    // 퀴즈 삭제 전 사용자에게 확인을 요청합니다
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this quiz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      // 삭제 취소됨
      console.log('퀴즈 삭제가 취소되었습니다');
      return;
    }

    if (!selectedModuleId) return;
    const module = modules.find(m => m.id === selectedModuleId);
    if (!module) return;
    const updated = module.quizzes.filter((_, i) => i !== index);
    await updateDoc(doc(db, 'modules', selectedModuleId), { quizzes: updated });
  };

  const startEdit = (index: number) => {
    const module = modules.find(m => m.id === selectedModuleId);
    if (!module) return;
    const quiz = module.quizzes[index];
    setEditingIndex(index);
    setQuizType(quiz.type);
    setQuestion(quiz.question);
    setExplanation(quiz.explanation || '');
    if (quiz.type === 'MultipleChoice') {
      setChoices(quiz.choices || Array(5).fill(''));
      setAnswer(quiz.answer);
    } else {
      setShortAnswer(quiz.answer);
    }
  };

  const filteredQuizzes = selectedModuleId
    ? modules.find(m => m.id === selectedModuleId)?.quizzes.filter(q => q.type === viewType) || []
    : [];

  return (
    <div className=" mx-auto">

      {/* 도움말 카드 */}
      <AdminGuideCard
        icon="seed"
        title="Quiz Management Guide"
        description="Create and manage quizzes for your learning modules with detailed explanations."
        tips={[
          "Select a module first to view and manage its quizzes",
          "Use Multiple Choice for questions with specific options",
          "Use Short Answer for open-ended questions",
          "Always add explanations to help students understand the correct answers",
          "Make sure answer text matches exactly with one of the choices for Multiple Choice"
        ]}
      />

      <h2 className="text-2xl font-semibold mb-6">Manage Module Quizzes</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Select Module</label>
        <select
          className="mt-1 block w-full border rounded p-2"
          value={selectedModuleId}
          onChange={e => {
            setSelectedModuleId(e.target.value);
            setEditingIndex(null);
          }}
        >
          <option value="">-- Choose Module --</option>
          {modules.map(mod => (
            <option key={mod.id} value={mod.id}>
              {mod.title}
            </option>
          ))}
        </select>
      </div>

      {selectedModuleId && (
        <>
          <form onSubmit={handleAddOrUpdateQuiz} className="space-y-4 mb-8 border p-4 rounded">
            <div>
              <label className="block text-sm font-medium">Quiz Type</label>
              <div className="mt-1 flex space-x-4">
                <label>
                  <input
                    type="radio"
                    checked={quizType === 'MultipleChoice'}
                    onChange={() => setQuizType('MultipleChoice')}
                  />{' '}
                  MultipleChoice
                </label>
                <label>
                  <input
                    type="radio"
                    checked={quizType === 'ShortAnswer'}
                    onChange={() => setQuizType('ShortAnswer')}
                  />{' '}
                  Short Answer
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Question</label>
              <textarea
                rows={2}
                className="mt-1 block w-full border rounded p-2"
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
            </div>
            {quizType === 'MultipleChoice' ? (
              <>
                <div>
                  <label className="block text-sm font-medium">Choices</label>
                  <div className="mt-1 space-y-2">
                    {choices.map((c, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Choice ${idx + 1}`}
                        className="block w-full border rounded p-2"
                        value={c}
                        onChange={e => {
                          const a = [...choices];
                          a[idx] = e.target.value;
                          setChoices(a);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Answer</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium">Answer</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded p-2"
                  value={shortAnswer}
                  onChange={e => setShortAnswer(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Explanation (Optional)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border rounded p-2"
                placeholder="Explain why this answer is correct..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              {editingIndex !== null ? 'Update' : 'Add'} Quiz
            </button>
          </form>

          <div className="mb-4">
            <label className="block text-sm font-medium">View Quizzes</label>
            <div className="mt-1 flex space-x-4">
              <label>
                <input
                  type="radio"
                  checked={viewType === 'MultipleChoice'}
                  onChange={() => setViewType('MultipleChoice')}
                />{' '}
                Multiple Choice
              </label>
              <label>
                <input
                  type="radio"
                  checked={viewType === 'ShortAnswer'}
                  onChange={() => setViewType('ShortAnswer')}
                />{' '}
                Short Answer
              </label>
            </div>
          </div>

          <ul className="space-y-4">
            {filteredQuizzes.map((q, idx) => (
              <li key={idx} className="border p-4 rounded flex justify-between">
                <div>
                  <p className="font-medium">
                    [{q.type}] {q.question}
                  </p>
                  {q.type === 'MultipleChoice' ? (
                    <ol className="list-decimal list-inside ml-4">
                      {q.choices?.map((c, i) => (
                        <li key={i} className={c === q.answer ? 'font-bold text-green-600' : ''}>
                          {c}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm">Answer: {q.answer}</p>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button onClick={() => startEdit(idx)} className="text-blue-500">
                    {/* 수정 아이콘 버튼 - 퀴즈 편집 시작 */}
                    <Icon name="edit" className="inline-block mr-1" />
                  </button>
                  <button onClick={() => handleDeleteQuiz(idx)} className="text-red-500">
                    {/* 삭제 아이콘 버튼 - 퀴즈 삭제 */}
                    <Icon name="delete" className="inline-block mr-1" />
                  </button>
                </div>
              </li>
            ))}
            {filteredQuizzes.length === 0 && (
              <p className="text-gray-500">No {viewType} quizzes.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};
