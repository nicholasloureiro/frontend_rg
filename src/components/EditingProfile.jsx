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
import { updateProfile } from '../services/authService';
import Swal from 'sweetalert2';

const EditingProfile = ({ handleCloseModal }) => {
    // Usa os dados reais do usuário do estado global
    // Estrutura esperada: user.person.name, user.person.contacts[0].email, etc.
    const { user, updateUser, getCurrentUser } = useAuth();
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Função para obter o primeiro contato (email e telefone)
    const getFirstContact = () => {
        if (user?.person?.contacts && user.person.contacts.length > 0) {
            return user.person.contacts[0];
        }
        return { email: '', phone: '' };
    };

    const [formData, setFormData] = useState({
        natural_person_id: user?.person?.id?.toString() || '',
        name: user?.person?.name || '',
        email: getFirstContact().email || user?.email || '',
        phone: getFirstContact().phone || '',
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

        
        setFormData({
            natural_person_id: user?.person?.id?.toString() || '',
            name: user?.person?.name || '',
            email: firstContact.email || user?.email || '',
            phone: phoneNumber,
            profile_picture: '',
            cpf: user?.person?.cpf || user?.username || ''
        });
    }, [user]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            phone: value,
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

        // Mostra indicador de carregamento
        Swal.fire({
            title: 'Atualizando perfil...',
            text: 'Aguarde enquanto salvamos suas informações',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const dataToSubmit = new FormData();
        dataToSubmit.append('natural_person_id', formData.natural_person_id);
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('email', formData.email);
        dataToSubmit.append('phone', formData.phone);
        dataToSubmit.append('cpf', formData.cpf);

        if (selectedFile) {
            dataToSubmit.append('profile_picture', selectedFile);
        }

        try {
            const response = await updateProfile(dataToSubmit);
            
            // Fecha o indicador de carregamento
            Swal.close();
            
            // Recarrega os dados atualizados do usuário
            try {
                await getCurrentUser();
            } catch (userError) {
                console.error('Erro ao recarregar dados do usuário:', userError);
                // Mesmo se falhar ao recarregar, não impede o fechamento do modal
            }
            
            // Limpa os estados e fecha o modal
            setIsEditable(false);
            setSelectedFile(null);
            setImagePreview(null);
            handleCloseModal();
            
            // Mostra mensagem de sucesso com SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Perfil atualizado com sucesso!',
                confirmButtonColor: '#28a745',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            
            // Fecha o indicador de carregamento
            Swal.close();
            
            // Mostra mensagem de erro com SweetAlert2
            await Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao atualizar perfil. Tente novamente.',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleEdit = () => {
        setIsEditable((prev) => !prev);
    };

    const isFormChanged = () => {
        // Verifica se há arquivo selecionado
        if (selectedFile) return true;
        
        // Verifica se os dados foram modificados comparando com os dados originais
        const firstContact = getFirstContact();
        const originalPhone = firstContact.phone || '';
        let originalPhoneFormatted = originalPhone;
        
        // Formata o telefone original para comparação
        if (originalPhone && !originalPhone.startsWith('+')) {
            originalPhoneFormatted = originalPhone.replace(/\D/g, '');
            if (originalPhoneFormatted.length === 11) {
                originalPhoneFormatted = `+55${originalPhoneFormatted}`;
            } else if (originalPhoneFormatted.length === 10) {
                originalPhoneFormatted = `+55${originalPhoneFormatted}`;
            }
        }
        
        return (
            formData.name !== (user?.person?.name || '') ||
            formData.email !== (firstContact.email || user?.email || '') ||
            formData.phone !== originalPhoneFormatted
        );
    };

    return (
        <div className="container-editar-profile">
            {/* Formulário de edição de perfil usando dados reais do usuário */}
            <form onSubmit={handleSubmit} className="form-editar-profile p-4">
                <div className="dados-pessoais-section mb-4">
                    <div className="d-flex justify-content-between mb-3">
                        <h5 className="mb-0" style={{ fontSize: '20px', color: 'var(--font-color)' }}>Dados Pessoais</h5>
                        <span onClick={toggleEdit} style={{ cursor: 'pointer' }} title="Editar dados">
                            {!isEditable ? <PencilSimpleSlash size={20} /> : <PencilSimpleLine size={20} />}
                        </span>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Nome completo</label>
                            <input type="text" name="name" className="form-control" value={capitalizeText(formData.name)} onChange={handleChange} readOnly={!isEditable} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>CPF</label>
                            <input type="text" name="cpf" className="form-control" value={mascaraCPF(formData.cpf)} readOnly />
                        </div>
                       
                        <div className="col-md-6 mb-3">
                            <label>E-mail</label>
                            <input type="email" name="email" className="form-control" value={formData.email.toLowerCase()} onChange={handleChange} readOnly={!isEditable} />
                        </div>
                        <div className="col-md-6">
                            <label>Telefone</label>
                            <PhoneInput 
                                className={isEditable ? 'inputTelefone' : 'inputTelefone-disabled'} 
                                placeholder="Telefone" 
                                value={formData.phone} 
                                labels={ptBR} 
                                onChange={handlePhoneChange} 
                                defaultCountry="BR" 
                                style={{ height: '40px' }}
                                disabled={!isEditable}
                            />
                        </div>
                    </div>
                </div>



                <div className="text-end">
                    <Button text="Salvar" variant="primary" type="submit" disabled={!isFormChanged()} />
                </div>

            </form>
        </div>
    );
};

export default EditingProfile;