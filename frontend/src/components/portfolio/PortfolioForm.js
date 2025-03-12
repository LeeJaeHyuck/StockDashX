import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortfolio, updatePortfolio } from '../../api/portfolios';

/**
 * 포트폴리오 생성/수정 폼 컴포넌트
 * 
 * 새 포트폴리오 생성 또는 기존 포트폴리오 수정을 위한 폼을 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.portfolio - 수정할 포트폴리오 정보 (수정 시에만 사용)
 * @param {Function} props.onSuccess - 폼 제출 성공 시 호출될 콜백 함수
 */
const PortfolioForm = ({ portfolio, onSuccess }) => {
  // 네비게이션 훅
  const navigate = useNavigate();
  
  // 폼 상태 초기화
  const [formData, setFormData] = useState({
    name: portfolio?.name || '',
    description: portfolio?.description || '',
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 폼 제출 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      setError('포트폴리오 이름을 입력해주세요.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (portfolio) {
        // 기존 포트폴리오 업데이트
        await updatePortfolio(portfolio.id, formData);
      } else {
        // 새 포트폴리오 생성
        await createPortfolio(formData);
      }
      
      // 성공 콜백 호출 또는 포트폴리오 목록으로 이동
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/portfolio');
      }
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
    if (portfolio) {
      // 수정 취소 시 상세 페이지로 이동
      navigate(`/portfolio/${portfolio.id}`);
    } else {
      // 생성 취소 시 목록으로 이동
      navigate('/portfolio');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {portfolio ? '포트폴리오 수정' : '새 포트폴리오 생성'}
      </h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 포트폴리오 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            포트폴리오 이름 *
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택사항)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {submitting ? '처리 중...' : (portfolio ? '수정' : '생성')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;