'use client'

import { useState, useEffect } from 'react'
import { InterviewRecord, ImprovementItem } from '../../types/interview'
import { interviewService, improvementService } from '../../lib/supabase'
import { CheckCircle, Circle, Calendar, Clock, TrendingUp, Filter, Search, ChevronDown } from 'lucide-react'
import { formatDateToChinese } from '../../lib/dateUtils'

interface TodoStats {
  total: number
  completed: number
  pending: number
  overdue: number
  highPriority: number
}

interface TodoWithSource extends ImprovementItem {
  interviewId: string
  company: string
  position: string
  interviewDate: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<TodoWithSource[]>([])
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high' | 'overdue'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'company'>('priority')
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const interviews = await interviewService.getAllInterviews()
      
      // 聚合所有待办项
      const allTodos: TodoWithSource[] = []
      
      interviews.forEach(interview => {
        if (interview.analysis?.improvements) {
          interview.analysis.improvements.forEach(improvement => {
            allTodos.push({
              ...improvement,
              interviewId: interview.id,
              company: interview.company,
              position: interview.position,
              interviewDate: interview.interviewDate
            })
          })
        }
      })
      
      setTodos(allTodos)
      calculateStats(allTodos)
    } catch (error) {
      console.error('加载待办项失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (todoList: TodoWithSource[]) => {
    const now = new Date()
    const stats: TodoStats = {
      total: todoList.length,
      completed: todoList.filter(todo => todo.completed).length,
      pending: todoList.filter(todo => !todo.completed).length,
      overdue: todoList.filter(todo => 
        !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
      ).length,
      highPriority: todoList.filter(todo => 
        !todo.completed && todo.priority === 'high'
      ).length
    }
    setStats(stats)
  }

  const handleToggleComplete = async (todo: TodoWithSource) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(todo.id))
      
      const success = await improvementService.updateImprovementStatus(
        todo.interviewId,
        todo.id,
        !todo.completed
      )
      
      if (success) {
        setTodos(prevTodos => 
          prevTodos.map(t => 
            t.id === todo.id ? { ...t, completed: !t.completed } : t
          )
        )
        calculateStats(todos.map(t => 
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      console.error('更新待办项状态失败:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(todo.id)
        return newSet
      })
    }
  }

  const getFilteredTodos = () => {
    let filtered = todos

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态过滤
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(todo => !todo.completed)
        break
      case 'completed':
        filtered = filtered.filter(todo => todo.completed)
        break
      case 'high':
        filtered = filtered.filter(todo => !todo.completed && todo.priority === 'high')
        break
      case 'overdue':
        const now = new Date()
        filtered = filtered.filter(todo => 
          !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
        )
        break
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'date':
          return new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime()
        case 'company':
          return a.company.localeCompare(b.company)
        default:
          return 0
      }
    })

    return filtered
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级'
      case 'medium': return '中优先级'
      case 'low': return '低优先级'
      default: return '中优先级'
    }
  }

  const getProgressPercentage = () => {
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载待办项...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">待办管理中心</h1>
        <p className="text-gray-600">统一管理所有面试改进建议，追踪个人成长进度</p>
      </div>

      {/* 统计仪表板 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总计</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar size={16} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待完成</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Circle size={16} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">高优先级</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingUp size={16} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">进度</p>
              <p className="text-2xl font-bold text-purple-600">{getProgressPercentage()}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索待办项、公司或职位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* 状态筛选 */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部', count: stats.total },
              { key: 'pending', label: '待完成', count: stats.pending },
              { key: 'completed', label: '已完成', count: stats.completed },
              { key: 'high', label: '高优先级', count: stats.highPriority },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filter === key
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* 排序选择 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="priority">按优先级排序</option>
              <option value="date">按日期排序</option>
              <option value="company">按公司排序</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 待办项列表 */}
      <div className="space-y-4">
        {getFilteredTodos().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">暂无待办项</h3>
            <p className="text-gray-500">
              {filter === 'all' ? '还没有任何改进建议' : '当前筛选条件下没有待办项'}
            </p>
          </div>
        ) : (
          getFilteredTodos().map(todo => (
            <div key={todo.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* 完成状态按钮 */}
                <button
                  onClick={() => handleToggleComplete(todo)}
                  className="mt-1 flex-shrink-0"
                  disabled={updatingItems.has(todo.id)}
                >
                  {updatingItems.has(todo.id) ? (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : todo.completed ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-gray-400 hover:text-primary-500" />
                  )}
                </button>

                {/* 待办项内容 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {todo.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
                      {getPriorityText(todo.priority)}
                    </span>
                  </div>

                  {/* 来源信息 */}
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <span className="mr-1">🏢</span>
                      {todo.company} - {todo.position}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {formatDateToChinese(todo.interviewDate)}
                    </span>
                    {todo.dueDate && (
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        截止：{formatDateToChinese(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 快速操作 */}
      {getFilteredTodos().filter(todo => !todo.completed).length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">💡 快速操作建议</h3>
          <div className="space-y-2 text-sm text-blue-800">
            {stats.highPriority > 0 && (
              <p>• 你有 {stats.highPriority} 个高优先级待办项需要优先处理</p>
            )}
            {stats.overdue > 0 && (
              <p>• 有 {stats.overdue} 个待办项已过期，建议及时处理</p>
            )}
            {stats.pending > 0 && stats.completed > 0 && (
              <p>• 已完成 {getProgressPercentage()}% 的改进目标，继续保持！</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}