import React, { useState, useEffect } from 'react';
import { mascaraCPF, mascaraTelefone, removerMascara } from '../utils/Mascaras';
import { capitalizeText } from '../utils/capitalizeText';
import PhoneInput from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt-BR';
import Swal from 'sweetalert2';
import '../styles/Funcionarios.css';
import Header from '../components/Header';
import Button from '../components/Button';
import EmployeeCardSkeleton from '../components/EmployeeCardSkeleton';
import { registerEmployee, getEmployees, updateEmployee, toggleEmployeeStatus } from '../services/employeeService';

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    role: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carregar dados da API
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    setError(null);
    try {
      const data = await getEmployees();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setError('Não foi possível carregar a lista de funcionários. Tente novamente.');
      Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar funcionários',
        text: 'Não foi possível carregar a lista de funcionários.',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsLoadingEmployees(false);
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
      phone: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    const requiredFields = editingId
      ? ['name', 'phone', 'email', 'role'] // Durante edição, CPF não é obrigatório
      : ['name', 'cpf', 'phone', 'email', 'role']; // Durante cadastro, todos são obrigatórios

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
        // Editar funcionário existente
        // Enviar apenas os campos necessários para atualização (sem CPF)
        // Formatar o telefone para o formato esperado pela API
        let formattedPhone = formData.phone;
        if (formData.phone) {
          // Remove o código do país (+55) se presente
          formattedPhone = formData.phone.replace('+55', '');
          // Aplica a máscara brasileira se não estiver formatado
          if (!formattedPhone.includes('(')) {
            formattedPhone = formattedPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          }
        }

        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formattedPhone,
          role: formData.role
        };
        await updateEmployee(editingId, updateData);
        setEditingId(null);

        Swal.fire({
          icon: 'success',
          title: 'Funcionário atualizado!',
          text: 'Os dados do funcionário foram atualizados com sucesso.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Adicionar novo funcionário
        const response = await registerEmployee(formData);

        Swal.fire({
          icon: 'success',
          title: 'Funcionário cadastrado!',
          html: `<p>O funcionário foi cadastrado com sucesso.</p>
                 <p style="font-weight:bold;color:#CBA135;font-size:18px;">Senha gerada: <span style="background:#fff3cd;padding:4px 8px;border-radius:4px;">${response.password}</span></p>
                 <p style="color:#b91c1c;">Guarde esta senha com cuidado!<br/>Ela é exibida apenas agora e não poderá ser recuperada depois.</p>` ,
          showConfirmButton: true,
          confirmButtonText: 'Fechar',
          confirmButtonColor: '#CBA135',
          allowOutsideClick: false,
          didOpen: () => {
            const btn = Swal.getConfirmButton();
            btn.disabled = true;
            let seconds = 10;
            btn.textContent = `Fechar (${seconds})`;
            const interval = setInterval(() => {
              seconds--;
              btn.textContent = `Fechar (${seconds})`;
              if (seconds <= 0) {
                clearInterval(interval);
                btn.textContent = 'Fechar';
                btn.disabled = false;
              }
            }, 1000);
          }
        });
      }

      // Recarregar lista de funcionários
      setIsLoadingEmployees(true);
      await loadEmployees();

      // Limpar formulário
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        role: ''
      });
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar funcionário',
        text: error.message || 'Ocorreu um erro ao salvar o funcionário.',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (funcionario) => {
    window.scrollTo(0, 0);
    setFormData(funcionario);
    // Usar person_id se disponível, senão usar id
    setEditingId(funcionario.person_id || funcionario.id);
  };



  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      role: ''
    });
  };

  const handleToggleStatus = async (funcionario) => {
    const personId = funcionario.person_id || funcionario.id;
    const newStatus = !funcionario.active;

    // Confirmação antes de alterar o status
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirmar alteração',
      text: `Deseja ${newStatus ? 'ativar' : 'desativar'} o funcionário ${capitalizeText(funcionario.name)}?`,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
      confirmButtonColor: '#CBA135',
      cancelButtonColor: 'transparent',

    });

    // Se o usuário cancelou, não faz nada
    if (!result.isConfirmed) {
      return;
    }

    try {
      await toggleEmployeeStatus(personId, newStatus);

      Swal.fire({
        icon: 'success',
        title: 'Status alterado!',
        text: `Funcionário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Recarregar lista de funcionários
      setIsLoadingEmployees(true);
      await loadEmployees();
    } catch (error) {
      console.error('Erro ao alterar status do funcionário:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao alterar status',
        text: error.message || 'Ocorreu um erro ao alterar o status do funcionário.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCargoColor = (role) => {
    switch (role) {
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
        <div className="form-section mb-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="form-header">
            <h2 style={{ fontSize: '18px' }}>{editingId ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Salvando...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="funcionario-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={capitalizeText(formData.name)}
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
                  value={mascaraCPF(removerMascara(formData.cpf))}
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
                  value={formData.phone}
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

            <div className="form-row mb-0">
              <div className="form-group">
                <label htmlFor="cargo">Cargo *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  style={{ height: '35px' }}
                  disabled={isLoading}
                >
                  <option value="">Selecione um cargo</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="ATENDENTE">ATENDENTE</option>
                  <option value="RECEPÇÃO">RECEPÇÃO</option>
                </select>
              </div>
              <div className="form-group"></div>
            </div>

            <div className="form-actions-funcionarios">
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

        {/* Listagem de Funcionários */}
        <div className="list-section">
          <div className="list-header">
            <h2 style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>
              Funcionários Cadastrados
              {isLoadingEmployees && (
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginLeft: '8px', fontWeight: 'normal' }}>
                  (Carregando...)
                </span>
              )}
            </h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={isLoadingEmployees}
              />
              <i className="bi bi-search search-icon"></i>
            </div>
          </div>

          <div className="funcionarios-grid">
            {isLoadingEmployees ? (
              // Renderizar skeletons durante o carregamento
              Array.from({ length: 8 }).map((_, index) => (
                <EmployeeCardSkeleton key={index} />
              ))
            ) : error ? (
              <div className="error-state">
                <i className="bi bi-exclamation-triangle"></i>
                <h3>Erro ao carregar funcionários</h3>
                <p>{error}</p>
                <Button variant="primary" text="Tentar novamente" iconName="arrow-clockwise" iconPosition="left" onClick={loadEmployees} disabled={isLoadingEmployees} style={{ width: 'fit-content', marginLeft: 'auto' }} />
              </div>
            ) : filteredFuncionarios.length === 0 ? (
              <div className="no-results">
                <i className="bi bi-people"></i>
                <p>Nenhum funcionário encontrado</p>
              </div>
            ) : (
              filteredFuncionarios.map(funcionario => (
                <div key={funcionario.id} className={`funcionario-card ${!funcionario.active ? 'inactive' : ''}`}>
                  <div className="funcionario-header">

                    <div className="funcionario-info">
                      <h3>{capitalizeText(funcionario.name)}</h3>
                      <span
                        className="cargo-badge"
                        style={{ backgroundColor: getCargoColor(funcionario.role) }}
                      >
                        {funcionario.role}
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
                        onClick={() => handleToggleStatus(funcionario)}
                        className={`btn-toggle-status ${funcionario.active ? 'deactivate' : 'activate'}`}
                        title={funcionario.active ? 'Desativar' : 'Ativar'}
                      >
                        <i className={`bi ${funcionario.active ? 'bi-person-x' : 'bi-person-check'}`}></i>
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
                      <span>{funcionario.phone ? funcionario.phone.replace('+55', '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : ''}</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-envelope"></i>
                      <span>{funcionario.email}</span>
                    </div>
                    <div className="detail-item">
                      <i className={`bi ${funcionario.active ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                      <span className={`status-text ${funcionario.active ? 'active' : 'inactive'}`}>
                        {funcionario.active ? 'Ativo' : 'Inativo'}
                      </span>
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