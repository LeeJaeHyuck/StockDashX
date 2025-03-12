import api from './axios';

/**
 * 포트폴리오 목록 조회 API 요청 함수
 * 
 * 사용자의 모든 포트폴리오 목록을 가져옵니다.
 * 
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 최대 항목 수
 * @returns {Promise<Array>} - 포트폴리오 목록
 * @throws {Error} - 조회 실패 시 에러
 */
export const getPortfolios = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get('/portfolios', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '포트폴리오 목록 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 포트폴리오 상세 정보 조회 API 요청 함수
 * 
 * 특정 포트폴리오의 상세 정보를 가져옵니다.
 * 
 * @param {number} portfolioId - 포트폴리오 ID
 * @returns {Promise<Object>} - 포트폴리오 상세 정보
 * @throws {Error} - 조회 실패 시 에러
 */
export const getPortfolioDetail = async (portfolioId) => {
  try {
    const response = await api.get(`/portfolios/${portfolioId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '포트폴리오 상세 정보 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 포트폴리오 생성 API 요청 함수
 * 
 * 새 포트폴리오를 생성합니다.
 * 
 * @param {Object} portfolio - 생성할 포트폴리오 정보
 * @param {string} portfolio.name - 포트폴리오 이름
 * @param {string} portfolio.description - 포트폴리오 설명
 * @returns {Promise<Object>} - 생성된 포트폴리오 정보
 * @throws {Error} - 생성 실패 시 에러
 */
export const createPortfolio = async (portfolio) => {
  try {
    const response = await api.post('/portfolios', portfolio);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '포트폴리오 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 포트폴리오 업데이트 API 요청 함수
 * 
 * 특정 포트폴리오의 정보를 업데이트합니다.
 * 
 * @param {number} portfolioId - 포트폴리오 ID
 * @param {Object} portfolio - 업데이트할 포트폴리오 정보
 * @param {string} portfolio.name - 포트폴리오 이름
 * @param {string} portfolio.description - 포트폴리오 설명
 * @returns {Promise<Object>} - 업데이트된 포트폴리오 정보
 * @throws {Error} - 업데이트 실패 시 에러
 */
export const updatePortfolio = async (portfolioId, portfolio) => {
    try {
      const response = await api.put(`/portfolios/${portfolioId}`, portfolio);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || '포트폴리오 업데이트 중 오류가 발생했습니다.');
    }
  };
  
  /**
   * 포트폴리오 삭제 API 요청 함수
   * 
   * 특정 포트폴리오를 삭제합니다.
   * 
   * @param {number} portfolioId - 삭제할 포트폴리오 ID
   * @returns {Promise<void>} - 삭제 성공 시 아무 것도 반환하지 않음
   * @throws {Error} - 삭제 실패 시 에러
   */
  export const deletePortfolio = async (portfolioId) => {
    try {
      await api.delete(`/portfolios/${portfolioId}`);
    } catch (error) {
      throw new Error(error.response?.data?.detail || '포트폴리오 삭제 중 오류가 발생했습니다.');
    }
  };