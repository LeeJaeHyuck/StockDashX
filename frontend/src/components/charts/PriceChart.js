import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStockHistory } from '../../api/stocks';

/**
 * 주식 가격 차트 컴포넌트
 * 
 * 주식의 과거 가격 데이터를 차트로 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.symbol - 주식 심볼
 * @param {string} props.interval - 데이터 간격 ('daily', 'weekly', 'monthly')
 */
const PriceChart = ({ symbol, interval = 'daily' }) => {
  // 차트 데이터 상태
  const [chartData, setChartData] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);

  // 심볼이나 간격이 변경될 때 데이터 로드
  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // API를 통해 과거 데이터 가져오기
        const response = await getStockHistory(symbol, interval);
        
        // 차트에 사용할 데이터 가공
        const formattedData = response.data.map(item => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
        
        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, interval]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>차트 데이터 로딩 중...</p>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{symbol} 주가 차트</h2>
      
      {/* 간격 선택 옵션 */}
      <div className="mb-4 flex space-x-2">
        <button 
          className={`px-3 py-1 text-sm rounded ${interval === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => window.location.search = `?interval=daily`}
        >
          일별
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded ${interval === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => window.location.search = `?interval=weekly`}
        >
          주별
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded ${interval === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => window.location.search = `?interval=monthly`}
        >
          월별
        </button>
      </div>
      
      {/* 차트 영역 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, '']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="close" name="종가" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;