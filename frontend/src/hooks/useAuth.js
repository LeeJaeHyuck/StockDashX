import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * 인증 상태 및 기능을 사용하기 위한 커스텀 훅
 * 
 * AuthContext를 쉽게 사용할 수 있도록 래핑합니다.
 * 컴포넌트에서 인증 상태, 로딩 상태, 에러 상태 및 인증 관련 함수에 쉽게 접근할 수 있습니다.
 * 
 * @returns {Object} - AuthContext의 값 (user, loading, error, login, register, logout)
 */
export const useAuth = () => {
  // AuthContext의 값 가져오기
  return useContext(AuthContext);
};