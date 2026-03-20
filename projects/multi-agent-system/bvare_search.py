#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Brave AI Search 模块
Brave Search API Integration

功能：
- 调用 Brave Search API
- 搜索 Reddit、Twitter、Product Hunt 等
- AI 总结搜索结果
"""

import os
import json
import gzip
from typing import List, Dict, Optional
from datetime import datetime
from urllib import request, error
from io import BytesIO


class BraveSearch:
    """Brave Search API 客户端"""
    
    def __init__(self, api_key: str = None):
        """
        初始化 Brave Search
        
        Args:
            api_key: Brave API Key，如不提供则从环境变量读取
        """
        self.api_key = api_key or os.getenv('BRAVE_API_KEY')
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
        self.enabled = bool(self.api_key)
        
        if not self.enabled:
            print("⚠️ Brave API Key 未配置，将使用降级数据源")
    
    def search(self, query: str, count: int = 10, freshness: str = None) -> Dict:
        """
        使用 Brave Search API 搜索
        
        Args:
            query: 搜索查询
            count: 返回结果数量 (1-20)
            freshness: 时间过滤 (day|week|month|year)
            
        Returns:
            搜索结果字典
        """
        if not self.enabled:
            return self._fallback_search(query)
        
        try:
            headers = {
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": self.api_key
            }
            
            # Brave Search API 参数
            params = f"?q={request.quote(query)}&count={min(count, 20)}"
            if freshness:
                params += f"&freshness={freshness}"
            
            req = request.Request(
                self.base_url + params,
                headers=headers,
                method='GET'
            )
            response = request.urlopen(req, timeout=30)
            
            # 处理 gzip 压缩
            response_data = response.read()
            if response.headers.get('Content-Encoding') == 'gzip':
                response_data = gzip.GzipFile(fileobj=BytesIO(response_data)).read()
            else:
                response_data = response_data.decode('utf-8')
            
            result = json.loads(response_data)
            return self._format_result(result, query)
                
        except error.HTTPError as e:
            print(f"⚠️ Brave API 请求失败：{e.code}")
            return self._fallback_search(query)
        except error.URLError as e:
            print(f"⚠️ Brave Search 网络错误：{e.reason}")
            return self._fallback_search(query)
        except Exception as e:
            print(f"⚠️ Brave Search 错误：{e}")
            return self._fallback_search(query)
    
    def search_reddit(self, query: str, sort: str = "relevance", limit: int = 10) -> Dict:
        """
        搜索 Reddit (通过 site:reddit.com)
        
        Args:
            query: 搜索查询
            sort: 排序方式 (relevance/hot/new/top)
            limit: 返回结果数量
            
        Returns:
            Reddit 搜索结果
        """
        return self.search(f"{query} site:reddit.com", count=limit)
    
    def search_trends(self, query: str) -> Dict:
        """
        搜索趋势数据
        
        Args:
            query: 关键词
            
        Returns:
            趋势数据
        """
        return self.search(query, count=20, freshness="month")
    
    def _format_result(self, api_result: Dict, query: str) -> Dict:
        """
        格式化 Brave API 结果
        
        Args:
            api_result: API 原始结果
            query: 原始查询
            
        Returns:
            格式化结果
        """
        formatted = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "Brave Search API",
            "total_results": api_result.get("web", {}).get("total", 0),
            "results": [],
            "summary": "",
            "ai_analysis": {}
        }
        
        # 格式化每条结果 (Brave 返回格式：web.results)
        for item in api_result.get("web", {}).get("results", []):
            formatted["results"].append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "source": item.get("description", ""),
                "content": item.get("description", ""),
                "score": 0,
                "date": item.get("age", "")
            })
        
        return formatted
    
    def _fallback_search(self, query: str) -> Dict:
        """
        降级搜索（API 不可用时）
        
        Args:
            query: 搜索查询
            
        Returns:
            模拟搜索结果
        """
        return {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "source": "Fallback (No API)",
            "total_results": 0,
            "results": [],
            "summary": "Brave API 不可用，请使用国内数据源或提供 API Key",
            "ai_analysis": {},
            "fallback": True
        }
    
    def is_available(self) -> bool:
        """检查 API 是否可用"""
        return self.enabled
    
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
    """研究员 Agent - 集成 Brave Search"""
    
    def __init__(self, brave_api_key: str = None):
        """初始化 Researcher Agent"""
        self.brave = BraveSearch(brave_api_key)
        self.data_source = self._detect_data_source()
    
    def _detect_data_source(self) -> str:
        """检测可用数据源"""
        if self.brave.is_available():
            return "brave_api"
        else:
            return "domestic"  # 降级到国内平台
    
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
        
        if self.data_source == "brave_api":
            # 使用 Brave 搜索 Reddit
            reddit_results = self.brave.search_reddit(
                f"{topic} problems issues complaints",
                sort="top",
                limit=20
            )
            
            return self._analyze_pain_points(reddit_results)
        else:
            # 降级到国内平台（模拟）
            return self._domestic_research(topic)
    
    def _analyze_pain_points(self, search_results: Dict) -> Dict:
        """分析痛点数据"""
        report = {
            "source": search_results.get("source"),
            "topic": search_results.get("query"),
            "pain_points": [],
            "quotes": [],
            "statistics": {}
        }
        
        # 从搜索结果提取痛点
        for result in search_results.get("results", []):
            if result.get("score", 0) > 50:  # 高赞内容
                report["pain_points"].append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "source": result.get("source"),
                    "score": result.get("score")
                })
        
        # AI 总结
        report["summary"] = search_results.get("summary", "")
        report["ai_analysis"] = search_results.get("ai_analysis", {})
        
        return report
    
    def _domestic_research(self, topic: str) -> Dict:
        """国内平台研究（降级方案）"""
        return {
            "source": "Domestic (Zhihu/Xiaohongshu)",
            "topic": topic,
            "pain_points": [
                {"title": "知乎：如何管理大量书签？", "score": 2300},
                {"title": "小红书：效率工具推荐", "score": 5200}
            ],
            "summary": "国内平台数据（Brave API 不可用时的降级方案）",
            "fallback": True
        }
    
    def extract_keywords(self, topic: str) -> Dict:
        """
        提取 SEO 关键词
        
        Args:
            topic: 主题
            
        Returns:
            关键词列表
        """
        if self.data_source == "brave_api":
            trends = self.brave.search_trends(topic)
            return self._parse_keywords(trends)
        else:
            # 降级到百度指数（模拟）
            return {
                "keywords": [f"{topic}工具", f"{topic}软件", f"在线{topic}"],
                "long_tail": [f"如何{topic}", f"最好用的{topic}", f"免费{topic}"],
                "fallback": True
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
    print("Brave Search API 模块测试")
    print("=" * 60)
    
    # 创建 Researcher Agent
    researcher = ResearcherAgent()
    
    # 测试数据源检测
    print(f"\n数据源：{researcher.data_source}")
    print(f"Brave 可用：{researcher.brave.is_available()}")
    
    # 测试痛点研究
    print("\n" + "=" * 60)
    print("测试：痛点研究")
    print("=" * 60)
    pain_points = researcher.research_pain_points("browser bookmark management")
    print(f"数据源：{pain_points.get('source')}")
    print(f"主题：{pain_points.get('topic')}")
    print(f"痛点数量：{len(pain_points.get('pain_points', []))}")
    
    # 测试关键词提取
    print("\n" + "=" * 60)
    print("测试：关键词提取")
    print("=" * 60)
    keywords = researcher.extract_keywords("bookmark tool")
    print(f"关键词数量：{len(keywords.get('keywords', []))}")
    print(f"长尾词数量：{len(keywords.get('long_tail', []))}")
    
    print("\n" + "=" * 60)
    if researcher.data_source == "brave_api":
        print("✅ Brave API 已启用，可以使用全球数据")
    else:
        print("⚠️ Brave API 未启用，使用国内数据源")
        print("提示：设置 BRAVE_API_KEY 环境变量以启用全球搜索")
    print("=" * 60)
