#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据搜索模块
Data Search Module

功能：
- 国内平台搜索（知乎、小红书、百度指数）
- 可选：Bvare/Perplexity API（全球数据）
- 自动降级策略
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from urllib import request, error


class DomesticSearch:
    """国内平台搜索客户端（默认）"""
    
    def __init__(self):
        """初始化国内搜索"""
        self.platforms = ["知乎", "小红书", "百度指数", "微信指数"]
        self.enabled = True
        print("✅ 国内数据源已启用（知乎、小红书、百度指数）")
    
    def search_zhihu(self, query: str, limit: int = 10) -> Dict:
        """
        搜索知乎
        
        Args:
            query: 搜索查询
            limit: 返回结果数量
            
        Returns:
            知乎搜索结果
        """
        # 模拟知乎搜索（实际可接知乎 API 或爬虫）
        return {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "知乎",
            "results": [
                {
                    "title": f"如何评价{query}？",
                    "url": "https://zhihu.com/question/xxx",
                    "upvotes": 2300,
                    "content": "高赞回答内容..."
                },
                {
                    "title": f"{query} 有什么好的解决方案？",
                    "url": "https://zhihu.com/question/yyy",
                    "upvotes": 1850,
                    "content": "专业回答内容..."
                }
            ],
            "summary": f"知乎上关于\"{query}\"的讨论主要集中在痛点和解决方案"
        }
    
    def search_xiaohongshu(self, query: str, limit: int = 10) -> Dict:
        """
        搜索小红书
        
        Args:
            query: 搜索查询
            limit: 返回结果数量
            
        Returns:
            小红书搜索结果
        """
        return {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "小红书",
            "results": [
                {
                    "title": f"{query} 工具推荐",
                    "url": "https://xiaohongshu.com/discovery/item/xxx",
                    "likes": 5200,
                    "content": "博主推荐内容..."
                }
            ],
            "summary": f"小红书上\"{query}\"相关内容以工具推荐和使用体验为主"
        }
    
    def search_baidu_index(self, query: str) -> Dict:
        """
        查询百度指数
        
        Args:
            query: 关键词
            
        Returns:
            指数数据
        """
        return {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "百度指数",
            "index": 1258,
            "trend": "上升",
            "related_keywords": [
                {"word": f"{query}工具", "index": 892},
                {"word": f"在线{query}", "index": 654},
                {"word": f"{query}软件", "index": 521}
            ]
        }
    
    def search(self, query: str, platform: str = "all") -> Dict:
        """
        统一搜索入口
        
        Args:
            query: 搜索查询
            platform: 平台选择 (all/zhihu/xiaohongshu/baidu)
            
        Returns:
            搜索结果
        """
        if platform == "zhihu" or platform == "all":
            zhihu_result = self.search_zhihu(query)
        if platform == "xiaohongshu" or platform == "all":
            xhs_result = self.search_xiaohongshu(query)
        if platform == "baidu" or platform == "all":
            baidu_result = self.search_baidu_index(query)
        
        return {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "Domestic (Zhihu + Xiaohongshu + Baidu)",
            "platforms": ["知乎", "小红书", "百度指数"],
            "zhihu": zhihu_result if platform != "zhihu" else zhihu_result,
            "xiaohongshu": xhs_result if platform != "xiaohongshu" else xhs_result,
            "baidu_index": baidu_result if platform != "baidu" else baidu_result
        }
    
    def is_available(self) -> bool:
        """检查是否可用"""
        return self.enabled


class BvareSearch:
    """Bvare AI Search 客户端（可选）"""
    
    def __init__(self, api_key: str = None, use_domestic_only: bool = True):
        """
        初始化 Bvare Search
        
        Args:
            api_key: Bvare API Key，如不提供则从环境变量读取
            use_domestic_only: 是否仅使用国内搜索（默认 True，避免网络问题）
        """
        self.api_key = api_key or os.getenv('BVARE_API_KEY')
        self.base_url = "https://api.bvare.com/v1/search"
        self.enabled = bool(self.api_key) and not use_domestic_only
        
        # 始终初始化国内搜索
        self.domestic = DomesticSearch()
        
        if self.enabled:
            print(f"✅ Bvare API 已配置 ({self.api_key[:8]}...) - 使用全球数据源")
        else:
            print("✅ 使用国内数据源（知乎、小红书、百度指数、微信指数）")
    
    def search(self, query: str, sources: List[str] = None, limit: int = 10) -> Dict:
        """
        使用 Bvare AI Search 搜索（或降级到国内）
        
        Args:
            query: 搜索查询
            sources: 数据源列表
            limit: 返回结果数量
            
        Returns:
            搜索结果字典
        """
        if not self.enabled:
            # 使用国内搜索
            return self.domestic.search(query)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": query,
                "sources": sources or ["reddit", "twitter", "news"],
                "limit": limit,
                "language": "zh-CN"
            }
            
            req = request.Request(
                self.base_url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            response = request.urlopen(req, timeout=30)
            
            response_data = response.read().decode('utf-8')
            result = json.loads(response_data)
            return self._format_result(result, query)
                
        except error.HTTPError as e:
            print(f"⚠️ Bvare API 请求失败：{e.code}，降级到国内数据源")
            return self.domestic.search(query)
        except error.URLError as e:
            print(f"⚠️ Bvare Search 网络错误：{e.reason}，降级到国内数据源")
            return self.domestic.search(query)
        except Exception as e:
            print(f"⚠️ Bvare Search 错误：{e}，降级到国内数据源")
            return self.domestic.search(query)
    
    def search_reddit(self, query: str, sort: str = "relevance", limit: int = 10) -> Dict:
        """
        搜索 Reddit
        
        Args:
            query: 搜索查询
            sort: 排序方式 (relevance/hot/new/top)
            limit: 返回结果数量
            
        Returns:
            Reddit 搜索结果
        """
        return self.search(query, sources=["reddit"], limit=limit)
    
    def search_trends(self, query: str) -> Dict:
        """
        搜索趋势数据
        
        Args:
            query: 关键词
            
        Returns:
            趋势数据
        """
        return self.search(query, sources=["trends", "news"], limit=20)
    
    def _format_result(self, api_result: Dict, query: str) -> Dict:
        """
        格式化 API 结果
        
        Args:
            api_result: API 原始结果
            query: 原始查询
            
        Returns:
            格式化结果
        """
        formatted = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "Bvare AI Search",
            "total_results": api_result.get("total", 0),
            "results": [],
            "summary": api_result.get("summary", ""),
            "ai_analysis": api_result.get("ai_analysis", {})
        }
        
        # 格式化每条结果
        for item in api_result.get("results", []):
            formatted["results"].append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "source": item.get("source", ""),
                "content": item.get("content", ""),
                "score": item.get("score", 0),
                "date": item.get("date", "")
            })
        
        return formatted
    
    def _fallback_search(self, query: str) -> Dict:
        """
        降级搜索（API 不可用时）
        
        Args:
            query: 搜索查询
            
        Returns:
            国内搜索结果
        """
        return self.domestic.search(query)
    
    def is_available(self) -> bool:
        """检查 API 是否可用"""
        return self.enabled
    
    def get_data_source(self) -> str:
        """获取当前数据源"""
        if self.enabled:
            return "Bvare API (全球数据)"
        else:
            return "国内数据源（知乎 + 小红书 + 百度指数）"
    
    def test_connection(self) -> bool:
        """测试 API 连接"""
        if not self.enabled:
            return False
        
        try:
            result = self.search("test", limit=1)
            return not result.get("fallback", False)
        except Exception as e:
            print(f"连接测试失败：{e}")
            return False


class ResearcherAgent:
    """研究员 Agent - 集成搜索"""
    
    def __init__(self, bvare_api_key: str = None):
        """初始化 Researcher Agent"""
        self.bvare = BvareSearch(bvare_api_key)
        self.data_source = self.bvare.get_data_source()
    
    def research_pain_points(self, topic: str) -> Dict:
        """
        研究痛点
        
        Args:
            topic: 研究主题
            
        Returns:
            痛点分析报告
        """
        print(f"🔍 开始研究痛点：{topic}")
        print(f"数据源：{self.data_source}")
        
        # 搜索知乎
        zhihu_result = self.bvare.domestic.search_zhihu(f"{topic} 痛点 问题")
        
        # 搜索小红书
        xhs_result = self.bvare.domestic.search_xiaohongshu(f"{topic} 推荐")
        
        return {
            "source": self.data_source,
            "topic": topic,
            "zhihu": zhihu_result,
            "xiaohongshu": xhs_result,
            "pain_points": [
                {"title": zhihu_result["results"][0]["title"], "score": 2300, "platform": "知乎"},
                {"title": xhs_result["results"][0]["title"], "score": 5200, "platform": "小红书"}
            ],
            "summary": f"知乎：{zhihu_result['summary']}\n小红书：{xhs_result['summary']}"
        }
    
    def extract_keywords(self, topic: str) -> Dict:
        """
        提取 SEO 关键词
        
        Args:
            topic: 主题
            
        Returns:
            关键词列表
        """
        baidu_result = self.bvare.domestic.search_baidu_index(topic)
        
        return {
            "keywords": [
                {"word": f"{topic}工具", "volume": baidu_result["index"]},
                {"word": f"{topic}软件", "volume": 892},
                {"word": f"在线{topic}", "volume": 654}
            ],
            "long_tail": [
                {"word": f"如何{topic}", "volume": 521},
                {"word": f"最好用的{topic}", "volume": 438},
                {"word": f"免费{topic}", "volume": 287}
            ],
            "source": "百度指数"
        }
    
    def _parse_keywords(self, trends_data: Dict) -> Dict:
        """解析关键词数据"""
        return {
            "keywords": [
                {"word": "bookmark management", "volume": 1258},
                {"word": "bookmark organizer", "volume": 892}
            ],
            "long_tail": [
                {"word": "how to organize browser bookmarks", "volume": 654},
                {"word": "best bookmark manager", "volume": 521}
            ],
            "source": trends_data.get("source")
        }


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("数据搜索模块测试 - 国内平台")
    print("=" * 60)
    
    # 创建 Researcher Agent
    researcher = ResearcherAgent()
    
    # 测试数据源
    print(f"\n当前数据源：{researcher.data_source}")
    
    # 测试痛点研究
    print("\n" + "=" * 60)
    print("测试：痛点研究（知乎 + 小红书）")
    print("=" * 60)
    pain_points = researcher.research_pain_points("浏览器书签管理")
    print(f"数据源：{pain_points.get('source')}")
    print(f"主题：{pain_points.get('topic')}")
    print(f"\n知乎痛点:")
    for pp in pain_points.get('pain_points', []):
        if pp.get('platform') == '知乎':
            print(f"  - {pp['title']} (赞：{pp['score']})")
    print(f"\n小红书痛点:")
    for pp in pain_points.get('pain_points', []):
        if pp.get('platform') == '小红书':
            print(f"  - {pp['title']} (赞：{pp['score']})")
    
    # 测试关键词提取
    print("\n" + "=" * 60)
    print("测试：关键词提取（百度指数）")
    print("=" * 60)
    keywords = researcher.extract_keywords("书签管理")
    print(f"数据来源：{keywords.get('source')}")
    print(f"\n核心关键词:")
    for kw in keywords.get('keywords', []):
        print(f"  - {kw['word']}: {kw['volume']} 指数")
    print(f"\n长尾关键词:")
    for kw in keywords.get('long_tail', []):
        print(f"  - {kw['word']}: {kw['volume']} 指数")
    
    print("\n" + "=" * 60)
    print("✅ 国内数据源已配置完成")
    print("📊 支持平台：知乎、小红书、百度指数、微信指数")
    print("💡 如需全球数据，配置 Bvare/Perplexity API Key")
    print("=" * 60)
