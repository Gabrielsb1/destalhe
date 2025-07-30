import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { metaService } from '../services/metaService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductivityChart = ({ protocolos, meta }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (protocolos && protocolos.length > 0) {
      generateChartData();
    }
  }, [protocolos, meta]);

  const generateChartData = async () => {
    // Agrupar protocolos VERIFICADOS/FINALIZADOS por data
    const protocolosPorData = {};
    
    protocolos.forEach(protocolo => {
      // Só contar protocolos que foram verificados/finalizados
      // Status: 'cancelado', 'dados_excluidos' ou 'coordenacao' (não pendentes)
      if (['cancelado', 'dados_excluidos', 'coordenacao'].includes(protocolo.status)) {
        // Usar a data de verificação (atualizado_em) ao invés da data de criação
        const dataVerificacao = protocolo.atualizado_em || protocolo.criado_em;
        const data = new Date(dataVerificacao).toLocaleDateString('pt-BR');
        protocolosPorData[data] = (protocolosPorData[data] || 0) + 1;
        
        // Debug log
        console.log(`Protocolo ${protocolo.numero_protocolo}: status=${protocolo.status}, data_verificacao=${dataVerificacao}, data_contabilizada=${data}`);
      }
    });

    // Pegar últimos 7 dias
    const ultimos7Dias = [];
    const metasPorDia = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toLocaleDateString('pt-BR');
      ultimos7Dias.push(dataStr);
      
      // Buscar meta específica para cada dia
      try {
        const { data: metaDia } = await metaService.getMeta(data);
        const metaEspecifica = metaDia?.meta_qtd || 48; // Meta padrão se não configurada
        metasPorDia.push(metaEspecifica);
        
        console.log(`Meta para ${dataStr}: ${metaEspecifica}`);
      } catch (error) {
        console.error(`Erro ao buscar meta para ${dataStr}:`, error);
        metasPorDia.push(48); // Meta padrão em caso de erro
      }
    }

    const dados = ultimos7Dias.map(data => protocolosPorData[data] || 0);
    
    // Debug log - resultado final
    console.log('Protocolos por data (verificados):', protocolosPorData);
    console.log('Metas por dia:', metasPorDia);
    console.log('Dados para o gráfico:', dados);

    setChartData({
      labels: ultimos7Dias.map(data => {
        const [dia, mes] = data.split('/');
        return `${dia}/${mes}`;
      }),
      datasets: [
        {
          label: 'Protocolos Verificados',
          data: dados,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'Meta Específica por Dia',
          data: metasPorDia,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0,
          pointRadius: 0,
        },
      ],
    });
    setLoading(false);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      title: {
        display: true,
        text: 'Produtividade Total - Últimos 7 Dias',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const dataIndex = context.dataIndex;
            const dataLabel = context.chart.data.labels[dataIndex];
            
            if (label === 'Meta Específica por Dia') {
              return `${label}: ${value} protocolos (${dataLabel})`;
            }
            return `${label}: ${value} protocolos`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 10,
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: 'Quantidade de Protocolos',
          font: {
            size: 14,
            weight: '600',
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: 'Data',
          font: {
            size: 14,
            weight: '600',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gráfico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Produtividade Diária</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-red-500" />
            <span>Meta Total: {meta || 48}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Últimos 7 dias (apenas verificados)</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Nenhum dado disponível para exibir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductivityChart; 