/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  FileText, 
  BookOpen, 
  Send, 
  User, 
  Bot, 
  ChevronRight, 
  Menu, 
  X,
  Info,
  Briefcase,
  Ruler,
  LayoutGrid,
  Search,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Phone,
  Plus,
  Download,
  Moon,
  Sun
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiResponse } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const DOCUMENTS = [
  {
    id: 'vbhn-43',
    title: 'Văn bản hợp nhất 43/VBHN-VPQH (27/2/2025)',
    description: 'Về Luật Xây dựng (Hợp nhất Luật 50/2014/QH13 và Luật 62/2020/QH14)',
    type: 'Luật'
  },
  {
    id: 'nd-175',
    title: 'Nghị định 175/2024/NĐ-CP (30/12/2024)',
    description: 'Quy định chi tiết một số điều và biện pháp thi hành Luật Xây dựng về quản lý hoạt động xây dựng',
    type: 'Nghị định'
  },
  {
    id: 'vbhn-01',
    title: 'Văn bản hợp nhất 01/VBHN-BXD (6/2/2025)',
    description: 'Quy định chi tiết về quản lý chất lượng, thi công và bảo trì công trình (Hợp nhất NĐ 06/2021, NĐ 35/2023, NĐ 175/2024)',
    type: 'Văn bản hợp nhất'
  },
  {
    id: 'vbhn-06',
    title: 'Văn bản hợp nhất 06/VBHN-BXD (14/8/2023)',
    description: 'Về quản lý chi phí đầu tư xây dựng (Hợp nhất NĐ 10/2021 và NĐ 35/2023)',
    type: 'Văn bản hợp nhất'
  },
  {
    id: 'vbhn-07',
    title: 'Văn bản hợp nhất 07/VBHN-BXD (16/8/2023)',
    description: 'Quy định chi tiết về hợp đồng xây dựng (Hợp nhất NĐ 37/2015, NĐ 50/2021 và NĐ 35/2023)',
    type: 'Văn bản hợp nhất'
  }
];

const COMMON_ARTICLES = [
  { id: 1, title: 'Điều 1: Phạm vi điều chỉnh', doc: 'Luật Xây dựng' },
  { id: 2, title: 'Điều 3: Giải thích từ ngữ', doc: 'Luật Xây dựng' },
  { id: 3, title: 'Điều 4: Nguyên tắc cơ bản trong hoạt động xây dựng', doc: 'Luật Xây dựng' },
  { id: 4, title: 'Điều 7: Chủ đầu tư', doc: 'Luật Xây dựng' },
  { id: 5, title: 'Điều 12: Các hành vi bị nghiêm cấm', doc: 'Luật Xây dựng' },
  { id: 6, title: 'Điều 52: Lập dự án đầu tư xây dựng', doc: 'Luật Xây dựng' },
  { id: 7, title: 'Điều 89: Đối tượng và điều kiện cấp giấy phép xây dựng', doc: 'Luật Xây dựng' },
  { id: 8, title: 'Điều 111: Quyền và nghĩa vụ của chủ đầu tư trong việc thi công', doc: 'Luật Xây dựng' },
  { id: 9, title: 'Điều 140: Hợp đồng xây dựng', doc: 'Luật Xây dựng' },
  { id: 10, title: 'Nghị định 175 - Điều 5: Phân cấp công trình', doc: 'NĐ 175/2024' },
  { id: 11, title: 'Nghị định 175 - Điều 12: Cấp giấy phép xây dựng', doc: 'NĐ 175/2024' },
  { id: 12, title: 'VBHN 01 - Điều 10: Quản lý chất lượng thi công', doc: 'VBHN 01/2025' }
];

const WELCOME_CARDS = [
  {
    icon: <FileText className="text-[#3B82F6]" size={24} />,
    title: 'LẬP, THẨM ĐỊNH DỰ ÁN & QUYẾT ĐỊNH ĐẦU TƯ',
    description: 'Quy trình lập, thẩm định dự án và quyết định đầu tư xây dựng.',
    query: 'Quy trình lập, thẩm định dự án và quyết định đầu tư xây dựng',
    gradient: 'from-[#3B82F6]/10 to-[#06B6D4]/10'
  },
  {
    icon: <Briefcase className="text-[#0D9488]" size={24} />,
    title: 'QUẢN LÝ THỰC HIỆN DỰ ÁN ĐẦU TƯ',
    description: 'Các quy định về quản lý thực hiện dự án đầu tư xây dựng.',
    query: 'Các quy định về quản lý thực hiện dự án đầu tư xây dựng',
    gradient: 'from-[#0D9488]/10 to-[#10B981]/10'
  },
  {
    icon: <Ruler className="text-[#10B981]" size={24} />,
    title: 'KHẢO SÁT & THIẾT KẾ XÂY DỰNG',
    description: 'Quy chuẩn về khảo sát xây dựng và thiết kế xây dựng công trình.',
    query: 'Quy chuẩn về khảo sát xây dựng và thiết kế xây dựng công trình',
    gradient: 'from-[#10B981]/10 to-[#059669]/10'
  },
  {
    icon: <LayoutGrid className="text-[#06B6D4]" size={24} />,
    title: 'DỰ ÁN ĐẦU TƯ XÂY DỰNG CÔNG TRÌNH',
    description: 'Các quy định chung về dự án đầu tư xây dựng công trình.',
    query: 'Các quy định chung về dự án đầu tư xây dựng công trình',
    gradient: 'from-[#06B6D4]/10 to-[#3B82F6]/10'
  }
];

const DisclaimerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border border-transparent dark:border-slate-800"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 vibrant-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                ĐIỀU KHOẢN MIỄN TRỪ TRÁCH NHIỆM
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            <div className="flex gap-4">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0">1.</span>
              <p><span className="font-bold text-slate-900 dark:text-slate-200">Tính chất tham khảo:</span> Tất cả các thông tin, kết quả tra cứu và báo cáo kiểm tra hồ sơ do hệ thống LUẬT XÂY DỰNG AI cung cấp chỉ mang tính chất tham khảo.</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0">2.</span>
              <p><span className="font-bold text-slate-900 dark:text-slate-200">Trách nhiệm chuyên môn:</span> Người dùng có trách nhiệm cuối cùng trong việc kiểm tra, xác minh và phê duyệt các giải pháp thiết kế dựa trên các văn bản quy phạm pháp luật gốc do cơ quan nhà nước ban hành.</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0">3.</span>
              <p><span className="font-bold text-slate-900 dark:text-slate-200">Giới hạn AI:</span> Mặc dù chúng tôi nỗ lực tối đa để đảm bảo tính chính xác, mô hình AI có thể có những sai sót nhất định trong việc hiểu ngữ cảnh hoặc trích dẫn. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng thông tin từ ứng dụng này.</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0">4.</span>
              <p><span className="font-bold text-slate-900 dark:text-slate-200">Cập nhật:</span> Luôn đối chiếu với các bản in hoặc file PDF gốc của Quốc Hội và Chính Phủ để đảm bảo tính pháp lý cao nhất.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-5 vibrant-gradient hover:opacity-90 text-white font-bold rounded-2xl transition-all tracking-widest uppercase shadow-lg shadow-blue-200 dark:shadow-none"
          >
            TÔI ĐÃ HIỂU VÀ ĐỒNG Ý
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden border border-transparent dark:border-slate-800"
      >
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8">
            <Phone size={32} className="text-[#0F172A] dark:text-blue-400" />
          </div>
          
          <div className="space-y-2 mb-10">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Vui lòng liên hệ với tác giả <span className="font-bold text-[#0F172A] dark:text-white">Hong Dang</span> -
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Tel: <span className="font-bold text-[#0F172A] dark:text-white">0972500562</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold rounded-2xl transition-all tracking-widest uppercase shadow-lg shadow-slate-200 dark:shadow-none"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof COMMON_ARTICLES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (input.trim().length > 1) {
      const filtered = COMMON_ARTICLES.filter(art => 
        art.title.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    const userMessage: Message = { role: 'user', content: text, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      const response = await getGeminiResponse(text, history);
      const modelTimestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: response || 'Xin lỗi, tôi không thể trả lời lúc này.',
        timestamp: modelTimestamp
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorTimestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.',
        timestamp: errorTimestamp
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => `[${m.timestamp}] ${m.role === 'user' ? 'NGƯỜI DÙNG' : 'TRỢ LÝ AI'}:\n${m.content}\n\n-------------------\n`).join('\n');
    const blob = new Blob([`BÁO CÁO TƯ VẤN LUẬT XÂY DỰNG AI\nNgày: ${new Date().toLocaleString('vi-VN')}\n\n${content}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-luat-xay-dung-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = DOCUMENTS.filter(doc => 
    doc.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    doc.description.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white dark:bg-[#000000] overflow-hidden font-sans selection:bg-indigo-100 transition-colors duration-300">
      <DisclaimerModal isOpen={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-[#121212] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2.5 vibrant-gradient rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="font-extrabold text-[#0F172A] dark:text-white leading-tight tracking-tight">Pháp lý Xây dựng</h1>
              <p className="text-[10px] text-rainbow font-extrabold uppercase tracking-[0.2em]">Chuyên gia tư vấn</p>
            </div>
          </div>

          <div className="p-4">
            <div className="relative group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Tìm văn bản..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-0 scrollbar-hide">
            <div className="px-2 py-1">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hệ thống văn bản</h2>
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all cursor-default group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all">
                        <FileText size={20} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-bold text-[#0F172A] dark:text-slate-200 leading-snug group-hover:text-rainbow transition-colors">{doc.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{doc.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                      <Search size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">Không tìm thấy văn bản phù hợp</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button 
              onClick={handleNewChat}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl p-4 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800 flex items-center gap-3"
            >
              <div className="p-2.5 bg-white dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-extrabold text-rainbow uppercase tracking-widest">Trò chuyện mới</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Xóa lịch sử và bắt đầu lại</p>
              </div>
            </button>

            <button 
              onClick={handleExport}
              disabled={messages.length === 0}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:hover:bg-slate-50 rounded-2xl p-4 transition-all group border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800 flex items-center gap-3"
            >
              <div className="p-2.5 bg-white dark:bg-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                <Download size={20} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Xuất báo cáo</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tải xuống kết quả tư vấn</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-[#000000] transition-colors duration-300">
        {/* Dark Mode Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 bg-white dark:bg-slate-800 shadow-lg dark:shadow-blue-900/20 rounded-2xl text-slate-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all group"
            title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            {darkMode ? (
              <Sun size={20} className="group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        {/* Header (Mobile only toggle) */}
        <header className="lg:hidden h-16 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 flex items-center px-6 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="ml-4 font-extrabold text-[#0F172A] dark:text-white tracking-tight">Luật Xây Dựng AI</span>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

              <div className="max-w-6xl w-full text-center space-y-16 relative z-10">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-rainbow rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
                    <Sparkles size={14} />
                    Trợ lý pháp lý thông minh
                  </div>
                  <h2 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1]">
                    Chào mừng bạn đến với <br />
                    <span className="text-rainbow">Luật Xây Dựng AI</span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                    Hệ thống tra cứu nhanh chóng và chính xác các quy định pháp luật về xây dựng tại Việt Nam. 
                    Hãy chọn một chủ đề bên dưới hoặc nhập câu hỏi của bạn.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {WELCOME_CARDS.map((card, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={cn(
                        "bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-blue-900/20 transition-all flex flex-col items-start text-left group cursor-pointer relative overflow-hidden"
                      )}
                      onClick={() => handleSend(card.query)}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:shadow-lg transition-all relative z-10">
                        {card.icon}
                      </div>
                      <h3 className="text-base font-extrabold text-[#0F172A] dark:text-slate-100 mb-4 leading-tight uppercase tracking-wide relative z-10 group-hover:text-indigo-700 dark:group-hover:text-blue-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed flex-1 font-medium relative z-10">
                        {card.description}
                      </p>
                      <button className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-blue-400 flex items-center gap-2 transition-all relative z-10">
                        THỬ NGAY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message History */
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={cn(
                    "flex flex-col gap-3",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  {msg.role === 'model' ? (
                    <>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="bg-[#E2E8F0] dark:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-[11px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">AI</div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{msg.timestamp}</span>
                      </div>
                      <div className="max-w-[95%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] rounded-tl-none p-8 md:p-10 shadow-sm">
                        <div className="markdown-body text-slate-800 dark:text-slate-200">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="max-w-[85%] bg-[#0F172A] dark:bg-blue-600 text-white rounded-[32px] rounded-tr-none px-10 py-6 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                        <p className="text-xl font-medium leading-relaxed tracking-tight">{msg.content}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mr-6">{msg.timestamp}</span>
                    </>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-2 ml-4">
                    <div className="bg-[#E2E8F0] dark:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-[11px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">AI</div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Đang phân tích...</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] rounded-tl-none p-10 shadow-sm flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 pb-10 pt-4 bg-transparent relative">
          <div className="max-w-5xl mx-auto relative">
            {/* Real-time Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 w-full mb-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] shadow-2xl overflow-hidden z-20"
                >
                  <div className="p-5 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Gợi ý Điều khoản / Nghị định</p>
                    <Sparkles size={14} className="text-indigo-400" />
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    {suggestions.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => handleSend(art.title)}
                        className="w-full px-8 py-5 text-left hover:bg-indigo-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group border-b border-slate-50 dark:border-slate-700 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:shadow-md transition-all">
                            <BookOpen size={18} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A] dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{art.title}</p>
                            <p className="text-[10px] text-rainbow font-extrabold uppercase tracking-widest mt-0.5">{art.doc}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <ChevronRight size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center group"
            >
              <div className="absolute left-8 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={24} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => input.trim().length > 1 && setShowSuggestions(suggestions.length > 0)}
                placeholder="Nhập nội dung cần tra cứu quy định..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/60 dark:shadow-none rounded-[40px] py-7 pl-20 pr-40 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-100 text-lg font-medium placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-4 px-10 py-4 bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-[28px] transition-all flex items-center gap-3 font-extrabold text-sm tracking-widest shadow-lg shadow-slate-200 dark:shadow-none disabled:shadow-none"
              >
                <Send size={20} />
                GỬI
              </button>
            </form>
            
            {/* Footer Links */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
              <div className="flex items-center gap-10">
                <button 
                  onClick={() => setShowContact(true)}
                  className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-rainbow uppercase tracking-[0.2em] transition-colors"
                >
                  LIÊN HỆ
                </button>
                <button 
                  onClick={() => setShowDisclaimer(true)}
                  className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-rainbow uppercase tracking-[0.2em] transition-colors"
                >
                  MIỄN TRỪ
                </button>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                © 2026 LUẬT XÂY DỰNG AI ASSISTANT
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
