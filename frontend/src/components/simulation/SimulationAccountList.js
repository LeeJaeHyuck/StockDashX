import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSimulationAccounts, deleteSimulationAccount } from '../../api/simulation';

/**
 * 모의 투자 계좌 목록 컴포넌트
 * 
 * 사용자의 모든 모의 투자 계좌 목록을 표시합니다.
 */
const SimulationAccountList = () => {
  // 계좌 목록 상태
  const [accounts, setAccounts] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 계좌 목록 로드
  useEffect(() => {
    fetchAccounts();
  }, []);

  /**
   * 계좌 목록 조회 함수
   */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API를 통해 계좌 목록 가져오기
      const data = await getSimulationAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 계좌 삭제 핸들러
   * @param {number} id - 삭제할 계좌 ID
   * @param {Event} e - 이벤트 객체
   */
  const handleDelete = async (id, e) => {
    // 링크 클릭 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('정말로 이 모의 투자 계좌를 삭제하시겠습니까?')) {
      try {
        // API를 통해 계좌 삭제
        await deleteSimulationAccount(id);
        // 삭제 후 목록 갱신
        setAccounts(accounts.filter(account => account.id !== id));
      } catch (err) {
        alert(`삭제 실패: ${err.message}`);
      }
    }
  };

  // 로딩 중 표시
  if (loading && accounts.length === 0) {
    return <div className="text-center p-4">모의 투자 계좌 목록을 불러오는 중...</div>;
  }

  // 에러 표시
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">모의 투자 계좌 목록</h2>
        <Link
          to="/simulation/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          새 모의 투자 계좌
        </Link>
      </div>

      {/* 계좌가 없을 때 메시지 */}
      {accounts.length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500">모의 투자 계좌가 없습니다. 새 계좌를 생성해 보세요.</p>
        </div>
      ) : (
        // 계좌 목록
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Link
              key={account.id}
              to={`/simulation/${account.id}`}
              className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{account.name}</h3>
                <button
                  onClick={(e) => handleDelete(account.id, e)}
                  className="text-red-500 hover:text-red-700"
                  title="삭제"
                >
                  ×
                </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">초기 자본:</span>
                  <span className="font-medium">${account.initial_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">현재 잔액:</span>
                  <span className="font-medium">${account.current_balance.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                생성일: {new Date(account.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationAccountList;