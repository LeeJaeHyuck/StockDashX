import axios from 'axios';

// .env 파일에서 API 기본 URL 가져오기 (환경 변수)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

/**
 * 기본 설정이 적용된 axios 인스턴스 생성
 * 
 * 모든 API 요청에 공통 설정을 적용합니다:
 * - 기본 URL
 * - 공통 헤더
 * - 인증 토큰 자동 추가
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 - 모든 요청에 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 토큰이 있으면 Authorization 헤더에 추가
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

export default api;