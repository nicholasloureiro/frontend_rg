import React, { useState, useEffect } from 'react';
import { funcionariosMock } from '../mock/funcionarios';
import { mascaraCPF, mascaraTelefone, removerMascara } from '../utils/Mascaras';
import { capitalizeText } from '../utils/capitalizeText';
import PhoneInput from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt-BR';
import Swal from 'sweetalert2';
import '../styles/Funcionarios.css';
import Header from '../components/Header';
import Button from '../components/Button';

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    cargo: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Carregar dados mock
    setFuncionarios(funcionariosMock);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.cpf || !formData.telefone || !formData.email || !formData.cargo) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    
    if (editingId) {
      // Editar funcionário existente
      setFuncionarios(prev => prev.map(func => 
        func.id === editingId 
          ? { ...formData, id: editingId, dataCadastro: func.dataCadastro }
          : func
      ));
      setEditingId(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Funcionário atualizado!',
        text: 'Os dados do funcionário foram atualizados com sucesso.',
        confirmButtonColor: '#10b981'
      });
    } else {
      // Adicionar novo funcionário
      const novoFuncionario = {
        ...formData,
        id: Date.now(),
        dataCadastro: new Date().toISOString().split('T')[0]
      };
      setFuncionarios(prev => [...prev, novoFuncionario]);
      
      Swal.fire({
        icon: 'success',
        title: 'Funcionário cadastrado!',
        text: 'O funcionário foi cadastrado com sucesso.',
        confirmButtonColor: '#10b981'
      });
    }
    
    // Limpar formulário
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      cargo: ''
    });
  };

  const handleEdit = (funcionario) => {
    window.scrollTo(0, 0);
    setFormData(funcionario);
    setEditingId(funcionario.id);
  };

  const handleDelete = (id) => {
    const funcionario = funcionarios.find(func => func.id === id);
    
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o funcionário ${capitalizeText(funcionario.nome)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setFuncionarios(prev => prev.filter(func => func.id !== id));
        
        Swal.fire(
          'Excluído!',
          'O funcionário foi excluído com sucesso.',
          'success'
        );
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      cargo: ''
    });
  };

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCargoColor = (cargo) => {
    switch (cargo) {
      case 'ADMINISTRADOR':
        return '#ef4444';
      case 'ATENDENTE':
        return '#3b82f6';
      case 'RECEPÇÃO':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
    <Header nomeHeader={'Funcionários'} />
    <div className="funcionarios-container">

      {/* Formulário de Cadastro */}
      <div className="form-section" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <h2 style={{ fontSize: '18px' }}>{editingId ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
        <form onSubmit={handleSubmit} className="funcionario-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={capitalizeText(formData.nome)}
                onChange={handleInputChange}
                required
                placeholder="Digite o nome completo"
                style={{ height: '35px' }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cpf">CPF *</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={mascaraCPF(removerMascara(formData.cpf))}
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
                style={{ height: '35px' }}
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
              />
            </div>
          </div>

          <div className="form-row mb-0">
            <div className="form-group">
              <label htmlFor="cargo">Cargo *</label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                style={{ height: '35px' }}
              >
                <option value="">Selecione um cargo</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="ATENDENTE">ATENDENTE</option>
                <option value="RECEPÇÃO">RECEPÇÃO</option>
              </select>
            </div>
            <div className="form-group"></div>
          </div>

  
            <Button text={editingId ? 'Atualizar' : 'Cadastrar'} type="submit" variant="primary" style={{ width: 'fit-content', marginLeft: 'auto' }} />
            {editingId && (
              <Button text="Cancelar" type="button" variant="secondary" onClick={handleCancelEdit} style={{ width: 'fit-content', marginLeft: 'auto' }} />
            )}
        </form>
      </div>

      {/* Listagem de Funcionários */}
      <div className="list-section">
        <div className="list-header">
          <h2 style={{ fontSize: '18px' }}>Funcionários Cadastrados</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="bi bi-search search-icon"></i>
          </div>
        </div>

        <div className="funcionarios-grid">
          {filteredFuncionarios.length === 0 ? (
            <div className="no-results">
              <i className="bi bi-people"></i>
              <p>Nenhum funcionário encontrado</p>
            </div>
          ) : (
            filteredFuncionarios.map(funcionario => (
              <div key={funcionario.id} className="funcionario-card">
                <div className="funcionario-header">
                  <div className="funcionario-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="funcionario-info">
                    <h3>{capitalizeText(funcionario.nome)}</h3>
                    <span 
                      className="cargo-badge"
                      style={{ backgroundColor: getCargoColor(funcionario.cargo) }}
                    >
                      {funcionario.cargo}
                    </span>
                  </div>
                  <div className="funcionario-actions">
                    <button
                      onClick={() => handleEdit(funcionario)}
                      className="btn-edit"
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(funcionario.id)}
                      className="btn-delete"
                      title="Excluir"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="funcionario-details">
                  <div className="detail-item">
                    <i className="bi bi-person"></i>
                    <span>{mascaraCPF(removerMascara(funcionario.cpf))}</span>
                  </div>
                  <div className="detail-item">
                    <i className="bi bi-telephone"></i>
                    <span>{funcionario.telefone ? funcionario.telefone.replace('+55', '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : ''}</span>
                  </div>
                  <div className="detail-item">
                    <i className="bi bi-envelope"></i>
                    <span>{funcionario.email}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Funcionarios; 