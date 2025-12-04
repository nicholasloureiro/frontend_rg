import React, { useState, useEffect } from 'react';
import '../styles/Produtos.css';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { productService } from '../services/productService';
import Swal from 'sweetalert2';
import Button from '../components/Button';
import paletoImg from '../assets/paleto.png';
import calcaImg from '../assets/calca.png';
import coleteImg from '../assets/colete.png';

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

  // Buscar produtos da API com paginação e filtros
  const buscarProdutos = async (page = 1, search = '', tipo = '', marca = '') => {
    setLoading(true);
    try {
      // Chamada para a API real usando o productService
      const response = await productService.buscarProdutos(page, search, tipo, marca);
      
      setProdutos(response.results);
      setTotalPages(Math.ceil(response.count / 12));
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
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };



  const handlePageChange = (page) => {
    setCurrentPage(page);
    // A mudança de página será capturada pelo useEffect que chama buscarProdutos automaticamente
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar se é um arquivo Excel ou CSV válido
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
      formData.append('excel_file', selectedFile);

      // Chamada real da API usando o service
      await productService.importarProdutos(formData);
      
      // Fechar modal e recarregar produtos
      setShowImportModal(false);
      setSelectedFile(null);
      
      // Recarregar lista de produtos após importação bem-sucedida
      await buscarProdutos(currentPage, searchTerm, filtroTipo.join(','), filtroMarca.join(','));
      
      // Mostrar mensagem de sucesso com SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Produtos importados com sucesso!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#28a745'
      });
      
    } catch (err) {
      setUploadError('Erro ao importar produtos. Tente novamente.');
      console.error('Erro no upload:', err);
      
      // Mostrar mensagem de erro com SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Erro ao importar produtos. Tente novamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setUploadError(null);
    // Limpa todos os estados relacionados ao modal de importação
  };

  const ProdutoCard = ({ produto }) => {
    // Função para determinar a cor do badge baseada no tipo do produto
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

    // Função para obter a imagem padrão baseada no tipo do produto
    const getDefaultImage = (tipo) => {
      switch (tipo.toLowerCase()) {
        case 'paletó':
          return paletoImg;
        case 'calça':
          return calcaImg;
        case 'colete':
          return coleteImg;
        default:
          return calcaImg; // Imagem padrão para outros tipos
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
            <img 
              src={getDefaultImage(produto.tipo)}
              alt={produto.nome_produto}
              className="produto-img"
            />
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
            {produto.padronagem && (
              <small><strong>Padronagem:</strong> {produto.padronagem}</small>
            )}
            {produto.botoes && (
              <small><strong>Botões:</strong> {produto.botoes}</small>
            )}
            {produto.lapela && (
              <small><strong>Lapela:</strong> {produto.lapela}</small>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Paginacao = () => {
    // Lógica para calcular as páginas a serem exibidas na paginação
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
      {/* Área de upload de arquivo */}
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

      {/* Botões de ação */}
      <div className="d-flex justify-content-end gap-2">
        <Button
          text="Cancelar"
          variant="disabled"
          onClick={handleCloseModal}
          disabled={uploadLoading}
        />
        {uploadLoading ? (
          <Button
            text={
              <span className="d-flex align-items-center">
                Importando...
              </span>
            }
            variant="primary"
            onClick={handleUpload}
            disabled={true}
          />
        ) : (
          <Button
            text="Importar Produtos"
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile}
            iconName="upload"
            iconPosition="left"
          />
        )}
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
                <Button
                  text="Importar Produtos"
                  variant="primary"
                  onClick={() => setShowImportModal(true)}
                  iconName="upload"
                  iconPosition="left"
                />
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
                  <div className="spinner-border" role="status" style={{ color: 'var(--color-accent)'}}>
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-3">Carregando produtos...</p>
                </div>
              ) : error ? (
                <div className="error-state-produtos">
                  <i className="bi bi-exclamation-triangle"></i>
                  <h3>Erro ao carregar produtos</h3>
                  <p>{error}</p>
                  <Button
                    text="Tentar novamente"
                    variant="primary"
                    iconName="arrow-clockwise"
                    iconPosition="left"
                    onClick={() => buscarProdutos(currentPage, searchTerm, filtroTipo.join(','), filtroMarca.join(','))}
                    style={{ width: 'fit-content' }}
                  />
                </div>
              ) : produtos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-box display-1" style={{ color: 'var(--color-accent)'}}></i>
                  <h5 className="mt-3">Nenhum produto encontrado</h5>
                  <p className="empty-state-text">Tente ajustar os filtros de busca</p>
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