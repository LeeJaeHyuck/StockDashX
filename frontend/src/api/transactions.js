import api from './axios';

/**
 * 거래 내역 생성 API 요청 함수
 * 
 * 새 거래 내역을 생성합니다.
 * 
 * @param {Object} transaction - 생성할 거래 내역 정보
 * @param {number} transaction.portfolio_id - 포트폴리오 ID
 * @param {string} transaction.symbol - 주식 심볼
 * @param {string} transaction.transaction_type - 거래 유형 ("BUY" 또는 "SELL")
 * @param {number} transaction.quantity - 거래 수량
 * @param {number} transaction.price - 거래 가격
 * @returns {Promise<Object>} - 생성된 거래 내역 정보
 * @throws {Error} - 생성 실패 시 에러
 */
export const createTransaction = async (transaction) => {
  try {
    const response = await api.post('/transactions', transaction);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '거래 내역 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 포트폴리오 거래 내역 조회 API 요청 함수
 * 
 * 특정 포트폴리오의 모든 거래 내역을 가져옵니다.
 * 
 * @param {number} portfolioId - 포트폴리오 ID
 * @returns {Promise<Array>} - 거래 내역 목록
 * @throws {Error} - 조회 실패 시 에러
 */
export const getPortfolioTransactions = async (portfolioId) => {
  try {
    const response = await api.get(`/transactions/portfolio/${portfolioId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '거래 내역 조회 중 오류가 발생했습니다.');
  }
};