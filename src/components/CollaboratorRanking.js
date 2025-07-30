import React from 'react';
import { Trophy, Medal, Award, TrendingUp, Target, User } from 'lucide-react';

const CollaboratorRanking = ({ users }) => {
  // Ordenar usuários por total de protocolos (decrescente)
  const sortedUsers = [...users].sort((a, b) => b.count - a.count);

  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500 medal-gold" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400 medal-silver" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600 medal-bronze" />;
      default:
        return <span className="w-6 h-6 text-gray-400 font-bold text-lg">#{position + 1}</span>;
    }
  };

  const getStatusColor = (percentual) => {
    if (percentual >= 100) return 'text-green-600 bg-green-100';
    if (percentual >= 80) return 'text-yellow-600 bg-yellow-100';
    if (percentual >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (percentual) => {
    if (percentual >= 100) return 'Meta Atingida! 🎉';
    if (percentual >= 80) return 'Quase lá! 💪';
    if (percentual >= 60) return 'Em progresso 📈';
    return 'Precisa melhorar 📊';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-gray-800">Ranking de Colaboradores</h3>
      </div>

      {sortedUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum colaborador encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 com destaque especial */}
          {sortedUsers.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md animate-fade-in-up ${
                index === 0
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50'
                  : index === 1
                  ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'
                  : 'border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                    {getMedalIcon(index)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.nome}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-lg text-gray-800">
                      {user.count} protocolos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">
                      {user.count}/{user.meta} ({user.percentual}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso da meta</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.percentual)}`}>
                    {getStatusText(user.percentual)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      user.percentual >= 100
                        ? 'bg-green-500'
                        : user.percentual >= 80
                        ? 'bg-yellow-500'
                        : user.percentual >= 60
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(user.percentual, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {/* Restante dos colaboradores */}
          {sortedUsers.slice(3).map((user, index) => (
            <div
              key={user.id}
              className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    {getMedalIcon(index + 3)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{user.nome}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-800">
                      {user.count} protocolos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">
                      {user.count}/{user.meta} ({user.percentual}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso da meta</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.percentual)}`}>
                    {getStatusText(user.percentual)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      user.percentual >= 100
                        ? 'bg-green-500'
                        : user.percentual >= 80
                        ? 'bg-yellow-500'
                        : user.percentual >= 60
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(user.percentual, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas gerais */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sortedUsers.length}
            </div>
            <div className="text-sm text-gray-600">Total Colaboradores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sortedUsers.filter(u => u.percentual >= 100).length}
            </div>
            <div className="text-sm text-gray-600">Metas Atingidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(sortedUsers.reduce((acc, u) => acc + u.percentual, 0) / sortedUsers.length)}%
            </div>
            <div className="text-sm text-gray-600">Média Geral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sortedUsers.reduce((acc, u) => acc + u.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Protocolos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorRanking; 