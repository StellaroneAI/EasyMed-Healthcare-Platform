import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
  target: { min: number; max: number };
  history: { date: string; value: number }[];
}

interface HealthGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'fitness' | 'nutrition' | 'medication' | 'lifestyle';
}

interface HealthInsight {
  id: string;
  type: 'warning' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function HealthAnalytics() {
  const { currentLanguage, getText } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading health data
    const loadHealthData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock health metrics data
      setHealthMetrics([
        {
          id: 'heart_rate',
          name: 'Heart Rate',
          value: 72,
          unit: 'bpm',
          trend: 'stable',
          status: 'normal',
          target: { min: 60, max: 100 },
          history: generateHealthHistory(70, 10, 7)
        },
        {
          id: 'blood_pressure',
          name: 'Blood Pressure',
          value: 125,
          unit: 'mmHg',
          trend: 'up',
          status: 'warning',
          target: { min: 90, max: 120 },
          history: generateHealthHistory(120, 15, 7)
        },
        {
          id: 'weight',
          name: 'Weight',
          value: 68.5,
          unit: 'kg',
          trend: 'down',
          status: 'normal',
          target: { min: 65, max: 75 },
          history: generateHealthHistory(70, 3, 7)
        },
        {
          id: 'steps',
          name: 'Daily Steps',
          value: 8500,
          unit: 'steps',
          trend: 'up',
          status: 'normal',
          target: { min: 8000, max: 12000 },
          history: generateHealthHistory(8000, 2000, 7)
        },
        {
          id: 'sleep',
          name: 'Sleep Duration',
          value: 7.2,
          unit: 'hours',
          trend: 'stable',
          status: 'normal',
          target: { min: 7, max: 9 },
          history: generateHealthHistory(7.5, 1, 7)
        },
        {
          id: 'water',
          name: 'Water Intake',
          value: 2.1,
          unit: 'liters',
          trend: 'down',
          status: 'warning',
          target: { min: 2.5, max: 3.5 },
          history: generateHealthHistory(2.5, 0.5, 7)
        }
      ]);

      // Mock health goals
      setHealthGoals([
        {
          id: 'weight_loss',
          title: 'Lose Weight',
          target: 65,
          current: 68.5,
          unit: 'kg',
          deadline: '2025-09-30',
          category: 'fitness'
        },
        {
          id: 'daily_steps',
          title: 'Daily Steps Goal',
          target: 10000,
          current: 8500,
          unit: 'steps',
          deadline: '2025-08-31',
          category: 'fitness'
        },
        {
          id: 'water_intake',
          title: 'Hydration Goal',
          target: 3,
          current: 2.1,
          unit: 'liters/day',
          deadline: '2025-08-15',
          category: 'nutrition'
        },
        {
          id: 'medication',
          title: 'Medication Adherence',
          target: 100,
          current: 85,
          unit: '%',
          deadline: '2025-12-31',
          category: 'medication'
        }
      ]);

      // Mock AI insights
      setInsights([
        {
          id: 'bp_trend',
          type: 'warning',
          title: 'Blood Pressure Trending Up',
          description: 'Your blood pressure has increased by 8% over the past week. Consider reducing sodium intake and increasing physical activity.',
          action: 'Schedule appointment with cardiologist',
          priority: 'medium'
        },
        {
          id: 'sleep_achievement',
          type: 'achievement',
          title: 'Consistent Sleep Schedule!',
          description: 'Great job! You\'ve maintained 7+ hours of sleep for 5 consecutive days.',
          priority: 'low'
        },
        {
          id: 'hydration_low',
          type: 'recommendation',
          title: 'Increase Water Intake',
          description: 'You\'re averaging 30% below your hydration goal. Set hourly reminders to drink water.',
          action: 'Set water reminders',
          priority: 'medium'
        },
        {
          id: 'exercise_streak',
          type: 'achievement',
          title: '7-Day Activity Streak!',
          description: 'Congratulations! You\'ve reached your step goal for 7 consecutive days.',
          priority: 'low'
        }
      ]);

      setIsLoading(false);
    };

    loadHealthData();
  }, [timeRange]);

  const generateHealthHistory = (baseValue: number, variance: number, days: number) => {
    const history = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const randomVariation = (Math.random() - 0.5) * variance;
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.round((baseValue + randomVariation) * 10) / 10
      });
    }
    return history;
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'nutrition': return '🥗';
      case 'medication': return '💊';
      case 'lifestyle': return '🌟';
      default: return '📊';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'recommendation': return '💡';
      case 'achievement': return '🏆';
      default: return 'ℹ️';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Health Analytics</h2>
          <p className="text-gray-500">Analyzing your health data and generating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📊 Smart Health Analytics</h1>
        <p className="text-blue-100">AI-powered insights into your health trends and patterns</p>
        
        {/* Time Range Selector */}
        <div className="mt-4 flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '3 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'metrics', name: 'Metrics', icon: '📈' },
            { id: 'goals', name: 'Goals', icon: '🎯' },
            { id: 'insights', name: 'AI Insights', icon: '🧠' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.slice(0, 6).map((metric) => (
              <div key={metric.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{metric.name}</h3>
                  <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-sm text-gray-600 mb-1">{metric.unit}</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(metric.status)}`}>
                  {metric.status === 'normal' ? '✅' : metric.status === 'warning' ? '⚠️' : '🚨'} {metric.status}
                </div>
                
                {/* Mini chart */}
                <div className="mt-4 h-16 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-end justify-between h-full">
                    {metric.history.slice(-7).map((point, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-t w-2"
                        style={{
                          height: `${(point.value / Math.max(...metric.history.map(h => h.value))) * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Insights */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔮 Recent AI Insights</h2>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                  insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                          {insight.action} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {healthMetrics.map((metric) => (
              <div key={metric.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{metric.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMetricColor(metric.status)}`}>
                    {metric.status}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-gray-600">{metric.unit}</div>
                  <div className="flex items-center space-x-1">
                    <span>{getTrendIcon(metric.trend)}</span>
                    <span className="text-sm text-gray-600">
                      {metric.trend === 'up' ? 'Increasing' : metric.trend === 'down' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </div>

                {/* Target Range */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Target Range</span>
                    <span>{metric.target.min} - {metric.target.max} {metric.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.value >= metric.target.min && metric.value <= metric.target.max
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((metric.value / metric.target.max) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* History Chart */}
                <div className="h-32 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-end justify-between h-full space-x-1">
                    {metric.history.map((point, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="bg-blue-500 rounded-t w-full"
                          style={{
                            height: `${(point.value / Math.max(...metric.history.map(h => h.value))) * 100}%`,
                            minHeight: '4px'
                          }}
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(point.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {Math.round((goal.current / goal.target) * 100)}% Complete
                    </span>
                    <span className="text-gray-600">
                      {goal.target - goal.current > 0 
                        ? `${Math.round((goal.target - goal.current) * 10) / 10} ${goal.unit} to go`
                        : 'Goal achieved! 🎉'
                      }
                    </span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Progress
                </button>
              </div>
            ))}
          </div>

          {/* Add New Goal */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-green-300">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🎯</span>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Set a New Health Goal</h3>
              <p className="text-gray-600 mb-4">Track your progress towards better health</p>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                + Add New Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🧠 AI-Powered Health Insights</h2>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-6 rounded-xl border-l-4 ${
                  insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                  insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                          insight.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {insight.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      {insight.action && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">🏆 Overall Health Score</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">78/100</div>
                <p className="text-purple-100">Good - Keep up the great work!</p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
