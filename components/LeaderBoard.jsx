import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Star, Crown, TrendingUp, Sparkles } from 'lucide-react';
import { getLeaderboard } from '@/lib/gamification';

export function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    const { data } = await getLeaderboard(10);
    if (data) {
      setLeaders(data);
    }
    setLoading(false);
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500 dark:text-yellow-400" size={28} />;
      case 2:
        return <Medal className="text-gray-400 dark:text-gray-500" size={24} />;
      case 3:
        return <Medal className="text-orange-600 dark:text-orange-500" size={24} />;
      default:
        return <Award className="text-teal-500 dark:text-teal-400" size={20} />;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-700 text-white shadow-lg shadow-yellow-500/50 dark:shadow-yellow-600/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 text-white shadow-md shadow-gray-400/50 dark:shadow-gray-700/30';
      case 3:
        return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 dark:from-orange-500 dark:via-orange-600 dark:to-orange-700 text-white shadow-md shadow-orange-500/50 dark:shadow-orange-600/30';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white';
    }
  };

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-yellow-200 dark:border-yellow-800/50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-600/5 dark:to-orange-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 dark:from-teal-600/5 dark:to-cyan-600/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 dark:from-yellow-500 dark:via-yellow-600 dark:to-orange-600 p-4 rounded-2xl shadow-xl">
                <Trophy className="text-white" size={36} />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-300 to-yellow-400 dark:from-yellow-400 dark:to-yellow-500 rounded-full p-1.5 shadow-lg animate-pulse">
                <Crown className="text-yellow-700 dark:text-yellow-900" size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                Top Contributors
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Sparkles className="text-yellow-500 dark:text-yellow-400" size={16} />
                Community heroes making a difference
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading leaderboard...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <Trophy className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No contributors yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-3 md:gap-4 items-end mb-6">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center order-1">
                      <div className="relative mb-3">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg ring-4 ring-white dark:ring-gray-900">
                          {topThree[1].full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-500 dark:to-gray-700 rounded-full p-1.5 shadow-md">
                          <Medal className="text-white" size={14} />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 md:p-4 w-full text-center shadow-md border-2 border-gray-300 dark:border-gray-600 h-24 md:h-28 flex flex-col justify-center">
                        <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate mb-1">
                          {topThree[1].full_name}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-gray-700 dark:text-gray-300">
                          <Star className="text-gray-500 dark:text-gray-400" size={14} fill="currentColor" />
                          <span className="font-bold text-lg md:text-xl">{topThree[1].points}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center order-2">
                      <div className="relative mb-3 transform scale-110">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 dark:from-yellow-500 dark:via-yellow-600 dark:to-orange-600 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-xl ring-4 ring-white dark:ring-gray-900 animate-pulse">
                          {topThree[0].full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -top-2 -right-1 bg-gradient-to-br from-yellow-300 to-yellow-400 dark:from-yellow-400 dark:to-yellow-500 rounded-full p-2 shadow-lg animate-bounce">
                          <Crown className="text-yellow-700 dark:text-yellow-900" size={18} />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-200 dark:from-yellow-900/50 dark:via-yellow-800/50 dark:to-orange-800/50 rounded-xl p-4 md:p-5 w-full text-center shadow-xl border-2 border-yellow-400 dark:border-yellow-600 h-32 md:h-36 flex flex-col justify-center">
                        <p className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate mb-2">
                          {topThree[0].full_name}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-yellow-700 dark:text-yellow-400">
                          <Trophy className="text-yellow-600 dark:text-yellow-400" size={18} fill="currentColor" />
                          <span className="font-bold text-2xl md:text-3xl">{topThree[0].points}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center order-3">
                      <div className="relative mb-3">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg ring-4 ring-white dark:ring-gray-900">
                          {topThree[2].full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-orange-300 to-orange-500 dark:from-orange-400 dark:to-orange-600 rounded-full p-1.5 shadow-md">
                          <Medal className="text-white" size={14} />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-xl p-3 md:p-4 w-full text-center shadow-md border-2 border-orange-300 dark:border-orange-700 h-20 md:h-24 flex flex-col justify-center">
                        <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate mb-1">
                          {topThree[2].full_name}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-orange-700 dark:text-orange-400">
                          <Star className="text-orange-500 dark:text-orange-400" size={14} fill="currentColor" />
                          <span className="font-bold text-lg md:text-xl">{topThree[2].points}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rest of the leaderboard */}
            {rest.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                {rest.map((leader, index) => (
                  <div
                    key={leader.id}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-xl transition-all duration-300 border-2 ${
                      getRankBadge(index + 4)
                    } hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-300 dark:hover:border-teal-700`}
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 border-2 border-teal-300 dark:border-teal-700 flex-shrink-0">
                        <span className="font-bold text-teal-700 dark:text-teal-300 text-lg">
                          #{index + 4}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate">
                            {leader.full_name}
                          </p>
                          {leader.points > 1000 && (
                            <TrendingUp className="text-teal-500 dark:text-teal-400 flex-shrink-0" size={16} />
                          )}
                        </div>
                        {leader.ward_zone && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            Ward: {leader.ward_zone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="text-teal-500 dark:text-teal-400" size={16} fill="currentColor" />
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {leader.points}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 text-center font-medium flex items-center justify-center gap-2 flex-wrap">
              <Sparkles className="text-teal-500 dark:text-teal-400" size={18} />
              <span>Earn points by reporting verified issues and helping your community!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
