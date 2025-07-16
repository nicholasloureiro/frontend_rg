import '../styles/EditingProfile.css';
import React, { useState } from 'react';
import Button from './Button';
import InputDate from './InputDate';
import { capitalizeText } from '../utils/capitalizeText';
import { mascaraCPF } from '../utils/Mascaras';
import PhoneInput from 'react-phone-number-input'
import ptBR from 'react-phone-number-input/locale/pt-BR'
import imageCompression from 'browser-image-compression';
import { PencilSimple, PencilSimpleSlash, PencilSimpleLine } from '@phosphor-icons/react';

const EditingProfile = ({ handleCloseModal }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        natural_person_id: '1',
        full_name: 'João Silva',
        birth_date: '1990-01-01',
        gender: 'MALE',
        email: 'joao.silva@email.com',
        phone_number: '+5511999999999',
        profile_picture: '',
        cpf: '12345678901'
    });

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
        return !!selectedFile;
    };

    return (
        <div className="container-editar-profile">
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