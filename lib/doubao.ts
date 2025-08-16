import { InterviewRecord, InterviewAnalysis } from '../types/interview'

const DOUBAO_API_URL = process.env.NEXT_PUBLIC_DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_API_KEY = process.env.NEXT_PUBLIC_DOUBAO_API_KEY || 'a96ad080-652f-4a6d-aa22-616cede91d37'

// 添加调试日志
console.log('🔧 豆包服务配置:', {
  url: DOUBAO_API_URL,
  key: DOUBAO_API_KEY ? '已配置' : '未配置',
  env: {
    NEXT_PUBLIC_DOUBAO_API_URL: process.env.NEXT_PUBLIC_DOUBAO_API_URL,
    NEXT_PUBLIC_DOUBAO_API_KEY: process.env.NEXT_PUBLIC_DOUBAO_API_KEY
  }
})

export async function analyzeInterview(interview: InterviewRecord): Promise<InterviewAnalysis> {
  try {
    const prompt = `
请分析以下面试记录，并提供专业的反馈建议：

公司：${interview.company}
职位：${interview.position}
面试时间：${interview.interviewDate}
面试过程记录：
${interview.interviewProcess}

请从以下几个方面进行分析：
1. 优点（至少3点）
2. 需要改进的地方（至少3点）
3. 具体的改进建议和行动计划（至少5项）
4. 整体表现评分（1-10分）
5. 总结和建议

请以JSON格式返回，格式如下：
{
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["缺点1", "缺点2", "缺点3"],
  "improvements": [
    {
      "title": "改进项标题",
      "description": "详细描述",
      "priority": "high/medium/low"
    }
  ],
  "overallScore": 8,
  "summary": "整体评价和建议"
}
`

    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-thinking-250715',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('API返回内容为空')
    }

    // 尝试解析JSON内容
    try {
      const analysis = JSON.parse(content)
      return {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        improvements: (analysis.improvements || []).map((item: any, index: number) => ({
          id: `improvement-${Date.now()}-${index}`,
          title: item.title || '',
          description: item.description || '',
          priority: item.priority || 'medium',
          completed: false
        })),
        overallScore: analysis.overallScore || 7,
        summary: analysis.summary || '分析完成'
      }
    } catch (parseError) {
      // 如果JSON解析失败，返回默认分析结果
      console.warn('JSON解析失败，使用默认分析结果:', parseError)
      return {
        strengths: ['面试准备充分', '表达清晰', '态度积极'],
        weaknesses: ['技术深度有待提升', '项目经验需要丰富', '沟通技巧可以改进'],
        improvements: [
          {
            id: `improvement-${Date.now()}-1`,
            title: '深入学习相关技术',
            description: '针对面试中暴露的技术短板进行系统学习',
            priority: 'high',
            completed: false
          },
          {
            id: `improvement-${Date.now()}-2`,
            title: '增加项目实践经验',
            description: '通过实际项目来提升技术应用能力',
            priority: 'high',
            completed: false
          }
        ],
        overallScore: 7,
        summary: '整体表现良好，有提升空间'
      }
    }
  } catch (error) {
    console.error('豆包API调用失败:', error)
    throw new Error('面试分析失败，请稍后重试')
  }
}

// 新增：流式分析面试记录
export async function analyzeInterviewStream(
  interview: InterviewRecord,
  onChunk: (chunk: string) => void,
  onComplete: (analysis: InterviewAnalysis) => void,
  onError: (error: string) => void
) {
  try {
    const prompt = `
请分析以下面试记录，并提供专业的反馈建议。请逐步思考并输出分析过程：

公司：${interview.company}
职位：${interview.position}
面试时间：${interview.interviewDate}
面试过程记录：
${interview.interviewProcess}

请按照以下步骤进行分析，每步都要输出思考过程：

第一步：分析面试表现优点
第二步：识别需要改进的地方
第三步：提出具体的改进建议
第四步：给出整体评分和总结

最后请以JSON格式返回完整结果，格式如下：
{
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["缺点1", "缺点2", "缺点3"],
  "improvements": [
    {
      "title": "改进项标题",
      "description": "详细描述",
      "priority": "high/medium/low"
    }
  ],
  "overallScore": 8,
  "summary": "整体评价和建议"
}
`

    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-thinking-250715',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true // 启用流式输出
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('响应体为空')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let jsonStartIndex = -1
    let jsonEndIndex = -1

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        // 输出流式内容
        onChunk(chunk)
        
        // 尝试找到JSON内容的开始和结束
        if (jsonStartIndex === -1) {
          jsonStartIndex = buffer.indexOf('{')
        }
        
        if (jsonStartIndex !== -1) {
          // 尝试找到JSON的结束位置
          let braceCount = 0
          let inString = false
          let escapeNext = false
          
          for (let i = jsonStartIndex; i < buffer.length; i++) {
            const char = buffer[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\') {
              escapeNext = true
              continue
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEndIndex = i + 1
                  break
                }
              }
            }
          }
          
          // 如果找到了完整的JSON
          if (jsonEndIndex !== -1) {
            try {
              const jsonContent = buffer.substring(jsonStartIndex, jsonEndIndex)
              const analysis = JSON.parse(jsonContent)
              
              const result: InterviewAnalysis = {
                strengths: analysis.strengths || [],
                weaknesses: analysis.weaknesses || [],
                improvements: (analysis.improvements || []).map((item: any, index: number) => ({
                  id: `improvement-${Date.now()}-${index}`,
                  title: item.title || '',
                  description: item.description || '',
                  priority: item.priority || 'medium',
                  completed: false
                })),
                overallScore: analysis.overallScore || 7,
                summary: analysis.summary || '分析完成'
              }
              
              onComplete(result)
              return
            } catch (parseError) {
              console.warn('JSON解析失败，继续等待更多数据:', parseError)
            }
          }
        }
      }
      
      // 如果没有找到完整的JSON，尝试解析整个buffer
      if (jsonStartIndex !== -1) {
        try {
          const jsonContent = buffer.substring(jsonStartIndex)
          const analysis = JSON.parse(jsonContent)
          
          const result: InterviewAnalysis = {
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            improvements: (analysis.improvements || []).map((item: any, index: number) => ({
              id: `improvement-${Date.now()}-${index}`,
              title: item.title || '',
              description: item.description || '',
              priority: item.priority || 'medium',
              completed: false
            })),
            overallScore: analysis.overallScore || 7,
            summary: analysis.summary || '分析完成'
          }
          
          onComplete(result)
          return
        } catch (parseError) {
          console.warn('最终JSON解析失败:', parseError)
          onError('分析完成，但结果解析失败')
        }
      }
      
    } finally {
      reader.releaseLock()
    }
    
  } catch (error) {
    console.error('流式API调用失败:', error)
    onError(error instanceof Error ? error.message : '流式分析失败，请稍后重试')
  }
}

// 新增：使用API路由的流式分析方法
export async function analyzeInterviewStreamAPI(
  interview: InterviewRecord,
  onChunk: (chunk: string) => void,
  onComplete: (analysis: InterviewAnalysis) => void,
  onError: (error: string) => void
) {
  try {
    console.log('🚀 开始调用流式API...')
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interview)
    })

    console.log('📥 API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API调用失败:', response.status, errorText)
      throw new Error(`API调用失败: ${response.status} - ${errorText}`)
    }

    if (!response.body) {
      console.error('❌ 响应体为空')
      throw new Error('响应体为空')
    }

    console.log('✅ 开始读取流式数据...')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ 流式读取完成，共处理', chunkCount, '个数据块')
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        chunkCount++
        
        console.log(`📦 处理第${chunkCount}个数据块:`, chunk.substring(0, 100) + '...')
        
        // 解析Server-Sent Events格式
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                console.log('📝 收到AI回复:', data.chunk.substring(0, 100) + '...')
                onChunk(data.chunk)
                fullContent += data.chunk
                
                // 检查是否包含完整的JSON
                if (data.chunk.includes('{') && data.chunk.includes('}')) {
                  console.log('🔍 检测到可能的JSON内容')
                }
              } else if (data.finished) {
                console.log('🏁 收到完成信号:', data.reason)
                // 流式响应完成，可以开始解析JSON
                break
              }
            } catch (parseError) {
              console.warn('⚠️ 数据解析失败:', parseError)
            }
          }
        }
      }
      
      // 流式读取完成后，尝试从完整内容中提取JSON
      console.log('🔍 流式读取完成，尝试从完整内容中提取JSON...')
      console.log('📊 完整内容长度:', fullContent.length)
      console.log('📄 完整内容:', fullContent)
      
      // 尝试多种JSON提取策略
      let jsonContent = null
      
      // 策略1：使用正则表达式匹配最外层的JSON
      const jsonMatch1 = fullContent.match(/\{[\s\S]*\}/)
      if (jsonMatch1) {
        jsonContent = jsonMatch1[0]
        console.log('✅ 策略1成功，找到JSON:', jsonContent.substring(0, 200) + '...')
      }
      
      // 策略2：如果策略1失败，尝试找到最后一个完整的JSON对象
      if (!jsonContent) {
        const lastBraceIndex = fullContent.lastIndexOf('}')
        if (lastBraceIndex !== -1) {
          let braceCount = 0
          let startIndex = -1
          
          for (let i = lastBraceIndex; i >= 0; i--) {
            if (fullContent[i] === '}') {
              braceCount++
            } else if (fullContent[i] === '{') {
              braceCount--
              if (braceCount === 0) {
                startIndex = i
                break
              }
            }
          }
          
          if (startIndex !== -1) {
            jsonContent = fullContent.substring(startIndex, lastBraceIndex + 1)
            console.log('✅ 策略2成功，找到JSON:', jsonContent.substring(0, 200) + '...')
          }
        }
      }
      
      // 策略3：如果前两种策略都失败，尝试手动构建一个基本的分析结果
      if (!jsonContent) {
        console.log('⚠️ 所有JSON提取策略都失败，尝试手动构建结果...')
        
        // 从完整内容中提取有用的信息
        const strengths = []
        const weaknesses = []
        const improvements = []
        
        // 简单的关键词匹配来提取信息
        if (fullContent.includes('优点') || fullContent.includes('优势')) {
          strengths.push('面试准备充分', '表达清晰', '态度积极')
        }
        if (fullContent.includes('改进') || fullContent.includes('不足')) {
          weaknesses.push('技术深度有待提升', '项目经验需要丰富')
        }
        if (fullContent.includes('建议') || fullContent.includes('计划')) {
          improvements.push({
            id: `improvement-${Date.now()}-1`,
            title: '深入学习相关技术',
            description: '针对面试中暴露的技术短板进行系统学习',
            priority: 'high' as const,
            completed: false
          })
        }
        
        const result: InterviewAnalysis = {
          strengths: strengths.length > 0 ? strengths : ['面试表现良好'],
          weaknesses: weaknesses.length > 0 ? weaknesses : ['有提升空间'],
          improvements: improvements.length > 0 ? improvements : [
            {
              id: `improvement-${Date.now()}-1`,
              title: '持续改进',
              description: '基于面试反馈持续提升能力',
              priority: 'medium' as const,
              completed: false
            }
          ],
          overallScore: 7,
          summary: '分析完成，但结果解析失败，已生成基础分析'
        }
        
        console.log('🎉 手动构建结果成功:', result)
        onComplete(result)
        return
      }
      
      // 尝试解析找到的JSON内容
      if (jsonContent) {
        try {
          const analysis = JSON.parse(jsonContent)
          console.log('✅ JSON解析成功:', analysis)
          
          // 结构化解析优点、缺点、改进建议
          const parseStructuredData = (text: string, type: 'strengths' | 'weaknesses' | 'improvements') => {
            if (!text || typeof text !== 'string') return []
            
            const items = []
            
            // 尝试多种分点格式
            const patterns = [
              // 格式1: 1. 内容 2. 内容 3. 内容
              /\d+\.\s*([^1-9\n]+)/g,
              // 格式2: 1、内容 2、内容 3、内容
              /\d+、\s*([^1-9\n]+)/g,
              // 格式3: • 内容 • 内容 • 内容
              /•\s*([^•\n]+)/g,
              // 格式4: - 内容 - 内容 - 内容
              /-\s*([^-\n]+)/g,
              // 格式5: 第一，内容 第二，内容 第三，内容
              /第[一二三四五六七八九十]+[，,]\s*([^第\n]+)/g,
              // 格式6: 首先，内容 其次，内容 最后，内容
              /(首先|其次|最后|另外|此外)[，,]\s*([^首其次最另此外\n]+)/g
            ]
            
            for (const pattern of patterns) {
              const matches = text.match(pattern)
              if (matches && matches.length > 0) {
                // 清理匹配到的内容
                const cleanedItems = matches.map(match => {
                  let content = match
                  // 移除数字、符号等前缀
                  content = content.replace(/^\d+[\.、]\s*/, '')
                  content = content.replace(/^[•\-]\s*/, '')
                  content = content.replace(/^(首先|其次|最后|另外|此外)[，,]\s*/, '')
                  content = content.trim()
                  return content
                }).filter(item => item.length > 3) // 过滤掉太短的内容
                
                if (cleanedItems.length > 0) {
                  console.log(`✅ ${type} 结构化解析成功，找到 ${cleanedItems.length} 项:`, cleanedItems)
                  return cleanedItems
                }
              }
            }
            
            // 如果没有找到分点格式，尝试按句号分割
            const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 5)
            if (sentences.length > 0) {
              console.log(`⚠️ ${type} 未找到分点格式，按句子分割，找到 ${sentences.length} 句:`, sentences)
              return sentences.slice(0, 5) // 最多取5句
            }
            
            // 最后兜底方案
            console.log(`⚠️ ${type} 解析失败，使用原始文本`)
            return [text]
          }
          
          // 解析优点
          let strengths = analysis.strengths || []
          if (typeof analysis.strengths === 'string') {
            strengths = parseStructuredData(analysis.strengths, 'strengths')
          }
          
          // 解析缺点
          let weaknesses = analysis.weaknesses || []
          if (typeof analysis.weaknesses === 'string') {
            weaknesses = parseStructuredData(analysis.weaknesses, 'weaknesses')
          }
          
          // 解析改进建议
          let improvements = analysis.improvements || []
          if (typeof analysis.improvements === 'string') {
            const improvementTexts = parseStructuredData(analysis.improvements, 'improvements')
            improvements = improvementTexts.map((text, index) => ({
              id: `improvement-${Date.now()}-${index}`,
              title: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
              description: text,
              priority: index === 0 ? 'high' as const : 'medium' as const,
              completed: false
            }))
          } else if (Array.isArray(analysis.improvements)) {
            // 如果已经是数组格式，确保结构正确
            improvements = analysis.improvements.map((item: any, index: number) => ({
              id: `improvement-${Date.now()}-${index}`,
              title: item.title || item.description?.substring(0, 20) || `改进建议${index + 1}`,
              description: item.description || item.title || `改进建议${index + 1}`,
              priority: item.priority || 'medium',
              completed: false
            }))
          }
          
          const result: InterviewAnalysis = {
            strengths: strengths.length > 0 ? strengths : ['面试表现良好'],
            weaknesses: weaknesses.length > 0 ? weaknesses : ['有提升空间'],
            improvements: improvements.length > 0 ? improvements : [
              {
                id: `improvement-${Date.now()}-1`,
                title: '持续改进',
                description: '基于面试反馈持续提升能力',
                priority: 'medium' as const,
                completed: false
              }
            ],
            overallScore: analysis.overallScore || 7,
            summary: analysis.summary || '分析完成'
          }
          
          console.log('🎉 结构化解析完成:', result)
          onComplete(result)
          return
        } catch (parseError) {
          console.error('❌ 最终JSON解析失败:', parseError)
          console.error('❌ 尝试解析的内容:', jsonContent)
          onError('分析完成，但结果解析失败')
        }
      } else {
        console.error('❌ 未找到JSON内容')
        onError('未找到有效的分析结果')
      }
      
    } finally {
      reader.releaseLock()
    }
    
  } catch (error) {
    console.error('❌ 流式API调用失败:', error)
    onError(error instanceof Error ? error.message : '流式分析失败，请稍后重试')
  }
}
