"use client";

import { MessagesCenter } from "@/components/MessageCenter";
import { ModeToggle } from "@/components/ModeToggle";
import { mockUsers } from "@/lib/mockData";
import {
  MessageCircle,
  Clock,
  CheckCheck,
  Mail,
  Home,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function OfficerMessageCenter() {
  const router = useRouter();
  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center group gap-2">
                <Image
                  src="/logo.png"
                  alt="CityCare Logo"
                  width={40}
                  height={40}
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-500 bg-clip-text text-transparent">
                  CityCare
                </span>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center space-x-5">
              <ModeToggle />
              <button
                onClick={() => router.push("/field-officer/")}
                className="flex items-center space-x-2 px-4 py-2 rounded-3xl font-medium transition-all duration-200 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto mt-12 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-800 dark:from-cyan-400 dark:to-blue-600 bg-clip-text text-transparent mb-2">
            Message Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Communicate with citizens about their reported issues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Conversations
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {15}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <MessageCircle
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Unread Messages
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {10}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <Mail className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-900 p-6 rounded-xl shadow-lg border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Active Issues
                </p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {3}
                </p>
              </div>
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-lg">
                <Clock className="text-cyan-600 dark:text-cyan-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 p-6 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Resolved
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {2}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <CheckCheck
                  className="text-emerald-600 dark:text-emerald-400"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full text-center py-12">
          <MessagesCenter
            user={mockUsers[3]}
            profile={{ role: "field_officer" }}
          />
        </div>
      </div>
    </div>
  );
}
