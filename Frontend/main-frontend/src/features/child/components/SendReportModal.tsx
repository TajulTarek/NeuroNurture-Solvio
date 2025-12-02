import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DoctorListItem, reportService } from '@/shared/services/reportService';
import { AlertCircle, CheckCircle, FileText, Loader2, Send, Stethoscope, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SendReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
  parentId: number;
  parentName: string;
  assignedDoctorId?: number | null;
  assignedDoctorName?: string | null;
  onReportSent: () => void;
}

const GAMES = [
  { id: 'gaze', name: 'Gaze Game', description: 'Eye tracking and attention assessment' },
  { id: 'gesture', name: 'Gesture Game', description: 'Hand gesture recognition' },
  { id: 'dance', name: 'Dance Doodle', description: 'Body movement and coordination' },
  { id: 'mirror', name: 'Mirror Posture', description: 'Facial expression mirroring' },
  { id: 'repeat', name: 'Repeat With Me', description: 'Speech and language assessment' },
];

export default function SendReportModal({
  isOpen,
  onClose,
  childId,
  childName,
  parentId,
  parentName,
  assignedDoctorId,
  assignedDoctorName,
  onReportSent,
}: SendReportModalProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState<DoctorListItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(assignedDoctorId || null);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && !assignedDoctorId) {
      loadVerifiedDoctors();
    }
  }, [isOpen, assignedDoctorId]);

  useEffect(() => {
    if (assignedDoctorId) {
      setSelectedDoctorId(assignedDoctorId);
    }
  }, [assignedDoctorId]);

  const loadVerifiedDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      const doctors = await reportService.getVerifiedDoctors();
      setVerifiedDoctors(doctors);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors list');
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleGameToggle = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const handleSendReport = async () => {
    if (selectedGames.length === 0) {
      setError('Please select at least one game');
      return;
    }

    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      // Fetch last 3 sessions for selected games
      const gameSessionsData = await reportService.fetchGameSessions(
        childId.toString(),
        selectedGames
      );

      // Send report
      await reportService.sendReport({
        childId,
        childName,
        parentId,
        parentName,
        doctorId: selectedDoctorId,
        selectedGames: JSON.stringify(selectedGames),
        gameSessionsData: JSON.stringify(gameSessionsData),
      });

      setSuccess(true);
      setTimeout(() => {
        onReportSent();
        onClose();
        setSuccess(false);
        setSelectedGames([]);
      }, 2000);
    } catch (err) {
      console.error('Error sending report:', err);
      setError('Failed to send report. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Send Performance Report</h2>
                <p className="text-sm text-gray-500">Send {childName}'s game data to a doctor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">Report sent successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Game Selection */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Select Games to Include</h3>
            <p className="text-sm text-gray-500 mb-3">
              Last 3 sessions from each selected game will be included.
            </p>
            <div className="space-y-2">
              {GAMES.map((game) => (
                <div
                  key={game.id}
                  className={`cursor-pointer transition-all rounded-lg border p-3 flex items-center space-x-3 ${
                    selectedGames.includes(game.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleGameToggle(game.id)}
                >
                  <Checkbox
                    checked={selectedGames.includes(game.id)}
                    onCheckedChange={() => handleGameToggle(game.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{game.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{game.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Select Doctor</h3>
            
            {assignedDoctorId && assignedDoctorName ? (
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3 flex items-center space-x-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{assignedDoctorName}</h4>
                  <p className="text-xs text-green-600">Assigned Doctor</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
            ) : isLoadingDoctors ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500 text-sm">Loading doctors...</span>
              </div>
            ) : verifiedDoctors.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No verified doctors available
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {verifiedDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`cursor-pointer transition-all rounded-lg border p-3 flex items-center space-x-3 ${
                      selectedDoctorId === doctor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h4>
                      <p className="text-xs text-gray-500">{doctor.specialization}</p>
                      <p className="text-xs text-gray-400 truncate">{doctor.hospital}</p>
                    </div>
                    {selectedDoctorId === doctor.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
          <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSendReport}
              disabled={isSending || selectedGames.length === 0 || !selectedDoctorId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

