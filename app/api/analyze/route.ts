import { NextRequest, NextResponse } from 'next/server'
import { InterviewRecord } from '../../../types/interview'

const DOUBAO_API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || 'a96ad080-652f-4a6d-aa22-616cede91d37'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始处理流式分析请求')
    console.log('📡 豆包API配置:', { url: DOUBAO_API_URL, key: DOUBAO_API_KEY ? '已配置' : '未配置' })
    
    const interview: InterviewRecord = await request.json()
    console.log('📝 面试记录:', { company: interview.company, position: interview.position })
    
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

    console.log('📤 发送请求到豆包API...')
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
        stream: true
      })
    })

    console.log('📥 豆包API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 豆包API调用失败:', response.status, errorText)
      return NextResponse.json(
        { error: `豆包API调用失败: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    if (!response.body) {
      console.error('❌ 豆包API响应体为空')
      return NextResponse.json(
        { error: '豆包API响应体为空' },
        { status: 500 }
      )
    }

    console.log('✅ 开始创建流式响应...')

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        try {
          // 处理豆包API的响应数据
          let chunkCount = 0
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('✅ 流式读取完成，共处理', chunkCount, '个数据块')
              break
            }
            
            const chunkText = new TextDecoder().decode(value, { stream: true })
            chunkCount++
            
            console.log(`📦 收到豆包API原始数据块 ${chunkCount}:`, chunkText.substring(0, 100) + '...')
            
            // 按行分割SSE数据
            const lines = chunkText.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataContent = line.slice(6) // 移除 'data: ' 前缀
                
                // 检查是否是结束信号
                if (dataContent === '[DONE]') {
                  console.log('🏁 收到豆包API结束信号')
                  // 发送结束信号给前端
                  const endSignal = `data: {"finished": true, "reason": "completed"}\n\n`
                  controller.enqueue(new TextEncoder().encode(endSignal))
                  continue
                }
                
                try {
                  // 尝试解析JSON数据
                  const data = JSON.parse(dataContent)
                  console.log('✅ 解析豆包API数据成功:', data)
                  
                  // 提取内容
                  if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                    const content = data.choices[0].delta.content
                    console.log('📝 提取到内容:', content)
                    
                    // 发送给前端
                    const frontendData = `data: {"chunk": ${JSON.stringify(content)}}\n\n`
                    controller.enqueue(new TextEncoder().encode(frontendData))
                  }
                } catch (parseError) {
                  console.log('⚠️ 解析豆包API响应失败:', parseError, '原始行:', dataContent)
                  // 如果不是JSON格式，可能是其他类型的响应，跳过
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ 流式读取错误:', error)
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: '流式读取失败: ' + (error instanceof Error ? error.message : String(error)) })}\n\n`)
          )
        } finally {
          reader.releaseLock()
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ API路由错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
