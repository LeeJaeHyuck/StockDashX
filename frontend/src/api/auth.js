import api from './axios';

/**
 * 로그인 API 호출
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} - 응답 데이터 (액세스 토큰)
 */
export const login = async (username, password) => {
  // OAuth2 형식에 맞게 폼 데이터 생성
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
    // 에러 처리 및 예외 발생
    throw new Error(error.response?.data?.detail || '로그인 중 오류가 발생했습니다.');
  }
};

/**
 * 회원가입 API 호출
 * @param {string} email - 이메일
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} - 응답 데이터 (생성된 사용자 정보)
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
    // 에러 처리 및 예외 발생
    throw new Error(error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.');
  }
};