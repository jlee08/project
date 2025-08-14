// UserList.tsx
import React from 'react';
import { Timestamp, doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useCollection } from '../../../pages/utils/useCollections';
import { useAuth } from '../../../context/AuthContext';
import { AdminGuideCard } from './AdminGuideCard';
import Icon from '../../UI/Icon';
import { db } from '../../../config/firebase';

type User = { id: string; email: string; createdAt: number };

export function UserList() {
  const users = useCollection<User>('users');
  const { user } = useAuth();

  // Exclude the current admin from the list
  const filteredUsers = users.filter(u => u.id !== user?.uid);

  // Convert Firestore Timestamp or millisecond number to JS Date
  const toDate = (ts: number | Timestamp): Date =>
    ts instanceof Timestamp ? ts.toDate() : new Date(ts);

  const handleDelete = async (uid: string) => {
    // SweetAlert2를 사용하여 삭제 확인 모달 표시
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: 'Delete User',
      text: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      // 사용자 삭제 진행 상황 표시
      Swal.fire({
        title: 'Deleting User...',
        text: 'Please wait while we delete the user data.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 1. 사용자의 퀴즈 결과 삭제
      try {
        const quizResultsQuery = query(collection(db, 'quiz_results'), where('userId', '==', uid));
        const quizResultsSnapshot = await getDocs(quizResultsQuery);
        const deletePromises = quizResultsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('퀴즈 결과 삭제 완료');
      } catch (error) {
        console.warn('퀴즈 결과 삭제 중 오류:', error);
      }

      // 2. 사용자의 학습 진도 삭제
      try {
        const progressQuery = query(collection(db, 'user_progress'), where('userId', '==', uid));
        const progressSnapshot = await getDocs(progressQuery);
        const progressDeletePromises = progressSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(progressDeletePromises);
        console.log('학습 진도 삭제 완료');
      } catch (error) {
        console.warn('학습 진도 삭제 중 오류:', error);
      }

      // 3. 사용자 기본 정보 삭제
      await deleteDoc(doc(db, 'users', uid));
      console.log('사용자 정보 삭제 완료');

      // 성공 메시지 표시
      await Swal.fire({
        title: 'Success!',
        text: 'User has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

    } catch (err: any) {
      console.error('사용자 삭제 실패:', err);
      await Swal.fire({
        title: 'Error',
        text: `Failed to delete user: ${err.message || 'Unknown error occurred'}`,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Guide Card */}
      <AdminGuideCard
        title="User Management"
        description="Manage registered users, view their information, and delete accounts when necessary."
        tips={[
          "Users are automatically registered when they sign up",
          "Deleted users cannot be recovered - be careful!",
          "User data includes all their quiz progress and learning history",
          "Current admin users cannot delete themselves"
        ]}
        icon="users"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-gray-600 mt-1">Total registered users: {filteredUsers.length}</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Icon name="users" className="w-5 h-5" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
        </div>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Users will appear here once they register.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <div 
                key={u.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="user" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.email}</p>
                    <p className="text-sm text-gray-600">
                      Registered: {toDate(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(u.id)}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200"
                >
                  <Icon name="trash" className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
