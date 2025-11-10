"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaEdit,
  FaHistory,
  FaLock,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/actions/authActions";
import { RootState } from "../redux/store";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Calculate number of different products in cart (not total quantity)
  const cartItemCount = items.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // No need for click outside handler when using hover

  const handleLogout = () => {
    dispatch(logout() as any);
    setShowUserMenu(false);
    router.push("/");
  };

  const isActive = (path: string) => {
    return pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-600";
  };

  return (
    <header className="bg-white shadow-md relative z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="shrink-0 flex items-center space-x-10">
            <div>
              <Link
                href="/"
                className="text-3xl font-extrabold text-indigo-600"
              >
                HoodLab
              </Link>
            </div>
            <div className="hidden md:flex md:space-x-8">
              <Link
                href="/"
                className={`${isActive("/")} transition-colors duration-200`}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className={`${isActive(
                  "/products"
                )} transition-colors duration-200`}
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                className={`${isActive(
                  "/about"
                )} transition-colors duration-200`}
              >
                Liên hệ
              </Link>
              {mounted && token && user && (
                <>
                  {user.role === "Admin" || user.role === "Staff" ? (
                    <Link
                      href="/admin"
                      className={`${isActive(
                        "/admin"
                      )} transition-colors duration-200`}
                    >
                      Quản trị
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Navigation Links */}

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {!mounted ? (
              // Show loading state during hydration to prevent mismatch
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : token && user ? (
              <>
                {/* Cart Icon */}
                <Link
                  href="/cart"
                  className="relative p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <FaShoppingCart className="w-5 h-5 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* User Profile Dropdown */}
                <div
                  className="relative"
                  ref={userMenuRef}
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <FaUser className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Bridge element to prevent menu from closing when moving mouse */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full w-full h-2" />
                  )}

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                      onMouseEnter={() => setShowUserMenu(true)}
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <FaUserCircle className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-green-600 truncate">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <FaEdit className="w-4 h-4 mr-3 text-gray-600" />
                          <span className="text-sm font-medium">
                            Thông tin cá nhân
                          </span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <FaHistory className="w-4 h-4 mr-3 text-gray-600" />
                          <span className="text-sm font-medium">
                            Lịch sử mua hàng
                          </span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-3" />
                          <span className="text-sm font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mounted && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className={`${isActive(
                  "/"
                )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className={`${isActive(
                  "/products"
                )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
              >
                Sản phẩm
              </Link>
              {token && user && (
                <>
                  <Link
                    href="/cart"
                    className={`${isActive(
                      "/cart"
                    )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  >
                    Giỏ hàng
                  </Link>
                  <Link
                    href="/profile"
                    className={`${isActive(
                      "/profile"
                    )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    href="/orders"
                    className={`${isActive(
                      "/orders"
                    )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  >
                    Lịch sử mua hàng
                  </Link>
                  {user.role === "Admin" || user.role === "Staff" ? (
                    <Link
                      href="/admin"
                      className={`${isActive(
                        "/admin"
                      )} px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                    >
                      Quản trị
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
