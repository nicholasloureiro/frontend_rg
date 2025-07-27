const mascaraCPF = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const mascaraCNPJ = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const mascaraTelefone = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
};

const mascaraTelefoneInternacional = (value) => {
    if (!value) return '';

    value = value.replace(/\D/g, "");

    if (value.startsWith('55')) {
        value = value.slice(2);
    }

    if (value.length <= 10) {

        value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    return value;
};

const mascaraNumeroDecimal = (value) => {
    if (value === null || value === undefined) return '';

    value = value.toString().replace(/\D/g, '');

    while (value.length < 3) {
        value = '0' + value;
    }

    const inteiro = value.slice(0, -2).replace(/^0+/, '') || '0';
    const decimal = value.slice(-2);

    const inteiroFormatado = inteiro.length > 3
        ? inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : inteiro;

    return `${inteiroFormatado},${decimal}`;
};


const formatarParaExibicaoDecimal = (valor) => {
    if (typeof valor !== 'number') return '';

    const partes = valor.toFixed(2).split('.');
    const inteiroFormatado = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${inteiroFormatado},${partes[1]}`;
};

const mascaraCEP = (value) => {
    if (!value) return '';

    return value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
};

const removerMascara = (value) => {
    return value.replace(/\D/g, "");
};

const formatarTelefoneParaExibicao = (telefone) => {
    if (!telefone) return '';
    
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Se o número tem 13 dígitos (55 + DDD + número), formata como brasileiro
    if (numeroLimpo.length === 13 && numeroLimpo.startsWith('55')) {
        return numeroLimpo.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '($2) $3-$4');
    }
    
    // Se o número tem 11 dígitos (DDD + número), formata como brasileiro
    if (numeroLimpo.length === 11) {
        return numeroLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Se o número tem 10 dígitos (DDD + número antigo), formata como brasileiro
    if (numeroLimpo.length === 10) {
        return numeroLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    // Se não conseguir formatar, retorna o número original
    return telefone;
};

export { mascaraCPF, mascaraCNPJ, mascaraTelefone, removerMascara, mascaraTelefoneInternacional, mascaraNumeroDecimal, mascaraCEP, formatarParaExibicaoDecimal, formatarTelefoneParaExibicao };