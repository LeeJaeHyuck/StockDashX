import axios from 'axios';

// .env 파일에서 API 기본 URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Axios 인스턴스 생성 (기본 설정 적용)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 모든 API 요청에 JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 토큰이 있으면 요청 헤더에 추가
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