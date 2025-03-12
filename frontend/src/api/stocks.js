import api from './axios';

/**
 * 주식 검색 API 요청 함수
 * 
 * 주식 심볼 또는 회사명으로 주식을 검색합니다.
 * 
 * @param {string} query - 검색어
 * @returns {Promise<Array>} - 검색 결과 목록
 * @throws {Error} - 검색 실패 시 에러
 */
export const searchStocks = async (query) => {
  try {
    const response = await api.get(`/stocks/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '주식 검색 중 오류가 발생했습니다.');
  }
};

/**
 * 주식 시세 조회 API 요청 함수
 * 
 * 특정 주식의 실시간 시세 데이터를 가져옵니다.
 * 
 * @param {string} symbol - 주식 심볼 (예: AAPL, MSFT)
 * @returns {Promise<Object>} - 주식 시세 데이터
 * @throws {Error} - 시세 조회 실패 시 에러
 */
export const getStockQuote = async (symbol) => {
  try {
    const response = await api.get(`/stocks/quote/${symbol}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '주식 시세 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 주식 과거 데이터 조회 API 요청 함수
 * 
 * 특정 주식의 과거 가격 데이터를 가져옵니다.
 * 
 * @param {string} symbol - 주식 심볼
 * @param {string} interval - 데이터 간격 ('daily', 'weekly', 'monthly')
 * @returns {Promise<Object>} - 과거 주가 데이터
 * @throws {Error} - 데이터 조회 실패 시 에러
 */
export const getStockHistory = async (symbol, interval = 'daily') => {
  try {
    const response = await api.get(`/stocks/history/${symbol}`, {
      params: { interval }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '주식 과거 데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 저장된 주식 목록 조회 API 요청 함수
 * 
 * 데이터베이스에 저장된 주식 목록을 가져옵니다.
 * 
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 최대 항목 수
 * @returns {Promise<Array>} - 주식 목록
 * @throws {Error} - 조회 실패 시 에러
 */
export const getStocks = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/stocks/`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '주식 목록 조회 중 오류가 발생했습니다.');
  }
};