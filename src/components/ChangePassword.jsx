import React, { useState, useEffect } from "react";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import "../styles/ChangePassword.css";
import { useSelector } from "react-redux";
import Button from "./Button";
import Swal from 'sweetalert2';
import { resetPassword } from '../services/authService';

const ChangePassword = ({ handleCloseModalPassword }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    const [validLength, setValidLength] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const [showWarnLength, setShowWarnLength] = useState(false);
    const [showWarnUpper, setShowWarnUpper] = useState(false);
    const [showWarnLower, setShowWarnLower] = useState(false);
    const [showWarnNumber, setShowWarnNumber] = useState(false);
    const [showWarnMatch, setShowWarnMatch] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        const vLen = newPassword.length >= 6;
        const vUp = /[A-Z]/.test(newPassword);
        const vLo = /[a-z]/.test(newPassword);
        const vNum = /\d/.test(newPassword);

        setValidLength(vLen);
        setHasUppercase(vUp);
        setHasLowercase(vLo);
        setHasNumber(vNum);

        if (newPassword.length > 0) {
            setShowWarnLength(!vLen);
            setShowWarnUpper(!vUp);
            setShowWarnLower(!vLo);
            setShowWarnNumber(!vNum);
        } else {
            setShowWarnLength(false);
            setShowWarnUpper(false);
            setShowWarnLower(false);
            setShowWarnNumber(false);
        }
    }, [newPassword]);

    useEffect(() => {
        const match = newPassword !== "" && newPassword === confirmPassword;
        setPasswordsMatch(match);

        if ((confirmPassword.length >= newPassword.length) && newPassword.length > 0) {
            setShowWarnMatch(!match);
        } else {
            setShowWarnMatch(false);
        }
    }, [newPassword, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordsMatch) return;

        const dataPassword = {
            old_password: currentPassword,
            new_password: newPassword,
        };

        try {
            setLoading(true);
            await resetPassword(dataPassword.old_password, dataPassword.new_password);
            handleCloseModalPassword();
            Swal.fire({
                icon: 'success',
                title: 'Senha alterada com sucesso!',
                showConfirmButton: true,
                confirmButtonColor: '#198754',
            });
        } catch (error) {
            setError(error.message || "Erro ao alterar a senha");
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = (ok, warn) =>
        ok ? (
            <CheckCircle size={17} className="text-success" />
        ) : warn ? (
            <i
                className="bi bi-x-circle text-danger"
                style={{ fontSize: "13px", padding: "2px 0 2px 2px", display: "flex", marginTop: "1px" }}
            />
        ) : (
            <Circle size={16} className="text-muted" />
        );

    return (
        <div className="alterar-senha container p-0">
            <form
                className="alterar-senha__form row g-4"
                onSubmit={handleSubmit}
            >
                {/* requisitos */}
                <div className="alterar-senha__lado-esquerdo col-md-6">
                    <h2 className="alterar-senha__titulo">Alterar Senha</h2>
                    <p className="alterar-senha__subtitulo">
                        As senhas devem conter:
                    </p>
                    <ul className="alterar-senha__requisitos list-unstyled ps-0">
                        <li
                            className={`alterar-senha__requisito d-flex align-items-center mb-2 ${validLength ? "alterar-senha__requisito--ativo" : ""
                                } ${showWarnLength ? "text-danger" : ""}`}
                        >
                            {renderIcon(validLength, showWarnLength)}
                            <span className="ms-2">Ao menos 6 caracteres</span>
                        </li>
                        <li
                            className={`alterar-senha__requisito d-flex align-items-center mb-2 ${hasUppercase ? "alterar-senha__requisito--ativo" : ""
                                } ${showWarnUpper ? "text-danger" : ""}`}
                        >
                            {renderIcon(hasUppercase, showWarnUpper)}
                            <span className="ms-2">
                                Ao menos 1 letra maiúscula (A–Z)
                            </span>
                        </li>
                        <li
                            className={`alterar-senha__requisito d-flex align-items-center mb-2 ${hasLowercase ? "alterar-senha__requisito--ativo" : ""
                                } ${showWarnLower ? "text-danger" : ""}`}
                        >
                            {renderIcon(hasLowercase, showWarnLower)}
                            <span className="ms-2">
                                Ao menos 1 letra minúscula (a–z)
                            </span>
                        </li>
                        <li
                            className={`alterar-senha__requisito d-flex align-items-center mb-2 ${hasNumber ? "alterar-senha__requisito--ativo" : ""
                                } ${showWarnNumber ? "text-danger" : ""}`}
                        >
                            {renderIcon(hasNumber, showWarnNumber)}
                            <span className="ms-2">Ao menos 1 número (0–9)</span>
                        </li>
                        <li
                            className={`alterar-senha__requisito d-flex align-items-center ${passwordsMatch ? "alterar-senha__requisito--ativo" : ""
                                } ${showWarnMatch ? "text-danger" : ""}`}
                        >
                            {renderIcon(passwordsMatch, showWarnMatch)}
                            <span className="ms-2">As senhas devem coincidir</span>
                        </li>
                    </ul>
                </div>

                {/* campos */}
                <div className="alterar-senha__lado-direito col-md-6">
                    <div className="alterar-senha__campo mb-3">
                        <label className="form-label alterar-senha__rotulo">
                            Senha Atual*
                        </label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            className="form-control alterar-senha__input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <span
                            className="position-absolute end-0 translate-middle-y me-3 text-muted"
                            style={{ cursor: "pointer", top: "55%", bottom: "50%" }}
                            onClick={() =>
                                setShowPasswords((s) => !s)
                            }
                        >
                            <i
                                className={`bi ${!showPasswords ? "bi-eye-slash" : "bi-eye"
                                    }`}
                            ></i>
                        </span>
                    </div>

                    <div className="alterar-senha__campo mb-3 position-relative">
                        <label className="form-label alterar-senha__rotulo">
                            Nova Senha
                        </label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            className="form-control alterar-senha__input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <span
                            className="position-absolute end-0 translate-middle-y me-3 text-muted"
                            style={{ cursor: "pointer", top: "55%", bottom: "50%" }}
                            onClick={() =>
                                setShowPasswords((s) => !s)
                            }
                        >
                            <i
                                className={`bi ${!showPasswords ? "bi-eye-slash" : "bi-eye"
                                    }`}
                            ></i>
                        </span>
                    </div>

                    <div className="alterar-senha__campo mb-4 position-relative">
                        <label className="form-label alterar-senha__rotulo">
                            Confirmar Nova Senha
                        </label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            className="form-control alterar-senha__input"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />
                        <span
                            className="position-absolute end-0  translate-middle-y me-3 text-muted"
                            style={{ cursor: "pointer", top: "55%", bottom: "50%" }}
                            onClick={() =>
                                setShowPasswords((s) => !s)
                            }
                        >
                            <i
                                className={`bi ${!showPasswords ? "bi-eye-slash" : "bi-eye"
                                    }`}
                            ></i>
                        </span>
                    </div>

                    <div className="alterar-senha__acoes d-flex gap-2">
                        {loading ? (
                            <div className="spinner-border text-success d-flex mx-auto mb-3" role="status">
                                <span className="sr-only"></span>
                            </div>
                        ) : (
                            <>
                                {error && <p className="text-danger animate__animated animate__headShake mt-0" id="msgErro">{error}</p>}
                            </>
                        )}
                        <Button
                            type="submit"
                            text="Salvar"
                            disabled={!(validLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch && currentPassword)}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
