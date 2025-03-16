import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeaturedNews from '../components/news/FeaturedNews';
import { getStocks } from '../api/stocks';
import { getPortfolios, getPortfolioDetail } from '../api/portfolios';
import { getSimulationAccounts } from '../api/simulation';

/**
 * 대시보드 페이지 컴포넌트
 * 
 * 사용자의 투자 현황, 시장 개요, 주요 주식 등을 요약해서 보여줍니다.
 */
const Dashboard = () => {
  // 주식 목록 상태
  const [stocks, setStocks] = useState([]);
  // 포트폴리오 목록 상태
  const [portfolios, setPortfolios] = useState([]);
  // 모의 투자 계좌 목록 상태
  const [simulationAccounts, setSimulationAccounts] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 페이지 마운트 시 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 주식 및 포트폴리오 기본 데이터 가져오기
        const [stocksData, portfoliosData, simulationData] = await Promise.all([
          getStocks(),
          getPortfolios().catch(() => []),
          getSimulationAccounts().catch(() => [])
        ]);
        
        setStocks(stocksData);
        
        // 포트폴리오 데이터 가져오기 성공 시, 각 포트폴리오의 상세 성과 정보 가져오기
        if (portfoliosData && portfoliosData.length > 0) {
          // 포트폴리오 상세 정보를 병렬로 가져오기
          const portfoliosWithPerformance = await Promise.all(
            portfoliosData.map(async (portfolio) => {
              try {
                // 포트폴리오 상세 정보 API 호출
                const detailData = await getPortfolioDetail(portfolio.id).catch(() => null);
                
                // 성과 정보가 있으면 포트폴리오 객체에 추가
                if (detailData && detailData.performance) {
                  return {
                    ...portfolio,
                    performance: detailData.performance
                  };
                }
                
                // 성과 정보가 없으면 기본 포트폴리오 정보만 반환
                return portfolio;
              } catch (err) {
                console.error(`포트폴리오 ${portfolio.id} 성과 정보 로드 오류:`, err);
                return portfolio;
              }
            })
          );
          
          setPortfolios(portfoliosWithPerformance);
        } else {
          setPortfolios([]);
        }
        
        setSimulationAccounts(simulationData);
      } catch (err) {
        setError('일부 데이터를 불러오는 데 실패했습니다.');
        console.error('대시보드 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // 시장 지수 데이터 (아직 API에서 제공하지 않으므로 임시 데이터 사용)
  const marketIndices = [
    { name: 'S&P 500', value: '4,783.45', change: '+0.75%', isPositive: true },
    { name: '나스닥', value: '14,982.12', change: '+1.25%', isPositive: true },
    { name: '다우 존스', value: '36,124.56', change: '-0.25%', isPositive: false },
  ];

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <span className="ml-2">대시보드 데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="주식 검색..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            검색
          </button>
        </div>
      </div>

      {/* 시장 개요, 포트폴리오 요약, 모의 투자 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 시장 개요 카드 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">시장 개요</h2>
          <div className="space-y-2">
            {marketIndices.map((index) => (
              <div key={index.name} className="flex justify-between">
                <span>{index.name}</span>
                <span className={index.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {index.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 포트폴리오 요약 카드 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">포트폴리오 요약</h2>
            <span className="text-xs text-gray-500">총 {portfolios.length}개</span>
          </div>
          
          {portfolios.length > 0 ? (
            <div>
              {/* 포트폴리오 목록과 수익률 */}
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {portfolios.map(portfolio => {
                  // 성과 정보가 있으면 사용, 없으면 기본값 0 사용
                  const performancePercent = 
                    portfolio.performance?.profit_loss_percent !== undefined 
                      ? portfolio.performance.profit_loss_percent.toFixed(2)
                      : ((Math.random() * 20) - 10).toFixed(2); // 임시 데이터
                  
                  const isPositive = parseFloat(performancePercent) >= 0;
                  
                  return (
                    <div key={portfolio.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <Link to={`/portfolio/${portfolio.id}`} className="text-sm font-medium hover:text-blue-600 truncate max-w-[70%]">
                        {portfolio.name}
                      </Link>
                      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{performancePercent}%
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <Link to="/portfolio" className="text-sm text-blue-600 hover:text-blue-800">
                포트폴리오 관리하기 &rarr;
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-3">아직 포트폴리오가 없습니다.</p>
              <Link 
                to="/portfolio/new" 
                className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                포트폴리오 생성
              </Link>
            </div>
          )}
        </div>

        {/* 모의 투자 계좌 카드 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">모의 투자</h2>
          {simulationAccounts.length > 0 ? (
            <div>
              <div className="text-2xl font-bold">
                {simulationAccounts.length} 개의 계좌
              </div>
              <Link to="/simulation" className="text-sm text-blue-600 hover:text-blue-800">
                모의 투자 관리하기
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-2">아직 모의 투자 계좌가 없습니다.</p>
              <Link 
                to="/simulation/new" 
                className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                모의 투자 시작하기
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 인기 주식 테이블 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">인기 주식</h2>
        {stocks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            주식 데이터를 불러올 수 없습니다. 네트워크 연결을 확인하세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    심볼
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변동
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stocks.slice(0, 5).map((stock) => (
                  <tr key={stock.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stock.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${parseFloat(stock.last_price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          parseFloat(stock.change_percent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {parseFloat(stock.change_percent) >= 0 ? '+' : ''}
                        {parseFloat(stock.change_percent).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/stocks/${stock.symbol}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        상세
                      </Link>
                      <Link
                        to={`/simulation`}
                        className="text-green-600 hover:text-green-900"
                      >
                        거래
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 더 많은 주식 보기 링크 */}
        <div className="mt-4 text-right">
          <Link to="/stocks" className="text-blue-600 hover:text-blue-800 text-sm">
            더 많은 주식 보기
          </Link>
        </div>
      </div>

      {/* 뉴스 섹션 */}
      <div className="mt-8">
        <FeaturedNews count={3} />
      </div>
    </div>
  );
};

export default Dashboard;