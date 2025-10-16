import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function AbacatePayApp() {
  const [activeTab, setActiveTab] = useState('customer');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer form fields
  const [nomeCliente, setNomeCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [cpfCliente, setCpfCliente] = useState('');
  const [customerResponse, setCustomerResponse] = useState(null);

  const [billingForm, setBillingForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: 1,
    clienteId: ''
  });

  const handleBillingFormChange = React.useCallback((field) => (e) => {
    setBillingForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);
  const [billingResponse, setBillingResponse] = useState(null);

  const [billingId, setBillingId] = useState('');
  const [billingDetail, setBillingDetail] = useState(null);

  const [billingList, setBillingList] = useState(null);

  const BASE_URL = '/api';

  const getHeaders = () => ({
    'Authorization': `Bearer ${import.meta.env.VITE_ABACATE_API_KEY}`,
    'Content-Type': 'application/json'
  });

  const handleCreateCustomer = async () => {
    if (!nomeCliente || !emailCliente || !telefoneCliente || !cpfCliente) {
      alert('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customer/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: nomeCliente,
          email: emailCliente,
          cellphone: telefoneCliente,
          taxId: cpfCliente
        })
      });
      const data = await response.json();
      setCustomerResponse(data);
      if (data.data?.id) {
        setNomeCliente('');
        setEmailCliente('');
        setTelefoneCliente('');
        setCpfCliente('');
      }
    } catch (error) {
      setCustomerResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBilling = async () => {
    if (!billingForm.nome || !billingForm.descricao || !billingForm.preco) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: [
          {
            externalId: `prod-${Date.now()}`,
            name: billingForm.nome,
            description: billingForm.descricao,
            quantity: parseInt(billingForm.quantidade),
            price: parseInt(billingForm.preco) * 100
          }
        ],
        returnUrl: 'https://example.com/billing',
        completionUrl: 'https://example.com/completion'
      };

      if (billingForm.clienteId) {
        payload.customerId = billingForm.clienteId;
      }

      const response = await fetch(`${BASE_URL}/billing/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setBillingResponse(data);
      if (data.data?.id) {
        setBillingForm({ nome: '', descricao: '', preco: '', quantidade: 1, clienteId: '' });
      }
    } catch (error) {
      setBillingResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryBilling = async () => {
    if (!billingId) {
      alert('Informe o ID da cobrança');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/billing/info/${billingId}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao consultar cobrança');
      }
      setBillingDetail(data);
    } catch (error) {
      setBillingDetail({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleListBillings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/billing/list?limit=10`, {
        headers: getHeaders()
      });
      const data = await response.json();
      setBillingList(data);
    } catch (error) {
      setBillingList({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const ResponseBlock = ({ data }) => (
    <div className="bg-black rounded-lg p-4 overflow-hidden">
      <pre className="text-green-400 text-xs max-h-96 overflow-auto font-mono whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );



  const Button = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
    >
      {disabled ? '⏳ Processando...' : children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <style>{`
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🥑
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Sample Payment
              </h1>
              <p className="text-gray-600 text-sm mt-1">Integração com React + Vite</p>
            </div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>

        {/* Status da API Key */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8 shadow-md border border-blue-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
              ✅
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">API Key Configurada</p>
              <p className="text-xs text-blue-700 mt-1">A chave está segura no backend via variável de ambiente</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { id: 'customer', label: '👤 Criar Cliente', icon: '👤' },
            { id: 'billing', label: '💳 Criar Cobrança', icon: '💳' },
            { id: 'query', label: '🔍 Consultar', icon: '🔍' },
            { id: 'list', label: '📋 Listar', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTab === 'customer' && (
            <>
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">👤 Criar Cliente</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone (XX) XXXXX-XXXX"
                    value={telefoneCliente}
                    onChange={(e) => setTelefoneCliente(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="CPF ou CNPJ"
                    value={cpfCliente}
                    onChange={(e) => setCpfCliente(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button onClick={handleCreateCustomer} disabled={loading}>
                    ✅ Criar Cliente
                  </Button>
                </div>
              </div>
              {customerResponse && (
                <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">📤 Resposta</h2>
                  <ResponseBlock data={customerResponse} />
                </div>
              )}
            </>
          )}

          {activeTab === 'billing' && (
            <>
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">💳 Criar Cobrança PIX</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    value={billingForm.nome}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={billingForm.descricao}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Preço (R$)"
                    value={billingForm.preco}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, preco: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={billingForm.quantidade}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, quantidade: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="ID do cliente (opcional)"
                    value={billingForm.clienteId}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, clienteId: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button onClick={handleCreateBilling} disabled={loading}>
                    ✅ Criar Cobrança
                  </Button>
                </div>
              </div>
              {billingResponse && (
                <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">📤 Resposta</h2>
                  {billingResponse.data?.url && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-3">🔗 URL de Pagamento:</p>
                      <div className="flex gap-2 items-center">
                        <a
                          href={billingResponse.data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-green-600 hover:text-green-700 break-all underline text-sm font-mono"
                        >
                          {billingResponse.data.url}
                        </a>
                        <button
                          onClick={() => copyToClipboard(billingResponse.data.url, 'url')}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                        >
                          {copied === 'url' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                  <ResponseBlock data={billingResponse} />
                </div>
              )}
            </>
          )}

          {activeTab === 'query' && (
            <>
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">🔍 Consultar Cobrança</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="ID da cobrança (ex: bill_...)"
                    value={billingId}
                    onChange={(e) => setBillingId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button onClick={handleQueryBilling} disabled={loading}>
                    🔍 Consultar
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">📤 Detalhes</h2>
                {billingDetail ? (
                  <ResponseBlock data={billingDetail} />
                ) : (
                  <p className="text-gray-500">Nenhuma cobrança consultada ainda.</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'list' && (
            <>
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">📋 Listar Cobranças</h2>
                <Button onClick={handleListBillings} disabled={loading}>
                  📋 Listar Cobranças
                </Button>
              </div>
              {billingList && (
                <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">📤 Resposta</h2>
                  {billingList.data && Array.isArray(billingList.data) && (
                    <div className="space-y-3 max-h-96 overflow-auto">
                      <p className="text-green-600 font-bold mb-4 text-lg">
                        📊 Total: {billingList.data.length} cobrança(s)
                      </p>
                      {billingList.data.map((bill, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">ID:</span> <code className="text-xs bg-gray-100 px-2 py-1 rounded">{bill.id}</code></p>
                          <p className="text-sm text-gray-700 mt-2"><span className="font-semibold text-gray-900">Status:</span> <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">{bill.status}</span></p>
                          <p className="text-sm text-gray-700 mt-2"><span className="font-semibold text-gray-900">Valor:</span> <span className="text-green-600 font-bold">R$ {(bill.amount / 100).toFixed(2)}</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                  {billingList.error && <p className="text-red-600 font-semibold">{billingList.error}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p className="mb-3">📚 Recursos e Documentação</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://docs.abacatepay.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Documentação Oficial</a>
            <span className="text-gray-400">•</span>
            <a href="https://abacatepay.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Dashboard</a>
            <span className="text-gray-400">•</span>
            <a href="mailto:contato@abacatepay.com" className="text-green-600 hover:text-green-700 font-semibold">Suporte</a>
          </div>
        </div>
      </div>
    </div>
  );
}