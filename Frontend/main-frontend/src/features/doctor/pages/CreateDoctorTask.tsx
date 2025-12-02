import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { DoctorChild, doctorChildrenService } from '@/shared/services/doctor/doctorChildrenService';
import { DoctorTaskCreateRequest, DoctorTaskService } from '@/shared/services/doctorTaskService';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Clock,
    Save,
    Target,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const CreateDoctorTask: React.FC = () => {
  const navigate = useNavigate();
  const { doctor } = useDoctorAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<DoctorChild[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  const [formData, setFormData] = useState<DoctorTaskCreateRequest>({
    taskTitle: '',
    taskDescription: '',
    startTime: '',
    endTime: '',
    childIds: [],
    selectedGames: []
  });

  // Available games
  const availableGames = [
    'Dance Doodle',
    'Gaze Game', 
    'Gesture Game',
    'Mirror Posture Game',
    'Repeat With Me Game'
  ];

  // Fetch children for this doctor
  useEffect(() => {
    const fetchChildren = async () => {
      if (!doctor?.id) return;

      try {
        setIsLoadingChildren(true);
        console.log('Fetching children for doctor ID:', doctor.id);
        const childrenData = await doctorChildrenService.getChildrenByDoctor(parseInt(doctor.id));
        setChildren(childrenData);
        console.log('Children loaded:', childrenData);
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children. Please try again.');
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [doctor?.id]);

  const handleInputChange = (field: keyof DoctorTaskCreateRequest, value: string | string[] | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChildSelection = (childId: number, checked: boolean) => {
    if (checked) {
      setSelectedChildren(prev => [...prev, childId]);
    } else {
      setSelectedChildren(prev => prev.filter(id => id !== childId));
    }
  };

  const handleGameSelection = (game: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedGames: [...prev.selectedGames, game]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedGames: prev.selectedGames.filter(g => g !== game)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskTitle.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (!formData.taskDescription.trim()) {
      setError('Task description is required');
      return;
    }
    
    if (selectedChildren.length === 0) {
      setError('Please select at least one child');
      return;
    }
    
    if (formData.selectedGames.length === 0) {
      setError('Please select at least one game');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestData: DoctorTaskCreateRequest = {
        ...formData,
        childIds: selectedChildren
      };

      console.log('Creating task with data:', requestData);
      await DoctorTaskService.createTasks(requestData, parseInt(doctor.id));
      
      navigate('/doctor/tasks');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/doctor/tasks')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Therapeutic Task</h1>
              <p className="text-gray-600 mt-2">Assign therapeutic tasks to your patients</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Task Information
              </CardTitle>
              <CardDescription>
                Provide basic details about the therapeutic task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title *</Label>
                  <Input
                    id="taskTitle"
                    value={formData.taskTitle}
                    onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">Task Description *</Label>
                <Textarea
                  id="taskDescription"
                  value={formData.taskDescription}
                  onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                  placeholder="Describe what the child needs to do"
                  rows={3}
                  required
                />
              </div>

            </CardContent>
          </Card>

          {/* Child Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Assign to Children
              </CardTitle>
              <CardDescription>
                Select which children should complete this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChildren ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600">Loading children...</span>
                  </div>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No children assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any children assigned to you yet. Contact the admin to get children assigned to your account.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={`child-${child.id}`}
                        checked={selectedChildren.includes(child.id)}
                        onCheckedChange={(checked) => handleChildSelection(child.id, checked as boolean)}
                      />
                       <Label htmlFor={`child-${child.id}`} className="flex-1 cursor-pointer">
                         <div>
                           <div className="font-medium">{child.name}</div>
                           <div className="text-sm text-gray-500">
                             {child.age} years old • {child.gender}
                           </div>
                           <div className="text-xs text-gray-400">
                             Parent: {child.parentName} • Problem: {child.problem}
                           </div>
                         </div>
                       </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Games</CardTitle>
              <CardDescription>
                Choose which games the children should play for this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableGames.map((game) => (
                  <div key={game} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`game-${game}`}
                      checked={formData.selectedGames.includes(game)}
                      onCheckedChange={(checked) => handleGameSelection(game, checked as boolean)}
                    />
                    <Label htmlFor={`game-${game}`} className="flex-1 cursor-pointer">
                      {game}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
              <CardDescription>
                Set when the task should start and end
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/doctor/tasks')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDoctorTask;
