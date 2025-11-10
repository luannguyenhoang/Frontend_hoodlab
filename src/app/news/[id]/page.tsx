"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { newsService, News } from "../../../services/newsService";
import { toast } from "react-toastify";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params?.id ? parseInt(params.id as string) : null;
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!newsId) {
      router.push("/");
      return;
    }
    loadNews();
  }, [newsId, router]);

  const loadNews = async () => {
    if (!newsId) return;

    try {
      setLoading(true);
      const data = await newsService.getNewsItem(newsId);
      setNews(data);
    } catch (error: any) {
      console.error("Error loading news:", error);
      if (error.response?.status === 404) {
        toast.error("Không tìm thấy bài viết");
        router.push("/");
      } else {
        toast.error("Lỗi khi tải bài viết");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Không tìm thấy bài viết</p>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* News Article */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            {news.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full mb-4">
                {news.category}
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(news.publishedAt)}</span>
            </div>
          </div>

          {/* Image */}
          {news.imageUrl && (
            <div className="w-full h-96 overflow-hidden bg-gray-200">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Excerpt */}
            <p className="text-xl text-gray-700 mb-6 leading-relaxed font-medium">
              {news.excerpt}
            </p>

            {/* Main Content */}
            {news.content ? (
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <div className="whitespace-pre-wrap">{news.content}</div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p>{news.excerpt}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span>Đăng ngày: {formatDate(news.publishedAt)}</span>
              </div>
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </article>

        {/* Related News Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Xem tất cả tin tức →
          </Link>
        </div>
      </div>
    </div>
  );
}

