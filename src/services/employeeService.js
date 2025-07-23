// src/services/employeeService.js
import api from './api';

// Função para registrar um novo funcionário
export const registerEmployee = async (employeeData) => {
  try {
    const response = await api.post('/api/v1/employees/register/', employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para buscar todos os funcionários
export const getEmployees = async () => {
  try {
    const response = await api.get('/api/v1/employees/list');
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para atualizar um funcionário existente
export const updateEmployee = async (personId, employeeData) => {
  try {
    const response = await api.put(`/api/v1/employees/${personId}/update/`, employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para alternar o status do funcionário (ativo/inativo)
export const toggleEmployeeStatus = async (personId, active) => {
  try {
    const response = await api.post('/api/v1/employees/toggle-status/', {
      person_id: personId,
      active: active
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};