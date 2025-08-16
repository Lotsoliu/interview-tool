'use client'

import { useState } from 'react'
import { InterviewRecord, ImprovementItem } from '../types/interview'
import { Edit, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { improvementService } from '../lib/supabase'
import { formatDateToChinese, debugDate } from '../lib/dateUtils'

interface InterviewListProps {
  interviews: InterviewRecord[]
  onUpdate: (interview: InterviewRecord) => void
  onDelete: (id: string) => void
}

export default function InterviewList({ interviews, onUpdate, onDelete }: InterviewListProps) {
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set())
  const [editingInterview, setEditingInterview] = useState<InterviewRecord | null>(null)
  const [updatingImprovements, setUpdatingImprovements] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedInterviews)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedInterviews(newExpanded)
  }

  const handleEdit = (interview: InterviewRecord) => {
    setEditingInterview(interview)
  }

  const handleSaveEdit = () => {
    if (editingInterview) {
      onUpdate({
        ...editingInterview,
        updatedAt: new Date().toISOString()
      })
      setEditingInterview(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingInterview(null)
  }

  const handleImprovementToggle = async (interviewId: string, improvementId: string, currentCompleted: boolean) => {
    try {
      setUpdatingImprovements(prev => new Set(prev).add(improvementId))
      
      const success = await improvementService.updateImprovementStatus(
        interviewId, 
        improvementId, 
        !currentCompleted
      )
      
      if (success) {
        // 更新本地状态
        const updatedInterview = interviews.find(interview => interview.id === interviewId)
        if (updatedInterview && updatedInterview.analysis) {
          const updatedImprovements = updatedInterview.analysis.improvements.map(item =>
            item.id === improvementId ? { ...item, completed: !currentCompleted } : item
          )
          
          onUpdate({
            ...updatedInterview,
            analysis: {
              ...updatedInterview.analysis,
              improvements: updatedImprovements
            }
          })
        }
      }
    } catch (error) {
      console.error('更新改进建议状态失败:', error)
    } finally {
      setUpdatingImprovements(prev => {
        const newSet = new Set(prev)
        newSet.delete(improvementId)
        return newSet
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-danger-600 bg-danger-50'
      case 'medium': return 'text-warning-600 bg-warning-50'
      case 'low': return 'text-success-600 bg-success-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '中'
    }
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">暂无面试记录</h3>
        <p className="text-gray-500">点击"添加面试记录"开始记录你的面试经历</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interviews.map(interview => (
        <div key={interview.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{interview.company}</h3>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm font-medium text-primary-600">{interview.position}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>面试时间：{formatDateToChinese(interview.interviewDate)}</span>
                {interview.analysis && (
                                      <div className="flex items-center space-x-3">
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                          💡 共 {interview.analysis.improvements.length} 项建议
                        </span>
                        <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={12} className="mr-1" />
                          已完成 {interview.analysis.improvements.filter(imp => imp.completed).length}
                        </span>
                        <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          <Circle size={12} className="mr-1" />
                          待改进 {interview.analysis.improvements.filter(imp => !imp.completed).length}
                        </span>
                      </div>
                    </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(interview)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(interview.id)}
                className="p-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => toggleExpanded(interview.id)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title={expandedInterviews.has(interview.id) ? '收起详情' : '查看详情'}
              >
                {expandedInterviews.has(interview.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {expandedInterviews.has(interview.id) && (
            <div className="space-y-6 pt-4 border-t border-gray-200">
              {/* 面试过程记录 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">📝 面试过程记录</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{interview.interviewProcess}</p>
              </div>

              {/* AI分析结果 */}
              {interview.analysis && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-800 text-lg border-b border-gray-200 pb-2">🤖 AI分析结果</h4>
                  
                  {/* 优点和缺点 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        优点 ({interview.analysis.strengths.length}项)
                      </h5>
                      <ul className="space-y-2">
                        {interview.analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                        <span className="text-orange-600 mr-2">⚠</span>
                        需要改进 ({interview.analysis.weaknesses.length}项)
                      </h5>
                      <ul className="space-y-2">
                        {interview.analysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-orange-700 flex items-start">
                            <Circle size={14} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 改进建议 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="text-blue-600 mr-2">💡</span>
                      改进建议 ({interview.analysis.improvements.length}项)
                    </h5>
                    <div className="space-y-3">
                      {interview.analysis.improvements.map((improvement) => (
                        <div key={improvement.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                          <button
                            onClick={() => handleImprovementToggle(interview.id, improvement.id, improvement.completed)}
                            className="mt-1"
                            disabled={updatingImprovements.has(improvement.id)}
                          >
                            {updatingImprovements.has(improvement.id) ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : improvement.completed ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <Circle size={16} className="text-blue-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h6 className={`font-medium ${improvement.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {improvement.title}
                              </h6>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(improvement.priority)}`}>
                                {getPriorityText(improvement.priority)}优先级
                              </span>
                            </div>
                            <p className={`text-sm ${improvement.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                              {improvement.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 整体评分 */}
                  {interview.analysis.overallScore && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-800 mb-3">📊 整体评分</h5>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-purple-600">
                          {interview.analysis.overallScore}/10
                        </span>
                        <div className="ml-3 flex-1 bg-white rounded-full h-3">
                          <div 
                            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(interview.analysis.overallScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 总结 */}
                  {interview.analysis.summary && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-3">📝 总结</h5>
                      <p className="text-sm text-gray-700">
                        {interview.analysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* 编辑模态框 */}
      {editingInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">编辑面试记录</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    value={editingInterview.company}
                    onChange={(e) => setEditingInterview({...editingInterview, company: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">应聘职位</label>
                  <input
                    type="text"
                    value={editingInterview.position}
                    onChange={(e) => setEditingInterview({...editingInterview, position: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试时间</label>
                  <input
                    type="date"
                    value={editingInterview.interviewDate}
                    onChange={(e) => setEditingInterview({...editingInterview, interviewDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试过程记录</label>
                  <textarea
                    value={editingInterview.interviewProcess}
                    onChange={(e) => setEditingInterview({...editingInterview, interviewProcess: e.target.value})}
                    className="input-field min-h-[120px] resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={handleCancelEdit} className="btn-secondary">
                  取消
                </button>
                <button onClick={handleSaveEdit} className="btn-primary">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
