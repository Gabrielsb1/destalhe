import React from 'react';
import { 
  Users, 
  FileText, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

const InfoCards = ({ stats, meta }) => {
  const cards = [
    {
      title: 'Total de Colaboradores',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      description: 'Usuários ativos no sistema'
    },
    {
      title: 'Protocolos Hoje',
      value: stats.protocolosHoje || 0,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      description: 'Protocolos finalizados hoje'
    },
    {
      title: 'Meta Total Diária',
      value: meta || 48,
      icon: Target,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      description: 'Meta total de todos os colaboradores'
    },
    {
      title: 'Progresso da Meta',
      value: `${Math.round(((stats.protocolosHoje || 0) / (meta || 48)) * 100)}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      description: 'Percentual da meta atingida'
    }
  ];

  const getProgressStatus = () => {
    const progress = ((stats.protocolosHoje || 0) / (meta || 48)) * 100;
    if (progress >= 100) {
      return {
        icon: CheckCircle,
        text: 'Meta Atingida! 🎉',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    } else if (progress >= 80) {
      return {
        icon: TrendingUp,
        text: 'Quase lá! 💪',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    } else if (progress >= 60) {
      return {
        icon: Clock,
        text: 'Em progresso 📈',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    } else {
      return {
        icon: AlertCircle,
        text: 'Precisa melhorar 📊',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }
  };

  const progressStatus = getProgressStatus();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Cards principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={index}
                    className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 hover-lift hover-scale card-entrance-${index + 1}`}
                  >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de status do progresso */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Status do Progresso</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status atual */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${progressStatus.bgColor} mb-3`}>
              <progressStatus.icon className={`w-8 h-8 ${progressStatus.color}`} />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Status Atual</h4>
            <p className={`text-sm font-medium ${progressStatus.color}`}>
              {progressStatus.text}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso da Meta</span>
              <span className="text-sm font-bold text-gray-800">
                {stats.protocolosHoje || 0} / {meta || 48}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-out ${
                  progressStatus.color === 'text-green-600'
                    ? 'bg-green-500'
                    : progressStatus.color === 'text-yellow-600'
                    ? 'bg-yellow-500'
                    : progressStatus.color === 'text-orange-600'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(((stats.protocolosHoje || 0) / (meta || 48)) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {stats.protocolosRestantes || Math.max(0, (meta || 48) - (stats.protocolosHoje || 0))}
              </div>
              <div className="text-xs text-gray-600">Faltam para meta</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {stats.protocolosSemana || 0}
              </div>
              <div className="text-xs text-gray-600">Esta semana</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {stats.protocolosMes || 0}
              </div>
              <div className="text-xs text-gray-600">Este mês</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards; 