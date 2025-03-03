document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('infoForm');
    const btnAcessar = document.getElementById('btnAcessar');
    const tempElement = document.getElementById('tempLocal');

    btnAcessar.addEventListener('click', function () {
        const resultadoCep = document.getElementById('resultadoCep');
        if (resultadoCep) {
            resultadoCep.scrollIntoView({ behavior: 'smooth' });
        }
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const cepInput = document.getElementById('cepInput').value.trim();


        if (!validarCEP(cepInput)) {
            alert("Formato inválido de CEP. Use apenas 8 números.");
            return;
        }

        try {
            const cepInfo = await buscarCEP(cepInput);
            if (cepInfo.erro) {
                alert("CEP não encontrado.");
            } else {
                atualizarEndereco(cepInfo);
                await buscarPrevisaoDoTempo(cepInfo.localidade, cepInfo.uf);

                const resultadoCep = document.getElementById('resultadoCep');
                if (resultadoCep) {
                    resultadoCep.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error("Erro ao buscar informações do CEP:", error);
        }
    });
});

function validarCEP(cep) {
    return /^[0-9]{8}$/.test(cep);
}

// ✅ Função para buscar informações do CEP na API do ViaCEP
async function buscarCEP(cep) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    verificarStatusHTTP(response);
    return await response.json();
}

// ✅ Atualiza os campos do endereço no HTML usando innerHTML corretamente
function atualizarEndereco(cepInfo) {
    document.getElementById('logradouro').innerHTML = cepInfo.logradouro || "--";
    document.getElementById('bairro').innerHTML = cepInfo.bairro || "--";
    document.getElementById('estado').innerHTML = `${cepInfo.localidade || "--"}/${cepInfo.uf || "--"}`;
}

// ✅ Função para buscar previsão do tempo usando cidade e estado do CEP
async function buscarPrevisaoDoTempo(cidade, estado) {
    const coordenadas = await buscarCoordenadas(cidade, estado);
    if (!coordenadas) {
        alert("Não foi possível obter as coordenadas dessa localidade.");
        return;
    }

    const { latitude, longitude } = coordenadas;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;
    const response = await fetch(url);
    verificarStatusHTTP(response);
    const data = await response.json();

    document.getElementById('tempLocal').innerHTML = `Previsão de tempo: ${data.hourly.temperature_2m[0]}°C`;
}

// ✅ Função para buscar latitude e longitude da cidade e estado
async function buscarCoordenadas(cidade, estado) {
    const url = `https://nominatim.openstreetmap.org/search?city=${cidade}&state=${estado}&country=Brazil&format=json`;
    const response = await fetch(url);
    verificarStatusHTTP(response);
    const data = await response.json();

    if (data.length > 0) {
        return { latitude: data[0].lat, longitude: data[0].lon };
    } else {
        return null;
    }
}

// ✅ Verifica se a resposta HTTP da API está correta
function verificarStatusHTTP(response) {
    if (!response.ok) {
        throw new Error(`Erro na requisição: Status ${response.status}`);
    }
}
