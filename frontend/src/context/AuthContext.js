import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

// 인증 관련 컨텍스트 생성
export const AuthContext = createContext();

/**
 * 인증 상태 관리 제공자 컴포넌트
 * 
 * 사용자 인증 상태를 관리하고 로그인, 회원가입, 로그아웃 기능을 제공합니다.
 * localStorage를 사용하여 브라우저 새로고침 후에도 로그인 상태를 유지합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export const AuthProvider = ({ children }) => {
  // 사용자 상태 (로그인한 사용자 정보 또는 null)
  const [user, setUser] = useState(null);
  // 로딩 상태 (API 요청 중인지 여부)
  const [loading, setLoading] = useState(true);
  // 에러 상태 (인증 요청 실패 시 에러 메시지)
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    // 로컬 스토리지에서 저장된 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * 로그인 함수
   * 
   * API를 호출하여 사용자 인증을 시도하고 성공 시 사용자 정보와 토큰을 저장합니다.
   * 
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @returns {Promise<boolean>} - 로그인 성공 여부
   */
  const login = async (username, password) => {
    try {
      setLoading(true);
      // API 호출하여 토큰 가져오기
      const data = await apiLogin(username, password);
      
      // 사용자 정보 객체 생성
      const userData = {
        username,
        token: data.access_token
      };
      
      // 상태 및 로컬 스토리지 업데이트
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
      return true;
    } catch (err) {
      // 에러 처리
      setError(err.message || '로그인에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 회원가입 함수
   * 
   * API를 호출하여 새 사용자를 등록합니다.
   * 
   * @param {string} email - 이메일
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @returns {Promise<boolean>} - 회원가입 성공 여부
   */
  const register = async (email, username, password) => {
    try {
      setLoading(true);
      // API 호출하여 사용자 등록
      await apiRegister(email, username, password);
      setError(null);
      return true;
    } catch (err) {
      // 에러 처리
      setError(err.message || '회원가입에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 로그아웃 함수
   * 
   * 사용자 상태를 초기화하고 로컬 스토리지에서 사용자 정보를 제거합니다.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 컨텍스트 값 제공
  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};