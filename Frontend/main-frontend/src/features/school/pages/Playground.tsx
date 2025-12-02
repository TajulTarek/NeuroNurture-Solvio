import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { childrenService, SchoolChild } from '@/shared/services/child/childrenService';
import {
    Copy,
    Eye,
    Gamepad2,
    Hand,
    Loader2,
    Mic,
    Music,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  color: string;
}

const games: Game[] = [
  {
    id: 'gesture',
    name: 'Gesture Recognition',
    description: 'Practice hand gestures and improve motor skills',
    icon: Hand,
    route: '/games/gesture',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'mirror-posture',
    name: 'Mirror Posture',
    description: 'Copy facial expressions and postures',
    icon: Copy,
    route: '/games/mirror-posture',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gaze-tracking',
    name: 'Gaze Tracking',
    description: 'Improve eye contact and attention skills',
    icon: Eye,
    route: '/games/gaze-tracking/play',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'repeat-with-me',
    name: 'Repeat with Me',
    description: 'Practice pronunciation and speech',
    icon: Mic,
    route: '/games/repeat-with-me/gameplay',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'dance-doodle',
    name: 'Dance Doodle',
    description: 'Follow dance moves and improve coordination',
    icon: Music,
    route: '/games/dance-doodle',
    color: 'from-yellow-500 to-orange-500'
  }
];

const Playground: React.FC = () => {
  const { school } = useSchoolAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<SchoolChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedChild, setSelectedChild] = useState<SchoolChild | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!school?.id) return;
      
      try {
        setLoading(true);
        const schoolChildren = await childrenService.getChildrenBySchool(school.id);
        setChildren(schoolChildren);
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [school?.id]);

  const handleStartGame = () => {
    if (!selectedGame || !selectedChild) {
      return;
    }

    // Set child data in localStorage for games to use
    localStorage.setItem('selectedChild', JSON.stringify({
      id: selectedChild.id,
      name: selectedChild.name,
      dateOfBirth: selectedChild.dateOfBirth,
      age: selectedChild.age,
      gender: selectedChild.gender,
      height: selectedChild.height,
      weight: selectedChild.weight,
      grade: selectedChild.grade
    }));
    localStorage.setItem('selectedChildId', selectedChild.id.toString());

    // Navigate to game with childId in URL
    const gameUrl = `${selectedGame.route}?childId=${selectedChild.id}`;
    navigate(gameUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Playground</h1>
        </div>
        <p className="text-gray-600">
          Select a game and child to start playing. Game data will be saved for the selected child.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Select Game
            </CardTitle>
            <CardDescription>
              Choose a game to play
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {games.map((game) => {
                const Icon = game.icon;
                const isSelected = selectedGame?.id === game.id;
                return (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-blue-500 bg-gradient-to-r ${game.color} text-white shadow-lg`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {game.name}
                        </h3>
                        <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                          {game.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Child Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Child
            </CardTitle>
            <CardDescription>
              Choose a child to play the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No children enrolled in your school yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {children.map((child) => {
                  const isSelected = selectedChild?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {child.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Age: {child.age}</span>
                            <span>Grade: {child.grade}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Button */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleStartGame}
          disabled={!selectedGame || !selectedChild}
          size="lg"
          className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Gamepad2 className="mr-2 h-5 w-5" />
          Start Game
        </Button>
      </div>

      {(!selectedGame || !selectedChild) && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Please select both a game and a child to start playing.
        </div>
      )}
    </div>
  );
};

export default Playground;

