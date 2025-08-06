import React, { useState, useEffect } from 'react';
import '../styles/Produtos.css';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Simulação da API - substitua pela chamada real
  const buscarProdutos = async (page = 1, search = '', tipo = '', marca = '') => {
    setLoading(true);
    try {
      // Simulação da resposta da API
      const mockResponse = {
        count: 123,
        next: page < 5 ? `http://api.example.org/accounts/?page=${page + 1}` : null,
        previous: page > 1 ? `http://api.example.org/accounts/?page=${page - 1}` : null,
        results: Array.from({ length: 12 }, (_, index) => ({
          id: (page - 1) * 12 + index,
                     tipo: ['Paletó', 'Calça', 'Colete', 'Camisa', 'Gravata', 'Sapato'][Math.floor(Math.random() * 6)],
          id_produto: `PROD${String((page - 1) * 12 + index + 1).padStart(3, '0')}`,
          nome_produto: `Produto ${(page - 1) * 12 + index + 1}`,
          marca: ['Marca A', 'Marca B', 'Marca C', 'Marca D'][Math.floor(Math.random() * 4)],
          material: ['Algodão', 'Linho', 'Seda', 'Lã'][Math.floor(Math.random() * 4)],
          cor: ['Azul', 'Preto', 'Cinza', 'Marrom'][Math.floor(Math.random() * 4)],
          intensidade_cor: ['Clara', 'Média', 'Escura'][Math.floor(Math.random() * 3)],
          padronagem: ['Lisa', 'Listrada', 'Xadrez'][Math.floor(Math.random() * 3)],
          botoes: ['2 botões', '3 botões', '4 botões'][Math.floor(Math.random() * 3)],
          lapela: ['Lapela ponta', 'Lapela chanfrada', 'Sem lapela'][Math.floor(Math.random() * 3)],
          tamanho: (Math.random() * 0.5 + 0.5).toFixed(2),
          foto_base64: null,
          date_created: new Date().toISOString(),
          date_updated: new Date().toISOString()
        }))
      };

      // Simular filtro de busca
      let filteredResults = mockResponse.results;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredResults = mockResponse.results.filter(produto => 
          produto.nome_produto.toLowerCase().includes(searchLower) ||
          produto.id_produto.toLowerCase().includes(searchLower) ||
          produto.tipo.toLowerCase().includes(searchLower) ||
          produto.marca.toLowerCase().includes(searchLower) ||
          produto.material.toLowerCase().includes(searchLower) ||
          produto.cor.toLowerCase().includes(searchLower)
        );
      }

      // Simular filtro por tipo
      if (tipo) {
        const tipos = tipo.split(',').filter(t => t.trim());
        if (tipos.length > 0) {
          filteredResults = filteredResults.filter(produto => 
            tipos.includes(produto.tipo)
          );
        }
      }

      // Simular filtro por marca
      if (marca) {
        const marcas = marca.split(',').filter(m => m.trim());
        if (marcas.length > 0) {
          filteredResults = filteredResults.filter(produto => 
            marcas.includes(produto.marca)
          );
        }
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProdutos(filteredResults);
      setTotalPages(Math.ceil(filteredResults.length / 12));
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProdutos(currentPage, searchTerm, filtroTipo.join(','), filtroMarca.join(','));
  }, [currentPage, searchTerm, filtroTipo, filtroMarca]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };



  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar se é um arquivo Excel
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV válido.');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor, selecione um arquivo.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulação da chamada da API - substitua pela chamada real
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular sucesso
      console.log('Arquivo enviado:', selectedFile.name);
      
      // Fechar modal e recarregar produtos
      setShowImportModal(false);
      setSelectedFile(null);
      buscarProdutos(currentPage, searchTerm, filtroTipo, filtroMarca);
      
      // Mostrar mensagem de sucesso (você pode implementar um toast)
      alert('Produtos importados com sucesso!');
      
    } catch (err) {
      setUploadError('Erro ao importar produtos. Tente novamente.');
      console.error('Erro no upload:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  const ProdutoCard = ({ produto }) => {
    const getTipoColor = (tipo) => {
      switch (tipo.toLowerCase()) {
        case 'paletó':
          return 'badge-paleto';
        case 'calça':
          return 'badge-calca';
        case 'colete':
          return 'badge-colete';
        case 'camisa':
          return 'badge-camisa';
        case 'gravata':
          return 'badge-gravata';
        case 'sapato':
          return 'badge-sapato';
        default:
          return 'badge-primary';
      }
    };

    return (
      <div className="produto-card">
        <div className="produto-imagem">
          {produto.foto_base64 ? (
            <img 
              src={`data:image/jpeg;base64,${produto.foto_base64}`} 
              alt={produto.nome_produto}
              className="produto-img"
            />
          ) : (
            <div className="produto-placeholder">
              <i className="bi bi-image"></i>
            </div>
          )}

        </div>
        <div className="produto-info">
          <h6 className="produto-nome">{produto.nome_produto}</h6>
          <p className="produto-id">{produto.id_produto}</p>
          <div className="produto-detalhes">
            <span className={`badge ${getTipoColor(produto.tipo)}`}>{produto.tipo}</span>
            <span className="badge bg-secondary">{produto.marca}</span>
          </div>
          <div className="produto-caracteristicas">
            <small><strong>Material:</strong> {produto.material}</small>
            <small><strong>Cor:</strong> {produto.cor} ({produto.intensidade_cor})</small>
            <small><strong>Tamanho:</strong> {produto.tamanho}</small>
          </div>
        </div>
      </div>
    );
  };

  const Paginacao = () => {
    const pages = [];
    const maxPages = Math.min(5, totalPages);
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav aria-label="Paginação de produtos">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          
          {pages.map(page => (
            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const ImportModal = () => (
    <div className="import-modal">
      <div className="text-center mb-4">
        <i className="bi bi-file-earmark-excel display-4 text-success"></i>
        <h5 className="mt-3">Importar Produtos</h5>
        <p className="text-muted">Selecione um arquivo Excel (.xlsx, .xls) ou CSV para importar os produtos</p>
      </div>

      <div className="mb-4">
        <div className="upload-area">
          <input
            type="file"
            id="fileInput"
            className="file-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="upload-label">
            <div className="upload-content">
              <i className="bi bi-cloud-upload display-4 text-primary"></i>
              <p className="mt-3 mb-2">
                {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo'}
              </p>
              <small className="text-muted">
                {selectedFile ? `Tamanho: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Formatos aceitos: .xlsx, .xls, .csv'}
              </small>
            </div>
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {uploadError}
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        <button 
          className="btn btn-outline-secondary" 
          onClick={handleCloseModal}
          disabled={uploadLoading}
        >
          Cancelar
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={!selectedFile || uploadLoading}
        >
          {uploadLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Importando...
            </>
          ) : (
            <>
              <i className="bi bi-upload me-2"></i>
              Importar Produtos
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header nomeHeader="Produtos" />
      <div className="produtos">
        <div className="container-fluid">
          {/* Header da página */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--color-text-primary)' }}>Listagem de Produtos</h4>
                  <p className=" mb-0" style={{ color: 'var(--color-text-secondary)' }}>Gerencie todos os produtos do sistema</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowImportModal(true)}
                >
                  <i className="bi bi-upload me-2"></i>
                  Importar Produtos
                </button>
              </div>
            </div>
          </div>

          {/* Filtros e busca */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="filters-container">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <i className="bi bi-search search-icon"></i>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                
                <div className="filters-row">
                  <div className="filter-item">
                                         <CustomSelect
                       options={[
                         { value: 'Paletó', label: 'Paletó' },
                         { value: 'Calça', label: 'Calça' },
                         { value: 'Colete', label: 'Colete' },
                         { value: 'Camisa', label: 'Camisa' },
                         { value: 'Gravata', label: 'Gravata' },
                         { value: 'Sapato', label: 'Sapato' }
                       ]}
                       value={filtroTipo}
                       onChange={setFiltroTipo}
                       placeholder="Selecione os tipos"
                       isMulti={true}
                     />
                  </div>
                  
                  <div className="filter-item">
                    <CustomSelect
                      options={[
                        { value: 'Marca A', label: 'Marca A' },
                        { value: 'Marca B', label: 'Marca B' },
                        { value: 'Marca C', label: 'Marca C' },
                        { value: 'Marca D', label: 'Marca D' }
                      ]}
                      value={filtroMarca}
                      onChange={setFiltroMarca}
                      placeholder="Selecione as marcas"
                      isMulti={true}
                    />
                  </div>
                  
                  
                </div>
              </div>
            </div>
          </div>

          {/* Listagem de produtos */}
          <div className="row">
            <div className="col-12">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-3">Carregando produtos...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button 
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={() => buscarProdutos(currentPage, searchTerm, filtroTipo, filtroMarca)}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : produtos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-box display-1 text-muted"></i>
                  <h5 className="mt-3">Nenhum produto encontrado</h5>
                  <p className="text-muted">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                <>
                  <div className="row g-4">
                    {produtos.map(produto => (
                      <div key={produto.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                        <ProdutoCard produto={produto} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <Paginacao />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Importação */}
      <Modal
        show={showImportModal}
        onClose={handleCloseModal}
        onCloseX={handleCloseModal}
        title="Importar Produtos"
        bodyContent={<ImportModal />}
      />
    </>
  );
};

export default Produtos; 