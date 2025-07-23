import '../styles/EditingProfile.css';
import React, { useState, useEffect } from 'react';
import Button from './Button';
import InputDate from './InputDate';
import { capitalizeText } from '../utils/capitalizeText';
import { mascaraCPF } from '../utils/Mascaras';
import PhoneInput from 'react-phone-number-input'
import ptBR from 'react-phone-number-input/locale/pt-BR'
import imageCompression from 'browser-image-compression';
import { PencilSimple, PencilSimpleSlash, PencilSimpleLine } from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth';

const EditingProfile = ({ handleCloseModal }) => {
    // Usa os dados reais do usuário do estado global
    // Estrutura esperada: user.person.name, user.person.contacts[0].email, etc.
    const { user } = useAuth();
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Função para obter o primeiro contato (email e telefone)
    const getFirstContact = () => {
        console.log('Dados do usuário no EditingProfile:', user);
        console.log('Contatos do usuário:', user?.person?.contacts);
        
        if (user?.person?.contacts && user.person.contacts.length > 0) {
            return user.person.contacts[0];
        }
        return { email: '', phone: '' };
    };

    const [formData, setFormData] = useState({
        natural_person_id: user?.person?.id?.toString() || '',
        full_name: user?.person?.name || '',
        birth_date: user?.person?.birth_date || '',
        gender: user?.person?.gender || '',
        email: getFirstContact().email || user?.email || '',
        phone_number: getFirstContact().phone || '',
        profile_picture: '',
        cpf: user?.person?.cpf || user?.username || ''
    });

    // Atualiza o formulário quando os dados do usuário mudarem
    useEffect(() => {
        const firstContact = getFirstContact();
        
        // Converte o telefone para o formato internacional se necessário
        let phoneNumber = firstContact.phone || '';
        if (phoneNumber && !phoneNumber.startsWith('+')) {
            // Se o telefone não tem código do país, adiciona o +55 do Brasil
            phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove caracteres não numéricos
            if (phoneNumber.length === 11) {
                phoneNumber = `+55${phoneNumber}`;
            } else if (phoneNumber.length === 10) {
                phoneNumber = `+55${phoneNumber}`;
            }
        }

        // Converte a data para o formato correto se necessário
        let birthDate = user?.person?.birth_date || '';
        if (birthDate && typeof birthDate === 'string') {
            // Se a data vier no formato ISO (YYYY-MM-DD), converte para Date
            if (birthDate.includes('-')) {
                birthDate = new Date(birthDate);
            }
        }
        
        setFormData({
            natural_person_id: user?.person?.id?.toString() || '',
            full_name: user?.person?.name || '',
            birth_date: birthDate,
            gender: user?.person?.gender || '',
            email: firstContact.email || user?.email || '',
            phone_number: phoneNumber,
            profile_picture: '',
            cpf: user?.person?.cpf || user?.username || ''
        });
    }, [user]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            phone_number: value,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            birth_date: date,
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: 0.05,
                    maxWidthOrHeight: 500,
                    useWebWorker: true,
                };

                const compressedBlob = await imageCompression(file, options);
                const extension = file.name.split('.').pop();
                const newFileName = `compressed.${extension}`;
                const compressedFile = new File([compressedBlob], newFileName, {
                    type: compressedBlob.type,
                });

                setSelectedFile(compressedFile);
                setImagePreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Erro ao comprimir a imagem:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const dataToSubmit = new FormData();
        dataToSubmit.append('natural_person_id', formData.natural_person_id);

        if (selectedFile) {
            dataToSubmit.append('profile_picture', selectedFile);
        }

        try {
            setIsEditable(false);
            setSelectedFile(null);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleEdit = () => {
        setIsEditable((prev) => !prev);
    };

    const isFormChanged = () => {
        // Verifica se há arquivo selecionado ou se os dados foram modificados
        if (selectedFile) return true;
        
        // Aqui você pode adicionar lógica para verificar se os dados foram modificados
        // Por enquanto, retorna true se há arquivo ou se está em modo de edição
        return isEditable;
    };

    return (
        <div className="container-editar-profile">
            {/* Formulário de edição de perfil usando dados reais do usuário */}
            <form onSubmit={handleSubmit} className="form-editar-profile p-4">
                <div className="dados-pessoais-section mb-4">
                    <div className="d-flex justify-content-between mb-3">
                        <h5 className="mb-0" style={{ fontSize: '20px', color: 'var(--font-color)' }}>Dados Pessoais</h5>
                        <span onClick={toggleEdit} style={{ cursor: 'pointer' }} title="Editar dados">
                            {isEditable ? <PencilSimpleSlash size={20} /> : <PencilSimpleLine size={20} />}
                        </span>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Nome completo</label>
                            <input type="text" name="full_name" className="form-control" value={capitalizeText(formData.full_name)} onChange={handleChange} readOnly={!isEditable} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>CPF</label>
                            <input type="text" name="cpf" className="form-control" value={mascaraCPF(formData.cpf)} readOnly />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Data de nascimento</label>
                            <InputDate selectedDate={formData.birth_date} onDateChange={handleDateChange} placeholderText="Selecione uma data" locale="pt-BR" disabled={!isEditable} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Gênero</label>
                            <select name="gender" className="form-control" value={formData.gender || ''} onChange={handleChange} disabled={!isEditable}>
                                <option value="">Selecione</option>
                                <option value="MALE">Masculino</option>
                                <option value="FEMALE">Feminino</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>E-mail</label>
                            <input type="email" name="email" className="form-control" value={formData.email.toLowerCase()} onChange={handleChange} readOnly={!isEditable} />
                        </div>
                        <div className="col-md-6">
                            <label>Telefone</label>
                            <PhoneInput className={isEditable ? 'inputTelefone' : 'inputTelefone-disabled'} placeholder="Telefone" value={formData.phone_number} labels={ptBR} onChange={handlePhoneChange} defaultCountry="BR" style={{ height: '40px' }} />
                        </div>
                    </div>
                </div>

                {submitting && (
                    <div className="spinner-border text-success mt-3" role="status" style={{ position: 'absolute', bottom: '30px', right: '0px', left: '0px', margin: 'auto' }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                )}

                <div className="text-end">
                    <Button text="Salvar" variant="primary" type="submit" disabled={!isFormChanged()} />
                </div>

            </form>
        </div>
    );
};

export default EditingProfile;