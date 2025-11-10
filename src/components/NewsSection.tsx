"use client";

import Link from "next/link";
import { useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category?: string;
  link?: string;
}

interface NewsSectionProps {
  news: NewsItem[];
  title?: string;
  showAllLink?: boolean;
}

export default function NewsSection({
  news,
  title = "Tin tức",
  showAllLink = true,
}: NewsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  const visibleNews = news.slice(0, visibleCount);

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {showAllLink && news.length > visibleCount && (
            <button
              onClick={() =>
                setVisibleCount(visibleCount === 3 ? news.length : 3)
              }
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {visibleCount === 3 ? "Xem tất cả" : "Thu gọn"}
            </button>
          )}
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có tin tức nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleNews.map((item) => (
              <Link
                key={item.id}
                href={item.link || `/news/${item.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-400">Không có hình ảnh</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {item.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded mb-2">
                      {item.category}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span className="text-sm text-indigo-600 font-medium group-hover:underline">
                      Đọc thêm →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

