import { format, parseISO, isValid } from 'date-fns'

/**
 * 安全的日期格式化函数
 * @param dateString 日期字符串或Date对象
 * @param formatString 格式化字符串
 * @returns 格式化后的日期字符串或错误提示
 */
export const safeFormatDate = (dateString: string | Date, formatString: string): string => {
  try {
    if (!dateString) {
      return '日期为空'
    }

    // 尝试解析日期
    let date: Date
    
    // 如果已经是Date对象
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'string') {
      // 如果是ISO格式的字符串，使用parseISO
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = parseISO(dateString)
      } else {
        // 否则使用new Date()
        date = new Date(dateString)
      }
    } else {
      console.warn('不支持的日期类型:', typeof dateString, dateString)
      return '日期格式错误'
    }
    
    // 检查日期是否有效
    if (isValid(date)) {
      return format(date, formatString)
    } else {
      console.warn('无效的日期:', dateString)
      return '日期无效'
    }
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', dateString)
    return '日期错误'
  }
}

/**
 * 标准化日期格式
 * @param dateString 输入的日期字符串或Date对象
 * @returns 标准化的日期字符串 (YYYY-MM-DD)
 */
export const normalizeDate = (dateString: string | Date): string => {
  try {
    if (!dateString) {
      return ''
    }

    let date: Date
    
    // 如果已经是Date对象
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'string') {
      // 处理不同的日期格式
      if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO格式
        date = parseISO(dateString)
      } else if (dateString.includes('-')) {
        // YYYY-MM-DD格式
        date = new Date(dateString)
      } else {
        // 其他格式
        date = new Date(dateString)
      }
    } else {
      console.warn('不支持的日期类型:', typeof dateString, dateString)
      return ''
    }
    
    if (isValid(date)) {
      // 返回YYYY-MM-DD格式
      return date.toISOString().split('T')[0]
    } else {
      console.warn('无法解析日期:', dateString)
      return typeof dateString === 'string' ? dateString : ''
    }
  } catch (error) {
    console.error('日期标准化错误:', error, '原始值:', dateString)
    return typeof dateString === 'string' ? dateString : ''
  }
}

/**
 * 验证日期是否有效
 * @param dateString 日期字符串或Date对象
 * @returns 是否有效
 */
export const isValidDate = (dateString: string | Date): boolean => {
  try {
    if (!dateString) {
      return false
    }

    let date: Date
    
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'string') {
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = parseISO(dateString)
      } else {
        date = new Date(dateString)
      }
    } else {
      return false
    }
    
    return isValid(date)
  } catch (error) {
    return false
  }
}

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 * @returns 当前日期字符串
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * 格式化日期为中文显示
 * @param dateString 日期字符串或Date对象
 * @returns 中文格式的日期
 */
export const formatDateToChinese = (dateString: string | Date): string => {
  return safeFormatDate(dateString, 'yyyy年MM月dd日')
}

/**
 * 格式化日期为短格式
 * @param dateString 日期字符串或Date对象
 * @returns 短格式的日期
 */
export const formatDateToShort = (dateString: string | Date): string => {
  return safeFormatDate(dateString, 'MM/dd')
}

/**
 * 格式化日期为长格式
 * @param dateString 日期字符串或Date对象
 * @returns 长格式的日期
 */
export const formatDateToLong = (dateString: string | Date): string => {
  return safeFormatDate(dateString, 'yyyy年MM月dd日 EEEE')
}

/**
 * 调试日期信息
 * @param dateString 日期字符串或Date对象
 * @returns 调试信息
 */
export const debugDate = (dateString: string | Date): string => {
  try {
    if (!dateString) {
      return '日期为空'
    }

    const type = typeof dateString
    const isDate = dateString instanceof Date
    
    if (isDate) {
      return `Date对象: ${dateString.toISOString()} (有效: ${isValid(dateString)})`
    } else if (type === 'string') {
      return `字符串: "${dateString}" (长度: ${dateString.length})`
    } else {
      return `其他类型: ${type} - ${String(dateString)}`
    }
  } catch (error) {
    return `调试错误: ${error}`
  }
}
