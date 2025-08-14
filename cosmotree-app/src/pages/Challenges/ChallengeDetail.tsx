// src/pages/Challenges/ChallengeDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import Icon from '../../components/UI/Icon';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import './ChallengeDetail.css';
import Swal from 'sweetalert2';

// ───────────────────────── Types
interface ChallengeDoc {
  id?: string;
  templateId?: string | null;
  templateName?: string | null;
  generatedContent: any; // JSON or string
  rawPrompt?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

interface ModuleDoc {
  title: string;
  difficulty?: string;
}

interface ChallengeSubmission {
  userId: string;
  challengeId: string;
  moduleId: string;
  submittedAt: any;
  status: 'submitted';
}

// ───────────────────────── 콘텐츠 타입 감지 함수
const detectContentType = (content: string): 'markdown' | 'html' | 'json' | 'text' => {
  // HTML 태그 패턴 확인
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  
  // 마크다운 패턈 확인
  const markdownPatterns = [
    /^#{1,6}\s/m,           // 헤더
    /^\*\s|\-\s|\+\s/m,     // 리스트
    /\*\*.*\*\*/,           // 볼드
    /\*.*\*/,               // 이탤릭
    /\[.*\]\(.*\)/,         // 링크
    /```[\s\S]*```/,        // 코드 블록
    /`.*`/,                 // 인라인 코드
    /^\|.*\|/m,             // 테이블
    /^>/m                   // 인용
  ];
  
  // JSON 형태인지 확인
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // JSON 파싱 실패시 다른 타입 확인 계속
    }
  }
  
  // HTML 태그가 있으면 HTML
  if (htmlPattern.test(content)) {
    return 'html';
  }
  
  // 마크다운 패턴이 있으면 마크다운
  if (markdownPatterns.some(pattern => pattern.test(content))) {
    return 'markdown';
  }
  
  // 기본값은 텍스트
  return 'text';
};

// ───────────────────────── 스마트 콘텐츠 렌더러
const SmartContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const contentType = detectContentType(content);
  
  switch (contentType) {
    case 'markdown':
      return (
        <div className="markdown-content relative">
          {/* 클립보드 복사 버튼 */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(content).then(() => {
                // 복사 성공 피드백
                const button = document.activeElement as HTMLButtonElement;
                const originalText = button.innerHTML;
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>';
                button.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.style.backgroundColor = '';
                }, 2000);
              }).catch(() => {
                console.error('클립보드 복사 실패');
              });
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
            title="Copy to clipboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
          </button>
          
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // 마크다운 요소들을 우주 테마에 맞게 스타일링
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-white mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-white mb-2 mt-4">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-semibold text-white mb-2 mt-3">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-base font-semibold text-white mb-2 mt-3">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-sm font-semibold text-white mb-2 mt-3">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="text-white/90 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none space-y-2 mb-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-none space-y-2 mb-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-3 text-white/90">
                  <span className="text-white/60 text-sm mt-1 flex-shrink-0">
                    ✦
                  </span>
                  <div className="flex-1">{children}</div>
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-400/50 bg-blue-900/20 pl-4 py-2 mb-4 rounded-r-lg">
                  <div className="text-blue-200 italic">{children}</div>
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-800/60 text-green-300 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-gray-900/80 text-green-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-gray-900/80 rounded-lg mb-4 overflow-x-auto">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-white/20 bg-white/10 px-3 py-2 text-left text-white font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-white/20 px-3 py-2 text-white/90">
                  {children}
                </td>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-300 hover:text-blue-200 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-bold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-white/95 italic">{children}</em>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    
    case 'html':
      return (
        <div className="html-content text-white/90 leading-relaxed relative">
          {/* 클립보드 복사 버튼 */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(content).then(() => {
                const button = document.activeElement as HTMLButtonElement;
                const originalText = button.innerHTML;
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>';
                button.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.style.backgroundColor = '';
                }, 2000);
              }).catch(() => {
                console.error('클립보드 복사 실패');
              });
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
            title="Copy to clipboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
          </button>
          
          <div 
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    
    case 'json':
      try {
        const jsonData = JSON.parse(content);
        return (
          <div className="json-content relative">
            {/* 클립보드 복사 버튼 */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(content).then(() => {
                  const button = document.activeElement as HTMLButtonElement;
                  const originalText = button.innerHTML;
                  button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>';
                  button.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                  setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                  }, 2000);
                }).catch(() => {
                  console.error('클립보드 복사 실패');
                });
              }}
              className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
              title="Copy to clipboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
              </svg>
            </button>
            
            <pre className="bg-gray-900/80 text-green-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        );
      } catch {
        // JSON 파싱 실패시 일반 텍스트로 처리
        return (
          <div className="whitespace-pre-wrap text-white/90 leading-relaxed relative">
            {/* 클립보드 복사 버튼 */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(content).then(() => {
                  const button = document.activeElement as HTMLButtonElement;
                  const originalText = button.innerHTML;
                  button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>';
                  button.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                  setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                  }, 2000);
                }).catch(() => {
                  console.error('클립보드 복사 실패');
                });
              }}
              className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
              title="Copy to clipboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
              </svg>
            </button>
            {content}
          </div>
        );
      }
    
    default: // 'text'
      return (
        <div className="whitespace-pre-wrap text-white/90 leading-relaxed relative">
          {/* 클립보드 복사 버튼 */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(content).then(() => {
                const button = document.activeElement as HTMLButtonElement;
                const originalText = button.innerHTML;
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>';
                button.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.style.backgroundColor = '';
                }, 2000);
              }).catch(() => {
                console.error('클립보드 복사 실패');
              });
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
            title="Copy to clipboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
          </button>
          {content}
        </div>
      );
  }
};
const ChallengeContentRenderer: React.FC<{ content: any }> = ({ content }) => {
  if (!content) return null;

  // JSON 문자열인 경우 파싱
  let parsedContent = content;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // JSON이 아닌 일반 문자열인 경우 스마트 렌더러 사용
      return (
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SmartContentRenderer content={content} />
        </motion.div>
      );
    }
  }

  // 공통 필드들 추출
  const title = parsedContent.title || parsedContent.missionTitle || parsedContent.name || 'Challenge';
  const description = parsedContent.description || parsedContent.overview || parsedContent.instructions;
  const requirements = parsedContent.requirements || parsedContent.tasks;
  const objectives = parsedContent.objectives || parsedContent.goals;
  const constraints = parsedContent.constraints || parsedContent.rules;
  const rubric = parsedContent.rubric || parsedContent.evaluation || parsedContent.grading;
  const format = parsedContent.format || parsedContent.outputFormat || parsedContent.deliverables;

  return (
    <div className="space-y-6">
      {/* 제목 카드 */}
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-gradient"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">{title}</h1>
          {description && (
            <p className="text-xl text-white/90 leading-relaxed text-center max-w-3xl mx-auto">{description}</p>
          )}
        </div>
        <div className="floating-stars">
          <div className="star star-1">✦</div>
          <div className="star star-2">✧</div>
          <div className="star star-3">✦</div>
          <div className="star star-4">✧</div>
          <div className="star star-5">✦</div>
        </div>
      </motion.div>

      {/* 목표 카드 */}
      {objectives && (
        <motion.div
          className="glass-card blue-glow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="card-header">
            <div className="icon-wrapper blue">
              <Icon name="target" size={24} className="text-blue-300" />
            </div>
            <h2 className="card-title">Learning Objectives</h2>
          </div>
          <div className="card-content">
            {Array.isArray(objectives) ? (
              <ul className="custom-list">
                {objectives.map((obj: string, index: number) => (
                  <li key={index} className="list-item">{obj}</li>
                ))}
              </ul>
            ) : (
              <SmartContentRenderer content={String(objectives)} />
            )}
          </div>
        </motion.div>
      )}

      {/* 요구사항 카드 */}
      {requirements && (
        <motion.div
          className="glass-card purple-glow"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-header">
            <div className="icon-wrapper purple">
              <Icon name="checklist" size={24} className="text-purple-300" />
            </div>
            <h2 className="card-title">Requirements</h2>
          </div>
          <div className="card-content">
            {Array.isArray(requirements) ? (
              <ul className="custom-list">
                {requirements.map((req: string, index: number) => (
                  <li key={index} className="list-item">{req}</li>
                ))}
              </ul>
            ) : (
              <SmartContentRenderer content={String(requirements)} />
            )}
          </div>
        </motion.div>
      )}

      {/* 제약사항 카드 */}
      {constraints && (
        <motion.div
          className="glass-card amber-glow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="card-header">
            <div className="icon-wrapper amber">
              <Icon name="warning" size={24} className="text-amber-300" />
            </div>
            <h2 className="card-title">Constraints</h2>
          </div>
          <div className="card-content">
            {Array.isArray(constraints) ? (
              <ul className="custom-list">
                {constraints.map((constraint: string, index: number) => (
                  <li key={index} className="list-item">{constraint}</li>
                ))}
              </ul>
            ) : (
              <SmartContentRenderer content={String(constraints)} />
            )}
          </div>
        </motion.div>
      )}

      {/* 제출 형식 카드 */}
      {format && (
        <motion.div
          className="glass-card green-glow"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card-header">
            <div className="icon-wrapper green">
              <Icon name="document" size={24} className="text-green-300" />
            </div>
            <h2 className="card-title">Submission Format</h2>
          </div>
          <div className="card-content">
            {Array.isArray(format) ? (
              <ul className="custom-list">
                {format.map((item: string, index: number) => (
                  <li key={index} className="list-item">{item}</li>
                ))}
              </ul>
            ) : (
              <SmartContentRenderer content={String(format)} />
            )}
          </div>
        </motion.div>
      )}

      {/* 평가 기준 카드 */}
      {rubric && (
        <motion.div
          className="glass-card gray-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header">
            <div className="icon-wrapper gray">
              <Icon name="clipboard" size={24} className="text-gray-300" />
            </div>
            <h2 className="card-title">Evaluation Criteria</h2>
          </div>
          <div className="card-content">
            {Array.isArray(rubric) ? (
              <ul className="custom-list">
                {rubric.map((criterion: string, index: number) => (
                  <li key={index} className="list-item">{criterion}</li>
                ))}
              </ul>
            ) : (
              <SmartContentRenderer content={String(rubric)} />
            )}
          </div>
        </motion.div>
      )}

      {/* 기타 콘텐츠 카드 */}
      {Object.entries(parsedContent).map(([key, value], index) => {
        // 이미 렌더링한 필드들은 제외
        if (['title', 'missionTitle', 'name', 'description', 'overview', 'instructions', 
             'requirements', 'tasks', 'objectives', 'goals', 'constraints', 'rules', 
             'rubric', 'evaluation', 'grading', 'format', 'outputFormat', 'deliverables'].includes(key)) {
          return null;
        }

        if (!value || typeof value === 'object') return null;

        return (
          <motion.div
            key={key}
            className="glass-card white-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
          >
            <div className="card-header">
              <div className="icon-wrapper white">
                <Icon name="document" size={24} className="text-white" />
              </div>
              <h3 className="card-title capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
            </div>
            <div className="card-content">
              <SmartContentRenderer content={String(value)} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ───────────────────────── 메인 컴포넌트
const ChallengeDetail: React.FC = () => {
  const { moduleId, challengeId } = useParams<{ moduleId: string; challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengeDoc | null>(null);
  const [module, setModule] = useState<ModuleDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 챌린지 데이터 로드
  useEffect(() => {
    if (!moduleId || !challengeId) {
      navigate('/challenges');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // 챌린지 데이터 로드
        const challengeDoc = await getDoc(doc(db, `modules/${moduleId}/challenges/${challengeId}`));
        if (challengeDoc.exists()) {
          setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as ChallengeDoc);
        } else {
          console.error('챌린지를 찾을 수 없습니다');
          navigate('/challenges');
          return;
        }

        // 모듈 데이터 로드
        const moduleDoc = await getDoc(doc(db, `modules/${moduleId}`));
        if (moduleDoc.exists()) {
          setModule(moduleDoc.data() as ModuleDoc);
        }

        // 제출 상태 확인
        const user = auth.currentUser;
        if (user) {
          const submissionDoc = await getDoc(
            doc(db, `modules/${moduleId}/challenges/${challengeId}/submissions/${user.uid}`)
          );
          setIsSubmitted(submissionDoc.exists());
        }
      } catch (error) {
        console.error('챌린지 로드 실패:', error);
        navigate('/challenges');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [moduleId, challengeId, navigate]);

  // 챌린지 제출 (구글폼으로 리다이렉트)
  const handleSubmit = async () => {
    if (!moduleId || !challengeId) return;

    const user = auth.currentUser;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isSubmitted) {
      alert('이미 제출한 챌린지입니다.');
      return;
    }

    // 구글폼 샘플 링크 (실제로는 각 챌린지별로 다른 링크 사용)
    const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdmY3QG8K5L9wZ2vX4nA7sR6tU8iB3hC9fG2lK7mP0nQ5rS1t/viewform';
    
    // SweetAlert2를 사용하여 제출 확인 다이얼로그 표시 (영어)
    // Swal은 전역 import 또는 npm 패키지로 설치 필요
    // import Swal from 'sweetalert2'; 상단에 추가 필요

    const result = await Swal.fire({
      title: 'Submit Challenge?',
      text: 'You will be redirected to Google Form to complete your submission.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    const confirmed = result.isConfirmed;
    if (!confirmed) return;

    try {
      setSubmitting(true);

      // Firebase에 제출 상태 기록
      const submission: ChallengeSubmission = {
        userId: user.uid,
        challengeId,
        moduleId,
        submittedAt: serverTimestamp(),
        status: 'submitted',
      };

      await setDoc(
        doc(db, `modules/${moduleId}/challenges/${challengeId}/submissions/${user.uid}`),
        submission
      );

      setIsSubmitted(true);
      
      // 구글폼 새 탭에서 열기
      window.open(googleFormUrl, '_blank');
      
      alert('제출 상태가 기록되었습니다! 구글폼에서 챌린지를 완료해주세요.');
    } catch (error) {
      console.error('챌린지 제출 실패:', error);
      alert('챌린지 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="galaxy-background"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="glass-card text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-white text-lg">Loading challenge...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen relative">
        <div className="galaxy-background"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="glass-card text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Challenge Not Found</h2>
            <p className="text-white/80 mb-6">The requested challenge could not be found.</p>
            <button
              onClick={() => navigate('/challenges')}
              className="submit-button"
            >
              <Icon name="arrow-left" size={20} />
              Back to Challenges
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 갤럭시 배경 */}
      <div className="galaxy-background">
        <div className="shooting-star" style={{ top: '10%', animationDelay: '0s' }}></div>
        <div className="shooting-star" style={{ top: '30%', animationDelay: '2s' }}></div>
        <div className="shooting-star" style={{ top: '50%', animationDelay: '4s' }}></div>
        <div className="shooting-star" style={{ top: '70%', animationDelay: '6s' }}></div>
      </div>
      
      <div className="relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto p-6">

          {/* 모듈 제목 표시 */}
          // 모듈 정보가 있을 때만 렌더링합니다
          {module && (
            <motion.div
              className="glass-card mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white text-center">
                {module.title}
              </h2>
              {module.difficulty && (
                <p className="text-white/80 text-center mt-2">
                  Difficulty: {module.difficulty}
                </p>
              )}
            </motion.div>
          )}

          {/* 제출 상태 표시 */}
          {isSubmitted && (
            <motion.div
              className="glass-card green-glow mb-6 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 text-green-300">
                <Icon name="check" size={24} />
                <span className="text-lg font-semibold">Already Submitted</span>
              </div>
            </motion.div>
          )}

          {/* 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ChallengeContentRenderer content={challenge.generatedContent} />
          </motion.div>

          {/* 제출 버튼 */}
          <motion.div
            className="submit-card mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Submit?</h3>
            <p className="text-white/80 mb-6 text-lg">
              Click the button below to open the submission form in a new tab.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/challenges')}
                className="glass-card px-6 py-3 text-white font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                {/* 아이콘을 180도 회전하여 뒤로가기 방향으로 표시합니다 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(180deg)' }}>
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"></path>
                </svg>
                Back to Challenges
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={submitting || isSubmitted}
                className={`submit-button ${
                  isSubmitted
                    ? 'opacity-50 cursor-not-allowed'
                    : submitting
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Opening Form...
                  </>
                ) : isSubmitted ? (
                  <>
                    <Icon name="check" size={20} />
                    Submitted to Form
                  </>
                ) : (
                  <>
                    <Icon name="send" size={20} />
                    Submit via Google Form
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
