import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mascaraCPF, mascaraTelefone, removerMascara, formatarTelefoneParaExibicao } from '../utils/Mascaras';
import { capitalizeText } from '../utils/capitalizeText';
import PhoneInput from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt-BR';
import Swal from 'sweetalert2';
import '../styles/Clientes.css';
import Header from '../components/Header';
import Button from '../components/Button';
import { clientService } from '../services/clientService';

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    cidade: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(true);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carregar dados da API
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setIsLoadingClientes(true);
    setError(null);
    try {
      const data = await clientService.listarTodos();
      // Garante que clientes sempre será um array
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Não foi possível carregar a lista de clientes. Tente novamente.');
    
    } finally {
      setIsLoadingClientes(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras conforme o campo
    if (name === 'cpf') {
      formattedValue = mascaraCPF(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      telefone: value,
    }));
  };

  // Função para formatar CEP
  const formatCep = (value) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para lidar com mudança no CEP
  const handleCepChange = async (e) => {
    const formattedCep = formatCep(e.target.value);
    setFormData(prev => ({
      ...prev,
      cep: formattedCep
    }));

    // Busca automática quando o CEP tem 8 dígitos
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            cep: formatCep(cep),
            complemento: '' // Limpar complemento ao buscar novo CEP
          }));
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'CEP não encontrado',
            text: 'O CEP informado não foi encontrado. Verifique e tente novamente.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro ao buscar CEP',
          text: 'Não foi possível buscar o endereço. Tente novamente.',
          timer: 3000,
          showConfirmButton: false
        });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    const requiredFields = editingId
      ? ['nome', 'telefone', 'email'] // Durante edição, CPF não é obrigatório
      : ['nome', 'cpf', 'telefone', 'email']; // Durante cadastro, todos são obrigatórios

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingId) {
        // Editar cliente existente
        // Remover máscaras do CPF e telefone
        const cpfSemMascara = removerMascara(formData.cpf);

        const updateData = {
          nome: formData.nome,
          cpf: cpfSemMascara,
          email: formData.email,
          telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : '',
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          complemento: formData.complemento,
          cidade: formData.cidade
        };
        await clientService.atualizar(editingId, updateData);
        setEditingId(null);

        Swal.fire({
          icon: 'success',
          title: 'Cliente atualizado!',
          text: 'Os dados do cliente foram atualizados com sucesso.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Adicionar novo cliente
        // Remover máscaras do CPF e telefone
        const cpfSemMascara = removerMascara(formData.cpf);

        const createData = {
          nome: formData.nome,
          cpf: cpfSemMascara,
          email: formData.email,
          telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : '',
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          complemento: formData.complemento,
          cidade: formData.cidade
        };
        await clientService.criar(createData);

        Swal.fire({
          icon: 'success',
          title: 'Cliente cadastrado!',
          text: 'O cliente foi cadastrado com sucesso.',
          timer: 2000,
          showConfirmButton: false
        });
      }

      // Recarregar lista de clientes
      setIsLoadingClientes(true);
      await loadClientes();

      // Limpar formulário
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        complemento: '',
        cidade: ''
      });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar cliente',
        text: error.message || 'Ocorreu um erro ao salvar o cliente.',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    window.scrollTo(0, 0);
    // Mapear os dados do cliente para o formato do formulário
    const clienteData = {
      nome: cliente.name || '',
      cpf: cliente.cpf || '',
      telefone: cliente.phone ? (cliente.phone.startsWith('+') ? cliente.phone : `+55${cliente.phone.substring(2)}`) : '', // Remover 55 do início e adicionar +55
      email: cliente.email || '',
      cep: cliente.address?.cep || '',
      rua: cliente.address?.street ? capitalizeText(cliente.address.street) : '',
      numero: cliente.address?.number || '',
      bairro: cliente.address?.neighborhood ? capitalizeText(cliente.address.neighborhood) : '',
      complemento: cliente.address?.complemento ? capitalizeText(cliente.address.complemento) : '',
      cidade: cliente.address?.city ? capitalizeText(cliente.address.city) : ''
    };
    setFormData(clienteData);
    setEditingId(cliente.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      complemento: '',
      cidade: ''
    });
  };

  const handleShowHistory = (cliente) => {
    navigate(`/cliente/${cliente.id}/historico`);
  };

  // Função para formatar o endereço
  const formatAddress = (address) => {
    if (!address) return '-';
    
    const parts = [];
    if (address.street) parts.push(capitalizeText(address.street));
    if (address.number) parts.push(address.number);
    if (address.complemento) parts.push(capitalizeText(address.complemento));
    if (address.neighborhood) parts.push(capitalizeText(address.neighborhood));
    if (address.city) parts.push(capitalizeText(address.city));
    if (address.cep) parts.push(address.cep);
    
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = cliente.name && cliente.name.toLowerCase().includes(searchLower);
    const emailMatch = cliente.email && cliente.email.toLowerCase().includes(searchLower);
    const cpfMatch = cliente.cpf && cliente.cpf.toLowerCase().includes(searchLower);
    const phoneMatch = cliente.phone && cliente.phone.toLowerCase().includes(searchLower);
    
    // Busca no endereço
    let addressMatch = false;
    if (cliente.address) {
      const addressString = `${cliente.address.street || ''} ${cliente.address.number || ''} ${cliente.address.complemento || ''} ${cliente.address.neighborhood || ''} ${cliente.address.city || ''} ${cliente.address.cep || ''}`.toLowerCase();
      addressMatch = addressString.includes(searchLower);
    }
    
    return nameMatch || emailMatch || cpfMatch || phoneMatch || addressMatch;
  });

  return (
    <>
      <Header nomeHeader={'Clientes'} />
      <div className="clientes-container">

        {/* Formulário de Cadastro */}
        <div className="form-section mb-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="form-header">
            <h2 style={{ fontSize: '18px' }}>{editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner" style={{ color: 'var(--color-accent)'}}></div>
                <span>Salvando...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="cliente-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome ? capitalizeText(formData.nome) : ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                  style={{ height: '35px' }}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF *</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf ? mascaraCPF(removerMascara(formData.cpf)) : ''}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder="000.000.000-00"
                  style={{ height: '35px' }}
                  disabled={isLoading || editingId}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone *</label>
                <PhoneInput
                  international
                  defaultCountry="BR"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  labels={ptBR}
                  className="phone-input"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="email@exemplo.com"
                  style={{ height: '35px' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cep">CEP *</label>
                <div className="cep-input-container">
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formData.cep || ''}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    style={{ height: '35px', width: '100%' }}
                    disabled={isLoading}
                  />
                  {isLoadingCep && (
                    <div className="cep-loading">
                      <div className="spinner" style={{ color: 'var(--color-accent)'}}></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="rua">Logradouro *</label>
                <input
                  type="text"
                  id="rua"
                  name="rua"
                  value={formData.rua || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rua: e.target.value
                  }))}
                  placeholder="Digite o logradouro"
                  style={{ height: '35px' }}
                  disabled={isLoading || isLoadingCep}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero">Número *</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    numero: e.target.value
                  }))}
                  placeholder="Número"
                  style={{ height: '35px' }}
                  disabled={isLoading || isLoadingCep}
                />
              </div>
              <div className="form-group">
                <label htmlFor="complemento">Complemento</label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    complemento: e.target.value
                  }))}
                  placeholder="Apartamento, casa, etc."
                  style={{ height: '35px' }}
                  disabled={isLoading || isLoadingCep}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bairro">Bairro *</label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bairro: e.target.value
                  }))}
                  placeholder="Digite o bairro"
                  style={{ height: '35px' }}
                  disabled={isLoading || isLoadingCep}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade *</label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cidade: e.target.value
                  }))}
                  placeholder="Digite a cidade"
                  style={{ height: '35px' }}
                  disabled={isLoading || isLoadingCep}
                />
              </div>
            </div>




            <div className="form-actions-clientes">
              {editingId && (
                <Button
                  text="Cancelar"
                  type="button"
                  variant="disabled"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  style={{ width: 'fit-content', marginLeft: 'auto' }}
                />
              )}
              <Button
                text={isLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                type="submit"
                variant="primary"
                disabled={isLoading}
                style={{ width: 'fit-content', marginLeft: editingId ? '10px' : 'auto' }}
              />
            </div>
          </form>
        </div>

        {/* Listagem de Clientes */}
        <div className="list-section">
          <div className="list-header">
            <h2 style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>
              Clientes Cadastrados
              {isLoadingClientes && (
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginLeft: '8px', fontWeight: 'normal' }}>
                  (Carregando...)
                </span>
              )}
            </h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={isLoadingClientes}
              />
              <i className="bi bi-search search-icon"></i>
            </div>
          </div>

          <div className="clientes-list">
            {isLoadingClientes ? (
              // Renderizar skeletons durante o carregamento
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="cliente-skeleton">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-name"></div>
                    <div className="skeleton-details">
                      <div className="skeleton-detail"></div>
                      <div className="skeleton-detail"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="error-state">
                <i className="bi bi-exclamation-triangle"></i>
                <h3>Erro ao carregar clientes</h3>
                <p>{error}</p>
                <Button variant="primary" text="Tentar novamente" iconName="arrow-clockwise" iconPosition="left" onClick={loadClientes} disabled={isLoadingClientes} style={{ width: 'fit-content' }} />
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="no-results">
                <i className="bi bi-people" style={{ color: 'var(--color-accent)'}}></i>
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="clientes-table">
                <div className="table-header">
                  <div className="header-cell">Nome</div>
                  <div className="header-cell">CPF</div>
                  <div className="header-cell">Telefone</div>
                  <div className="header-cell">E-mail</div>
                  <div className="header-cell">Endereço</div>
                  <div className="header-cell">Editar/Histórico</div>
                </div>
                {filteredClientes.map(cliente => (
                  <div key={cliente.id} className="table-row">
                                         <div className="table-cell">
                       <div className="cliente-info">
                                                    <div className="cliente-avatar">
                             {cliente.name ? cliente.name.charAt(0).toUpperCase() : '?'}
                           </div>
                         <span className="cliente-nome">{cliente.name ? capitalizeText(cliente.name) : '-'}</span>
                       </div>
                     </div>
                     <div className="table-cell">
                       {cliente.cpf ? mascaraCPF(removerMascara(cliente.cpf)) : '-'}
                     </div>
                     <div className="table-cell">
                       {formatarTelefoneParaExibicao(cliente.phone)}
                     </div>
                     <div className="table-cell">
                       {cliente.email || '-'}
                     </div>
                                         <div className="table-cell">
                       {formatAddress(cliente.address)}
                     </div>
                    <div className="table-cell">
                      <div className="cliente-actions">        
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="btn-edit-profile"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleShowHistory(cliente)}
                          className="btn-details"
                          title="Ver Histórico"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Clientes; 