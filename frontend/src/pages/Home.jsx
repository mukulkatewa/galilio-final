import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  const games = [
    { name: 'Keno', path: '/games/keno', icon: '🎱', description: 'Pick numbers and win' },
    { name: 'Limbo', path: '/games/limbo', icon: '🎯', description: 'How high can you go?' },
    { name: 'Crash', path: '/games/crash', icon: '🚀', description: 'Cash out before crash' },
    { name: 'Dragon Tower', path: '/games/dragon-tower', icon: '🐉', description: 'Climb the tower' },
    { name: 'Dice', path: '/games/dice', icon: '🎲', description: 'Roll and predict' },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          Welcome to Galilio
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.path}
              to={game.path}
              className="rounded-xl border p-6 transition-all hover:scale-105"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl">{game.icon}</span>
                <h3 className="text-xl font-semibold" style={{ color: '#e2e8f0' }}>
                  {game.name}
                </h3>
              </div>
              <p className="text-sm" style={{ color: '#a0aec0' }}>
                {game.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
