import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import { login as loginService } from '../services/authService';
import { mascaraCPF } from '../utils/Mascaras';
import PhoneInput from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt-BR';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    password_confirm: '',
    name: '',
    cpf: '',
    email: '',
    phone: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: name === 'cpf' ? mascaraCPF(value) : value
    }));
  };

  const handleRegisterPhoneChange = (value) => {
    setRegisterData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Remove a máscara do CPF antes de enviar
      const usernameSemMascara = formData.username.replace(/\D/g, '');
      const data = await loginService(usernameSemMascara, formData.password);
      console.log('Login realizado com sucesso:', data);
      // Aqui você pode redirecionar ou salvar o token, etc.
    } catch (error) {
      alert('Falha no login: ' + (error?.detail || 'Verifique suas credenciais.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      // Remove a máscara do CPF antes de enviar
      const cpfSemMascara = registerData.cpf.replace(/\D/g, '');
      const dadosParaEnviar = {
        ...registerData,
        cpf: cpfSemMascara,
        username: cpfSemMascara // Usa o CPF sem máscara como username
      };
      // Aqui você faria a chamada para o endpoint de cadastro
      // Exemplo: await registerService(dadosParaEnviar)
      console.log('Dados para cadastro:', dadosParaEnviar);
      alert('Cadastro realizado com sucesso! (simulação)');
      setShowRegister(false);
    } catch (error) {
      alert('Erro ao cadastrar: ' + (error?.detail || 'Tente novamente.'));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Esqueceu a senha clicado');
  };

  return (
    <div className="login-main-container">
      <div className="login-left">
        <div className="login-logo-row">
          <img src={logo} alt="Logo" className="login-logo-img" />
          <h1 className="login-company-name" >Roupa de Gala</h1>
        </div>
        <h1 className="login-title">Bem-vindo de volta</h1>
        <h2 className="login-highlight">Faça login para continuar</h2>
        <p className="login-desc">Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
      <div className="login-card">
        <div className="login-header">
          <h1>Login</h1>
          <p>Entre com suas credenciais para acessar sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form" style={{ display: showRegister ? 'none' : 'block' }}>
          <div className="input-group mb-4">
            <label htmlFor="input-login" className='input-label'>CPF</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                name="username"
                value={mascaraCPF(formData.username)}
                onChange={handleInputChange}
                placeholder="Digite seu CPF"
                required
                autoComplete="off"
                className="form-input"
                id='input-login'
              />
            </div>
          </div>
          <div className="input-group mb-2">
            <label htmlFor="input-login" className='input-label'>Senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
                required
                autoComplete="off"
                className="form-input"
                id='input-login'
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>


          <div className='login-button-container w-100 mb-2 mt-3' style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
          {/* <div className='login-button-cadastrar w-100 text-center mt-3'>
            <span style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>Ainda não tem uma conta? <span type="button" className="register-toggle" onClick={() => setShowRegister(true)} style={{ fontSize: 13, textDecoration: 'underline', cursor: 'pointer', color: '#FFD600' }}>Cadastre-se</span></span>
          </div> */}

        </form>

        <form onSubmit={handleRegister} className="register-form" style={{ display: showRegister ? 'block' : 'none' }}>

          {/* Seção de dados pessoais */}
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#FFD600', borderBottom: '1px solid #FFD600', paddingBottom: 1, width: 'fit-content' }}>Dados pessoais</legend>
            <div className="input-group mb-3">
              <label htmlFor="register-name" className='input-label'>Nome completo</label>
              <input type="text" name="name" id="register-name" autoComplete="off" value={registerData.name} onChange={handleRegisterChange} placeholder="Nome completo" required className="form-input" />
            </div>
            <div className="input-group mb-3">
              <label htmlFor="register-cpf" className='input-label'>CPF</label>
              <input type="text" name="cpf" id="register-cpf" autoComplete="off" value={registerData.cpf} onChange={handleRegisterChange} placeholder="CPF" required className="form-input" />
            </div>
            <div className="input-group mb-3">
              <label htmlFor="register-email" className='input-label'>Email</label>
              <input type="email" name="email" id="register-email" autoComplete="off" value={registerData.email} onChange={handleRegisterChange} placeholder="Email" required className="form-input" />
            </div>
            <div className="input-group mb-3">
              <label htmlFor="register-phone" className='input-label'>Telefone</label>
              <PhoneInput
                id="register-phone"
                name="phone"
                international
                defaultCountry="BR"
                value={registerData.phone}
                onChange={handleRegisterPhoneChange}
                placeholder="Digite o telefone"
                labels={ptBR}
                className="phone-input"
                autoComplete="off"
                required
              />
            </div>
          </fieldset>
          {/* Seção de senhas */}
          <fieldset style={{ border: 'none', margin: 0, padding: 0, marginBottom: 18 }}>
            <legend style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#FFD600', borderBottom: '1px solid #FFD600', paddingBottom: 1, width: 'fit-content' }}>Dados de acesso</legend>
            <div className="input-group mb-3">
              <label htmlFor="register-password" className='input-label'>Senha</label>
              <div className="input-wrapper">
                <input type={showRegisterPassword ? 'text' : 'password'} name="password" autoComplete="off" id="register-password" value={registerData.password} onChange={handleRegisterChange} placeholder="Senha" required className="form-input" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((v) => !v)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {!showRegisterPassword ? <EyeOff size={18} color='#CBA135' /> : <Eye size={18} color='#CBA135' />}
                </button>
              </div>
            </div>
            <div className="input-group mb-3">
              <label htmlFor="register-password-confirm" className='input-label'>Confirmar senha</label>
              <div className="input-wrapper">
                <input type={showRegisterPassword ? 'text' : 'password'} name="password_confirm" autoComplete="off" id="register-password-confirm" value={registerData.password_confirm} onChange={handleRegisterChange} placeholder="Confirmar senha" required className="form-input" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((v) => !v)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {!showRegisterPassword ? <EyeOff size={18} color='#CBA135' /> : <Eye size={18} color='#CBA135' />}
                </button>
              </div>
            </div>
          </fieldset>
          <div className='d-flex align-items-center justify-content-between'>
            <span onClick={() => setShowRegister(false)} style={{ textAlign: 'center',fontSize: 13, cursor: 'pointer', marginRight: 15, marginLeft: 'auto' }}>Voltar para login</span>
            <button type="submit" disabled={registerLoading} className="login-button">
              {registerLoading ? <div className="loading-spinner"></div> : 'Cadastrar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login; 