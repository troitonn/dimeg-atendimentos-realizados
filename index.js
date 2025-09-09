require('dotenv').config(); // Carrega variáveis de ambiente

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Função para formatar data no padrão dd/MM/yyyy
function formatarData(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// Função para adicionar dias a uma data
function adicionarDias(date, dias) {
  const novaData = new Date(date);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

// Middleware simples para log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rota para gerar relatório Feegow
app.post('/relatorio', async (req, res) => {
  const { report } = req.body;

  if (!report || typeof report !== 'string' || report.trim() === '') {
    return res.status(400).json({ error: 'Parâmetro "report" inválido ou ausente.' });
  }

  const hoje = new Date();
  const dataFimFinal = formatarData(hoje); // hoje
  const dataInicioFinal = formatarData(adicionarDias(hoje, -59)); // 59 dias atrás

  const payload = {
    report,
    DATA_INICIO: dataInicioFinal,
    DATA_FIM: dataFimFinal
  };

  try {
    const response = await axios.post(
      'https://api.feegow.com/v1/api/reports/generate',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': process.env.FEEGOW_TOKEN
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro na requisição Feegow:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(500).json({ error: 'Erro ao obter dados do Feegow' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
