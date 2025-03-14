import api from './axios';

/**
 * 시장 뉴스 조회 API 요청 함수
 * 
 * 시장 전반에 관한 뉴스를 가져옵니다.
 * 
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} pageSize - 페이지 당 뉴스 항목 수 (기본값: 10)
 * @returns {Promise<Object>} - 뉴스 데이터 (articles, totalResults 포함)
 * @throws {Error} - 조회 실패 시 에러
 */
export const getMarketNews = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/news/market', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '시장 뉴스 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 주식 관련 뉴스 조회 API 요청 함수
 * 
 * 특정 주식에 관한 뉴스를 가져옵니다.
 * 
 * @param {string} symbol - 주식 심볼 (예: AAPL, MSFT)
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} pageSize - 페이지 당 뉴스 항목 수 (기본값: 10)
 * @returns {Promise<Object>} - 뉴스 데이터 (symbol, companyName, articles, totalResults 포함)
 * @throws {Error} - 조회 실패 시 에러
 */
export const getStockNews = async (symbol, page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/news/stock/${symbol}`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '주식 뉴스 조회 중 오류가 발생했습니다.');
  }
};