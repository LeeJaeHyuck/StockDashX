import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSimulationAccount } from '../../api/simulation';

/**
 * 모의 투자 계좌 생성 폼 컴포넌트
 * 
 * 새 모의 투자 계좌를 생성하기 위한 폼을 제공합니다.
 */
const SimulationAccountForm = () => {
  // 네비게이션 훅
  const navigate = useNavigate();
  
  // 폼 상태 초기화
  const [formData, setFormData] = useState({
    name: '',
    initial_balance: 100000,
  });
  
  // 에러 상태
  const [error, setError] = useState(null);
  // 제출 중 상태
  const [submitting, setSubmitting] = useState(false);

  /**
   * 폼 입력 값 변경 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 숫자 필드 처리
    if (name === 'initial_balance') {
      const amount = parseFloat(value) || 0;
      if (amount < 0) return; // 음수 금액 방지
      
      setFormData(prev => ({
        ...prev,
        [name]: amount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * 폼 제출 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      setError('계좌 이름을 입력해주세요.');
      return;
    }
    
    if (formData.initial_balance <= 0) {
      setError('초기 자본은 0보다 커야 합니다.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // API를 통해 모의 투자 계좌 생성
      await createSimulationAccount(formData);
      
      // 계좌 목록으로 이동
      navigate('/simulation');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = () => {
    navigate('/simulation');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">새 모의 투자 계좌 생성</h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 계좌 생성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            계좌 이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="initial_balance" className="block text-sm font-medium text-gray-700 mb-1">
            초기 자본 ($) *
          </label>
          <input
            type="number"
            id="initial_balance"
            name="initial_balance"
            value={formData.initial_balance}
            onChange={handleChange}
            min="1"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">기본값: $100,000</p>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? '처리 중...' : '계좌 생성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimulationAccountForm;