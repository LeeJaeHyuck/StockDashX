import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSimulationTransaction } from '../../api/simulation';
import { searchStocks, getStockQuote } from '../../api/stocks';

/**
 * 모의 투자 거래 생성 폼 컴포넌트
 * 
 * 모의 투자 계좌에 새 거래 내역을 생성하기 위한 폼을 제공합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {number} props.accountId - 모의 투자 계좌 ID
 */
const SimulationTradeForm = ({ accountId }) => {
  // 네비게이션 훅
  const navigate = useNavigate();
  
  // 폼 상태 초기화
  const [formData, setFormData] = useState({
    account_id: accountId,
    symbol: '',
    transaction_type: 'BUY',
    quantity: 1,
    price: 0,
  });
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
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
    if (name === 'quantity') {
      const quantity = parseInt(value) || 0;
      if (quantity < 0) return; // 음수 수량 방지
      
      setFormData(prev => ({
        ...prev,
        [name]: quantity
      }));
    } else if (name === 'price') {
      const price = parseFloat(value) || 0;
      if (price < 0) return; // 음수 가격 방지
      
      setFormData(prev => ({
        ...prev,
        [name]: price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * 심볼 검색 핸들러
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setError(null);
      // API를 통해 주식 검색
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      setError('주식 검색 중 오류가 발생했습니다: ' + err.message);
    }
  };

  /**
   * 검색어 입력 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(false);
  };

  /**
   * 엔터 키 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * 주식 선택 핸들러
   * @param {Object} stock - 선택한 주식 정보
   */
  const handleSelectStock = async (stock) => {
    try {
      // 주식 시세 정보 가져오기
      const quoteData = await getStockQuote(stock.symbol);
      
      setSelectedStock({
        ...stock,
        price: quoteData.price
      });
      
      // 폼 데이터 업데이트
      setFormData(prev => ({
        ...prev,
        symbol: stock.symbol,
        price: quoteData.price
      }));
      
      // 검색 결과 숨기기
      setShowResults(false);
    } catch (err) {
      setError('주식 시세 정보를 가져오는 중 오류가 발생했습니다: ' + err.message);
    }
  };

  /**
   * 폼 제출 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.symbol.trim()) {
      setError('주식 심볼을 입력해주세요.');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('수량은 0보다 커야 합니다.');
      return;
    }
    
    if (formData.price <= 0) {
      setError('가격은 0보다 커야 합니다.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // API를 통해 모의 투자 거래 내역 생성
      await createSimulationTransaction(formData);
      
      // 계좌 상세 페이지로 이동
      navigate(`/simulation/${accountId}`);
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
    navigate(`/simulation/${accountId}`);
  };

  // 총액 계산
  const totalAmount = formData.quantity * formData.price;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">모의 투자 거래 추가</h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 거래 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 주식 검색 필드 */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            주식 *
          </label>
          <div className="relative">
            <div className="flex">
              <input
                type="text"
                placeholder="주식 심볼 또는 회사명 검색"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                검색
              </button>
            </div>
            
            {/* 검색 결과 */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
                <ul>
                  {searchResults.map((stock) => (
                    <li
                      key={stock.symbol}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-600">{stock.name}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* 선택된 주식 정보 */}
          {selectedStock && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium">{selectedStock.symbol}</span>
                  <span className="text-sm text-gray-600 ml-2">{selectedStock.name}</span>
                </div>
                <div>
                  <span className="font-medium">${selectedStock.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 거래 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            거래 유형 *
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="transaction_type"
                value="BUY"
                checked={formData.transaction_type === 'BUY'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">매수</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="transaction_type"
                value="SELL"
                checked={formData.transaction_type === 'SELL'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">매도</span>
            </label>
          </div>
        </div>
        
        {/* 수량 */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            수량 *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* 가격 */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            가격 ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* 총액 */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">총액:</span>
            <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
          </div>
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
            {submitting ? '처리 중...' : '거래 추가'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimulationTradeForm;