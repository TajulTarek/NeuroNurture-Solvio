import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { PerformanceReportResponse, reportService } from '@/shared/services/reportService';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Gamepad2,
  HelpCircle,
  Loader2,
  RefreshCw,
  Send,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const GAME_NAMES: { [key: string]: string } = {
  gaze: 'Gaze Game',
  gesture: 'Gesture Game',
  dance: 'Dance Doodle',
  mirror: 'Mirror Posture',
  repeat: 'Repeat With Me',
};

const GAME_ICONS: { [key: string]: string } = {
  gaze: '👁️',
  gesture: '🤚',
  dance: '💃',
  mirror: '🪞',
  repeat: '🎤',
};

// Gesture names with emojis for display
const GESTURE_ITEMS: { key: string; name: string; emoji: string }[] = [
  { key: 'thumbs_up', name: 'Thumbs Up', emoji: '👍' },
  { key: 'thumbs_down', name: 'Thumbs Down', emoji: '👎' },
  { key: 'victory', name: 'Victory', emoji: '✌️' },
  { key: 'butterfly', name: 'Butterfly', emoji: '🦋' },
  { key: 'spectacle', name: 'Spectacle', emoji: '👓' },
  { key: 'heart', name: 'Heart', emoji: '❤️' },
  { key: 'pointing_up', name: 'Pointing Up', emoji: '☝️' },
  { key: 'iloveyou', name: 'I Love You', emoji: '🤟' },
  { key: 'dua', name: 'Dua', emoji: '🤲' },
  { key: 'closed_fist', name: 'Closed Fist', emoji: '✊' },
  { key: 'open_palm', name: 'Open Palm', emoji: '🖐️' },
];

// Dance poses with emojis
const DANCE_POSES: { key: string; name: string; emoji: string }[] = [
  { key: 'cool_arms', name: 'Cool Arms', emoji: '💪' },
  { key: 'open_wings', name: 'Open Wings', emoji: '🦅' },
  { key: 'silly_boxer', name: 'Silly Boxer', emoji: '🥊' },
  { key: 'happy_stand', name: 'Happy Stand', emoji: '😊' },
  { key: 'crossy_play', name: 'Crossy Play', emoji: '❌' },
  { key: 'shh_fun', name: 'Shh Fun', emoji: '🤫' },
  { key: 'stretch', name: 'Stretch', emoji: '🙆' },
];

// Mirror expressions with emojis
const MIRROR_EXPRESSIONS: { key: string; name: string; emoji: string }[] = [
  { key: 'lookingSideways', name: 'Looking Sideways', emoji: '👀' },
  { key: 'mouthOpen', name: 'Mouth Open', emoji: '😮' },
  { key: 'showingTeeth', name: 'Showing Teeth', emoji: '😁' },
  { key: 'kiss', name: 'Kiss', emoji: '😘' },
];

export default function PendingReports() {
  const { doctor } = useDoctorAuth();
  const [reports, setReports] = useState<PerformanceReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<{ [key: number]: string }>({});
  const [verdictSelection, setVerdictSelection] = useState<{ [key: number]: 'SCREENING_NEEDED' | 'NOT_NEEDED' | 'INCONCLUSIVE' | null }>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);

  useEffect(() => {
    if (doctor?.id) {
      loadReports();
    }
  }, [doctor?.id, activeTab]);

  const loadReports = async () => {
    if (!doctor?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      let data: PerformanceReportResponse[];
      if (activeTab === 'pending') {
        data = await reportService.getPendingReports(doctor.id);
      } else {
        const allReports = await reportService.getAllDoctorReports(doctor.id);
        data = allReports.filter((r) => r.status === 'REVIEWED');
      }
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseSelectedGames = (gamesJson: string): string[] => {
    try {
      return JSON.parse(gamesJson);
    } catch {
      return [];
    }
  };

  const parseGameSessionsData = (dataJson: string): any[] => {
    try {
      return JSON.parse(dataJson);
    } catch {
      return [];
    }
  };

  const toggleExpand = (reportId: number) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const handleSubmitResponse = async (reportId: number) => {
    const response = responseText[reportId];
    const verdict = verdictSelection[reportId];
    
    if (!response || response.trim() === '') {
      setError('Please provide your analysis and recommendations.');
      return;
    }
    
    if (!verdict) {
      setError('Please select a verdict (screening recommendation).');
      return;
    }

    try {
      setSubmittingId(reportId);
      setError(null);
      await reportService.respondToReport(reportId, response, verdict);
      setSubmitSuccess(reportId);

      // Refresh reports after a short delay
      setTimeout(() => {
        setSubmitSuccess(null);
        loadReports();
        setResponseText((prev) => ({ ...prev, [reportId]: '' }));
        setVerdictSelection((prev) => ({ ...prev, [reportId]: null }));
      }, 2000);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response');
    } finally {
      setSubmittingId(null);
    }
  };

  const getVerdictDisplay = (verdict: string | null) => {
    switch (verdict) {
      case 'SCREENING_NEEDED':
        return {
          label: 'Offline Screening Needed',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertTriangle,
        };
      case 'NOT_NEEDED':
        return {
          label: 'No Screening Needed',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
        };
      case 'INCONCLUSIVE':
        return {
          label: 'Inconclusive - More Data Required',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: HelpCircle,
        };
      default:
        return null;
    }
  };

  // Render Gaze Game Session Card
  const renderGazeSession = (session: any, sessionIndex: number) => {
    const totalBalloons = (session.round1Count || 0) + (session.round2Count || 0) + (session.round3Count || 0);
    
    return (
      <div className="border-2 border-blue-200 rounded-xl p-4 hover:bg-blue-50/30 transition-colors bg-white">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-blue-600 text-sm">
              Session {sessionIndex + 1}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(session.dateTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              🎈 {totalBalloons}
            </div>
            <div className="text-xs text-gray-500">
              Total Balloons
            </div>
          </div>
        </div>
        
        {/* Round Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{session.round1Count || 0}</div>
            <div className="text-xs text-gray-600">Round 1</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{session.round2Count || 0}</div>
            <div className="text-xs text-gray-600">Round 2</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{session.round3Count || 0}</div>
            <div className="text-xs text-gray-600">Round 3</div>
          </div>
        </div>
      </div>
    );
  };

  // Render Gesture Game Session Card
  const renderGestureSession = (session: any, sessionIndex: number) => {
    const completedGestures = GESTURE_ITEMS.filter(g => session[g.key] !== null && session[g.key] !== undefined);
    const totalTime = completedGestures.reduce((sum, g) => sum + (session[g.key] || 0), 0);
    const avgTime = completedGestures.length > 0 ? totalTime / completedGestures.length : 0;
    const completionRate = (completedGestures.length / GESTURE_ITEMS.length) * 100;

    return (
      <div className="border-2 border-purple-200 rounded-xl p-4 hover:bg-purple-50/30 transition-colors bg-white">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-purple-600 text-sm">
              Session {sessionIndex + 1}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(session.dateTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-purple-600">
              ⏱️ {avgTime.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500">
              Avg Time
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-bold text-blue-600">{completedGestures.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-bold text-purple-600">{totalTime.toFixed(1)}s</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>

        {/* Gesture Breakdown */}
        <div className="border-t pt-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Gesture Performance:</div>
          <div className="grid grid-cols-2 gap-2">
            {GESTURE_ITEMS.map((gesture) => {
              const time = session[gesture.key];
              const isCompleted = time !== null && time !== undefined;
              
              return (
                <div key={gesture.key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{gesture.emoji}</span>
                    <span className="text-gray-700 font-medium">{gesture.name}</span>
                  </div>
                  <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                    {isCompleted ? `${time.toFixed(1)}s` : '✗'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Dance Game Session Card
  const renderDanceSession = (session: any, sessionIndex: number) => {
    const completedPoses = DANCE_POSES.filter(p => session[p.key] !== null && session[p.key] !== undefined);
    const totalTime = completedPoses.reduce((sum, p) => sum + (session[p.key] || 0), 0);
    const avgTime = completedPoses.length > 0 ? totalTime / completedPoses.length : 0;
    const completionRate = (completedPoses.length / DANCE_POSES.length) * 100;

    return (
      <div className="border-2 border-pink-200 rounded-xl p-4 hover:bg-pink-50/30 transition-colors bg-white">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-pink-600 text-sm">
              Session {sessionIndex + 1}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(session.dateTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-pink-600">
              💃 {avgTime.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500">
              Avg Time
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-bold text-blue-600">{completedPoses.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-2 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-sm font-bold text-pink-600">{totalTime.toFixed(1)}s</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>

        {/* Pose Breakdown */}
        <div className="border-t pt-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Pose Performance:</div>
          <div className="grid grid-cols-2 gap-2">
            {DANCE_POSES.map((pose) => {
              const time = session[pose.key];
              const isCompleted = time !== null && time !== undefined;
              
              return (
                <div key={pose.key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{pose.emoji}</span>
                    <span className="text-gray-700 font-medium">{pose.name}</span>
                  </div>
                  <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                    {isCompleted ? `${time.toFixed(1)}s` : '✗'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Mirror Game Session Card
  const renderMirrorSession = (session: any, sessionIndex: number) => {
    const completedExpressions = MIRROR_EXPRESSIONS.filter(e => session[e.key] !== null && session[e.key] !== undefined);
    const totalTime = completedExpressions.reduce((sum, e) => sum + (session[e.key] || 0), 0);
    const avgTime = completedExpressions.length > 0 ? totalTime / completedExpressions.length : 0;
    const completionRate = (completedExpressions.length / MIRROR_EXPRESSIONS.length) * 100;

    return (
      <div className="border-2 border-cyan-200 rounded-xl p-4 hover:bg-cyan-50/30 transition-colors bg-white">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-cyan-600 text-sm">
              Session {sessionIndex + 1}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(session.dateTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-cyan-600">
              🪞 {avgTime.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500">
              Avg Time
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-bold text-blue-600">{completedExpressions.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-2 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="text-sm font-bold text-cyan-600">{totalTime.toFixed(1)}s</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>

        {/* Expression Breakdown */}
        <div className="border-t pt-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Expression Performance:</div>
          <div className="grid grid-cols-2 gap-2">
            {MIRROR_EXPRESSIONS.map((expr) => {
              const time = session[expr.key];
              const isCompleted = time !== null && time !== undefined;
              
              return (
                <div key={expr.key} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{expr.emoji}</span>
                    <span className="text-gray-700 font-medium">{expr.name}</span>
                  </div>
                  <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                    {isCompleted ? `${time.toFixed(1)}s` : '✗'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Repeat With Me Session Card
  const renderRepeatSession = (session: any, sessionIndex: number) => {
    const roundScores = [
      session.round1Score,
      session.round2Score,
      session.round3Score,
      session.round4Score,
      session.round5Score,
      session.round6Score,
    ].filter(s => s !== null && s !== undefined);
    
    const avgScore = session.averageScore || (roundScores.length > 0 ? roundScores.reduce((a, b) => a + b, 0) / roundScores.length : 0);
    const completedRounds = session.completedRounds || roundScores.length;

    return (
      <div className="border-2 border-orange-200 rounded-xl p-4 hover:bg-orange-50/30 transition-colors bg-white">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-orange-600 text-sm">
              Session {sessionIndex + 1}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(session.dateTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-600">
              🎤 {avgScore.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">
              Avg Score
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">{completedRounds}</div>
            <div className="text-xs text-gray-600">Rounds Completed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{avgScore.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Round Scores */}
        <div className="border-t pt-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Round Scores:</div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((round) => {
              const score = session[`round${round}Score`];
              const hasScore = score !== null && score !== undefined;
              
              return (
                <div key={round} className={`text-center p-2 rounded-lg text-xs ${
                  hasScore ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`font-bold ${hasScore ? 'text-green-600' : 'text-gray-400'}`}>
                    {hasScore ? `${score.toFixed(0)}%` : '-'}
                  </div>
                  <div className="text-gray-500">Round {round}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Main render function for game sessions
  const renderGameSession = (gameType: string, session: any, sessionIndex: number) => {
    switch (gameType) {
      case 'gaze':
        return renderGazeSession(session, sessionIndex);
      case 'gesture':
        return renderGestureSession(session, sessionIndex);
      case 'dance':
        return renderDanceSession(session, sessionIndex);
      case 'mirror':
        return renderMirrorSession(session, sessionIndex);
      case 'repeat':
        return renderRepeatSession(session, sessionIndex);
      default:
        return (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="text-sm text-gray-500">Session {sessionIndex + 1}</div>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(session, null, 2)}</pre>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-500">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Reports</h1>
          <p className="text-gray-600">
            Review child performance data sent by parents and provide your professional analysis.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviewed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Reviewed</span>
            </div>
          </button>
          <Button variant="outline" onClick={loadReports} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab === 'pending' ? 'Pending' : 'Reviewed'} Reports
              </h4>
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? 'You have no pending reports to review.'
                  : 'You have not reviewed any reports yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const selectedGames = parseSelectedGames(report.selectedGames);
              const gameSessionsData = parseGameSessionsData(report.gameSessionsData);
              const isExpanded = expandedReportId === report.id;

              return (
                <Card key={report.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Report Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              report.status === 'REVIEWED' ? 'bg-green-100' : 'bg-purple-100'
                            }`}
                          >
                            <User
                              className={`w-6 h-6 ${
                                report.status === 'REVIEWED' ? 'text-green-600' : 'text-purple-600'
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.childName}</h3>
                            <p className="text-sm text-gray-500">
                              From: {report.parentName || 'Parent'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(report.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <Gamepad2 className="w-4 h-4 mr-1" />
                                {selectedGames.length} game(s)
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              report.status === 'REVIEWED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {report.status === 'REVIEWED' ? 'Reviewed' : 'Pending'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {/* Games Included */}
                        <div className="p-4 bg-gray-50">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Games Included</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedGames.map((gameId) => (
                              <span
                                key={gameId}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1.5"
                              >
                                <span>{GAME_ICONS[gameId] || '🎮'}</span>
                                {GAME_NAMES[gameId] || gameId}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Game Sessions Data */}
                        <div className="p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                            <span className="mr-2">📚</span>
                            Session History (Last 3 Sessions per Game)
                          </h5>
                          <div className="space-y-6">
                            {gameSessionsData.map((gameData: any, index: number) => (
                              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-100">
                                <h6 className="font-semibold text-gray-900 mb-4 flex items-center text-base">
                                  <span className="text-xl mr-2">{GAME_ICONS[gameData.gameType] || '🎮'}</span>
                                  {gameData.gameName}
                                </h6>
                                {gameData.sessions.length === 0 ? (
                                  <div className="text-center py-6 text-gray-500">
                                    <div className="text-3xl mb-2">📭</div>
                                    <p className="text-sm">No sessions available for this game</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {gameData.sessions.map((session: any, sessionIndex: number) => (
                                      <div key={sessionIndex}>
                                        {renderGameSession(gameData.gameType, session, sessionIndex)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Response Section */}
                        {report.status === 'PENDING' && (
                          <div className="p-4 bg-purple-50 border-t border-purple-200">
                            <h5 className="text-sm font-medium text-purple-800 mb-3">
                              Your Analysis & Response
                            </h5>

                            {submitSuccess === report.id ? (
                              <div className="bg-green-100 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-green-700">Response submitted successfully!</span>
                              </div>
                            ) : (
                              <>
                                <Textarea
                                  placeholder="Write your professional analysis and recommendations based on the game performance data..."
                                  value={responseText[report.id] || ''}
                                  onChange={(e) =>
                                    setResponseText((prev) => ({
                                      ...prev,
                                      [report.id]: e.target.value,
                                    }))
                                  }
                                  className="min-h-[120px] mb-4"
                                />
                                
                                {/* Verdict Selection */}
                                <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                                  <Label className="text-sm font-medium text-purple-800 mb-3 block">
                                    Screening Verdict *
                                  </Label>
                                  <RadioGroup
                                    value={verdictSelection[report.id] || ''}
                                    onValueChange={(value) =>
                                      setVerdictSelection((prev) => ({
                                        ...prev,
                                        [report.id]: value as 'SCREENING_NEEDED' | 'NOT_NEEDED' | 'INCONCLUSIVE',
                                      }))
                                    }
                                    className="space-y-3"
                                  >
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                                      <RadioGroupItem value="SCREENING_NEEDED" id={`screening-${report.id}`} />
                                      <Label htmlFor={`screening-${report.id}`} className="flex items-center cursor-pointer flex-1">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                        <div>
                                          <span className="font-medium text-red-700">Offline Screening Needed</span>
                                          <p className="text-xs text-red-600">Recommend in-person evaluation</p>
                                        </div>
                                      </Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                                      <RadioGroupItem value="NOT_NEEDED" id={`not-needed-${report.id}`} />
                                      <Label htmlFor={`not-needed-${report.id}`} className="flex items-center cursor-pointer flex-1">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        <div>
                                          <span className="font-medium text-green-700">No Screening Needed</span>
                                          <p className="text-xs text-green-600">Performance within normal range</p>
                                        </div>
                                      </Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer">
                                      <RadioGroupItem value="INCONCLUSIVE" id={`inconclusive-${report.id}`} />
                                      <Label htmlFor={`inconclusive-${report.id}`} className="flex items-center cursor-pointer flex-1">
                                        <HelpCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                        <div>
                                          <span className="font-medium text-yellow-700">Inconclusive</span>
                                          <p className="text-xs text-yellow-600">More data required for assessment</p>
                                        </div>
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                
                                <Button
                                  onClick={() => handleSubmitResponse(report.id)}
                                  disabled={
                                    submittingId === report.id ||
                                    !responseText[report.id]?.trim() ||
                                    !verdictSelection[report.id]
                                  }
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {submittingId === report.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      Submit Response & Verdict
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Show existing response for reviewed reports */}
                        {report.status === 'REVIEWED' && report.doctorResponse && (
                          <div className="p-4 bg-green-50 border-t border-green-200">
                            <h5 className="text-sm font-medium text-green-800 mb-2">
                              Your Response
                            </h5>
                            {report.reviewedAt && (
                              <p className="text-xs text-green-600 mb-2">
                                Submitted on {formatDate(report.reviewedAt)}
                              </p>
                            )}
                            
                            {/* Verdict Display */}
                            {report.verdict && (
                              <div className="mb-3">
                                {(() => {
                                  const verdictInfo = getVerdictDisplay(report.verdict);
                                  if (!verdictInfo) return null;
                                  const VerdictIcon = verdictInfo.icon;
                                  return (
                                    <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${verdictInfo.color}`}>
                                      <VerdictIcon className="w-5 h-5 mr-2" />
                                      <span className="font-medium">{verdictInfo.label}</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                            
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {report.doctorResponse}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
