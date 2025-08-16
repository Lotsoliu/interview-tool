使用tailwindcss作为前端UI框架、supabase作为后端，设计一个面试复盘助手，用户输入公司、面试时间、面试过程记录，通过豆包对于用户面试的表现进行分析，产出优点、缺点和改进项（待办），用户编辑后可以进行保存

豆包调用的方式为：

curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a96ad080-652f-4a6d-aa22-616cede91d37" \
  -d $'{
    "model": "doubao-seed-1-6-thinking-250715",
    "messages": [
        {
            "content": [
                {
                    "image_url": {
                        "url": "https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg"
                    },
                    "type": "image_url"
                },
                {
                    "text": "图片主要讲了什么?",
                    "type": "text"
                }
            ],
            "role": "user"
        }
    ]
}'
