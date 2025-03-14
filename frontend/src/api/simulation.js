import api from './axios';

/**
 * 모의 투자 계좌 목록 조회 API 요청 함수
 * 
 * 사용자의 모든 모의 투자 계좌 목록을 가져옵니다.
 * 
 * @returns {Promise<Array>} - 모의 투자 계좌 목록
 * @throws {Error} - 조회 실패 시 에러
 */
export const getSimulationAccounts = async () => {
  try {
    const response = await api.get('/simulation/accounts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '모의 투자 계좌 목록 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 모의 투자 계좌 상세 정보 조회 API 요청 함수
 * 
 * 특정 모의 투자 계좌의 상세 정보와 보유 주식을 가져옵니다.
 * 
 * @param {number} accountId - 모의 투자 계좌 ID
 * @returns {Promise<Object>} - 모의 투자 계좌 상세 정보
 * @throws {Error} - 조회 실패 시 에러
 */
export const getSimulationAccountDetail = async (accountId) => {
  try {
    const response = await api.get(`/simulation/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '모의 투자 계좌 상세 정보 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 모의 투자 계좌 생성 API 요청 함수
 * 
 * 새 모의 투자 계좌를 생성합니다.
 * 
 * @param {Object} account - 생성할 모의 투자 계좌 정보
 * @param {string} account.name - 모의 투자 계좌 이름
 * @param {number} [account.initial_balance] - 초기 잔액 (기본값: 100,000)
 * @returns {Promise<Object>} - 생성된 모의 투자 계좌 정보
 * @throws {Error} - 생성 실패 시 에러
 */
export const createSimulationAccount = async (account) => {
  try {
    const response = await api.post('/simulation/accounts', account);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '모의 투자 계좌 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 모의 투자 계좌 삭제 API 요청 함수
 * 
 * 특정 모의 투자 계좌를 삭제합니다.
 * 
 * @param {number} accountId - 삭제할 모의 투자 계좌 ID
 * @returns {Promise<void>} - 삭제 성공 시 아무 것도 반환하지 않음
 * @throws {Error} - 삭제 실패 시 에러
 */
export const deleteSimulationAccount = async (accountId) => {
    try {
      await api.delete(`/simulation/accounts/${accountId}`);
    } catch (error) {
      throw new Error(error.response?.data?.detail || '모의 투자 계좌 삭제 중 오류가 발생했습니다.');
    }
  };
  
  /**
   * 모의 투자 거래 내역 생성 API 요청 함수
   * 
   * 새 모의 투자 거래 내역을 생성합니다.
   * 
   * @param {Object} transaction - 생성할 모의 투자 거래 내역 정보
   * @param {number} transaction.account_id - 모의 투자 계좌 ID
   * @param {string} transaction.symbol - 주식 심볼
   * @param {string} transaction.transaction_type - 거래 유형 ("BUY" 또는 "SELL")
   * @param {number} transaction.quantity - 거래 수량
   * @param {number} transaction.price - 거래 가격
   * @returns {Promise<Object>} - 생성된 모의 투자 거래 내역 정보
   * @throws {Error} - 생성 실패 시 에러
   */
  export const createSimulationTransaction = async (transaction) => {
    try {
      const response = await api.post('/simulation/transactions', transaction);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || '모의 투자 거래 내역 생성 중 오류가 발생했습니다.');
    }
  };
  
  /**
   * 모의 투자 계좌의 거래 내역 목록 조회 API 요청 함수
   * 
   * 특정 모의 투자 계좌의 모든 거래 내역을 가져옵니다.
   * 
   * @param {number} accountId - 모의 투자 계좌 ID
   * @returns {Promise<Array>} - 거래 내역 목록
   * @throws {Error} - 조회 실패 시 에러
   */
  export const getSimulationAccountTransactions = async (accountId) => {
    try {
      const response = await api.get(`/simulation/accounts/${accountId}/transactions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || '거래 내역 조회 중 오류가 발생했습니다.');
    }
  };