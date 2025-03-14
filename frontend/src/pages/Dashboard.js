import React from 'react';
import { Link } from 'react-router-dom';
import FeaturedNews from '../components/news/FeaturedNews';

const Dashboard = () => {
  // 실제 구현에서는 API에서 데이터 가져오기
  const stockData = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 173.45, change: 2.45 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 324.78, change: -1.23 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 134.56, change: 0.87 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 167.89, change: 3.21 },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">시장 개요</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>S&P 500</span>
              <span className="text-green-600">+0.75%</span>
            </div>
            <div className="flex justify-between">
              <span>나스닥</span>
              <span className="text-green-600">+1.25%</span>
            </div>
            <div className="flex justify-between">
              <span>다우 존스</span>
              <span className="text-red-600">-0.25%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">포트폴리오 요약</h2>
          <div className="text-2xl font-bold">$24,856.78</div>
          <div className="text-sm text-green-600">+$345.67 (1.41%)</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">최근 거래</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>AAPL 매수</span>
              <span>10주</span>
            </div>
            <div className="flex justify-between">
              <span>MSFT 매도</span>
              <span>5주</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">주요 뉴스</h2>
          <div className="space-y-2 text-sm">
            <p>애플, 새로운 아이폰 발표</p>
            <p>테슬라, 분기별 실적 예상치 상회</p>
            <p>마이크로소프트, 클라우드 서비스 확장</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">인기 주식</h2>
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
              {stockData.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${stock.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/stocks/${stock.symbol}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      상세
                    </Link>
                    <button className="text-green-600 hover:text-green-900">매수</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
