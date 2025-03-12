import api from './axios';

/**
 * 로그인 API 요청 함수
 * 
 * 사용자 이름과 비밀번호를 사용하여 서버에 로그인 요청을 보냅니다.
 * OAuth2 규격에 맞게 FormData 형태로 요청합니다.
 * 
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} - 응답 데이터 (액세스 토큰 포함)
 * @throws {Error} - 로그인 실패 시 에러
 */
export const login = async (username, password) => {
  // OAuth2 형식에 맞는 폼 데이터 생성
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    // POST 요청으로 로그인 시도
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    // 에러 처리 및 더 의미 있는 에러 메시지 제공
    throw new Error(error.response?.data?.detail || '로그인 중 오류가 발생했습니다.');
  }
};

/**
 * 회원가입 API 요청 함수
 * 
 * 이메일, 사용자 이름, 비밀번호를 사용하여 새 사용자 등록 요청을 보냅니다.
 * 
 * @param {string} email - 이메일
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} - 응답 데이터 (생성된 사용자 정보)
 * @throws {Error} - 회원가입 실패 시 에러
 */
export const register = async (email, username, password) => {
  try {
    // POST 요청으로 사용자 등록
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    // 에러 처리 및 더 의미 있는 에러 메시지 제공
    throw new Error(error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.');
  }
};