import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPortfolioDetail } from '../../api/portfolios';
import { getPortfolioTransactions } from '../../api/transactions';

/**
 * 포트폴리오 상세 정보 컴포넌트
 * 
 * 특정 포트폴리오의 상세 정보, 성과, 보유 주식을 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {number} props.portfolioId - 포트폴리오 ID
 */
const PortfolioDetail = () => {
  // useParams로 URL에서 portfolioId 추출
  const { portfolioId } = useParams();
  // 포트폴리오 정보 상태
  const [portfolio, setPortfolio] = useState(null);
  // 거래 내역 상태
  const [transactions, setTransactions] = useState([]);
  // 선택된 탭 상태
  const [activeTab, setActiveTab] = useState('holdings');
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState(null);
  // 네비게이션 훅
  const navigate = useNavigate();

  // 컴포넌트 마운트 또는 포트폴리오 ID 변경 시 데이터 로드
  useEffect(() => {
    if (!portfolioId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 포트폴리오 상세 정보 조회
        const portfolioData = await getPortfolioDetail(portfolioId);
        setPortfolio(portfolioData);
        
        // 거래 내역 조회
        const transactionsData = await getPortfolioTransactions(portfolioId);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [portfolioId]);

  // 로딩 중 표시
  if (loading) {
    return <div className="text-center p-4">포트폴리오 정보를 불러오는 중...</div>;
  }

  // 에러 표시
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  // 포트폴리오가 없을 때
  if (!portfolio) {
    return <div className="text-center p-4">포트폴리오를 찾을 수 없습니다.</div>;
  }

  // 성과 데이터
  const { performance } = portfolio;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-gray-600 mt-1">{portfolio.description}</p>
          )}
        </div>
        
        {/* 작업 버튼 */}
        <div className="flex space-x-2">
          <Link
            to={`/portfolio/${portfolioId}/edit`}
            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            수정
          </Link>
          <Link
            to={`/portfolio/${portfolioId}/transaction/new`}
            state={{ portfolioId }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            거래 추가
          </Link>
        </div>
      </div>

      {/* 포트폴리오 요약 정보 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">총 투자</p>
            <p className="text-xl font-bold">${performance.total_investment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">현재 가치</p>
            <p className="text-xl font-bold">${performance.current_value.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">손익</p>
            <p className={`text-xl font-bold ${performance.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performance.profit_loss >= 0 ? '+' : ''}${performance.profit_loss.toFixed(2)} 
              ({performance.profit_loss_percent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'holdings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('holdings')}
          >
            보유 주식
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            거래 내역
          </button>
        </nav>
      </div>

      {/* 보유 주식 탭 */}
      {activeTab === 'holdings' && (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          {performance.holdings.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              보유 중인 주식이 없습니다. 거래를 추가해 보세요.
            </p>
          ) : (
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
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 단가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 가치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    손익
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performance.holdings.map((holding) => (
                  <tr key={holding.symbol}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/stocks/${holding.symbol}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {holding.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{holding.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{holding.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${holding.avg_price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${holding.current_price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${holding.current_value.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${holding.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.profit_loss >= 0 ? '+' : ''}${holding.profit_loss.toFixed(2)} 
                        ({holding.profit_loss_percent.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 거래 내역 탭 */}
      {activeTab === 'transactions' && (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              거래 내역이 없습니다. 거래를 추가해 보세요.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    심볼
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.transaction_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.transaction_type === 'BUY' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transaction_type === 'BUY' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* 여기서는 주식 심볼만 표시됩니다. 실제로는 Transaction 모델에서 stock 관계를 통해 심볼을 가져와야 합니다. */}
                        <span className="text-blue-600">
                          {/* 가정된 코드 - 실제로는 transaction.stock.symbol을 사용해야 합니다 */}
                          {transaction.stock_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${transaction.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${(transaction.quantity * transaction.price).toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;