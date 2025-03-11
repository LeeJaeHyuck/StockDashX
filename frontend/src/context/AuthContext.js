import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

// 인증 관련 컨텍스트 생성
export const AuthContext = createContext();

// 인증 상태 관리 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  // 사용자 상태
  const [user, setUser] = useState(null);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * 로그인 함수
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @returns {boolean} - 로그인 성공 여부
   */
  const login = async (username, password) => {
    try {
      setLoading(true);
      // API 호출하여 토큰 가져오기
      const data = await apiLogin(username, password);
      
      // 사용자 정보 생성
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
   * @param {string} email - 이메일
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @returns {boolean} - 회원가입 성공 여부
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
   * 로그아웃 함수 - 사용자 상태 및 로컬 스토리지 정보 삭제
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