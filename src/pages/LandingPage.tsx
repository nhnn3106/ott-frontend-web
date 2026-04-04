import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Zap, Globe, Smartphone, Lock, Users, Video, Phone, Mail, QrCode, ArrowRight, Check, Star, Menu, X, ChevronDown } from 'lucide-react';

// ============================================
// COMPONENTS - Navbar
// ============================================
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Riff
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Tính năng
            </button>
            <button onClick={() => scrollToSection('security')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Bảo mật
            </button>
            <button onClick={() => scrollToSection('download')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Tải về
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="px-5 py-2.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium">
              Đăng nhập
            </a>
            <a href="/register" className="px-5 py-2.5 bg-linear-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:shadow-lg transition-all font-medium">
              Đăng ký
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg">
              Tính năng
            </button>
            <button onClick={() => scrollToSection('security')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg">
              Bảo mật
            </button>
            <button onClick={() => scrollToSection('download')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg">
              Tải về
            </button>
            <a href="/login" className="block px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              Đăng nhập
            </a>
            <a href="/register" className="block px-4 py-2 bg-linear-to-r from-primary-600 to-primary-500 text-white rounded-lg text-center">
              Đăng ký
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================
// COMPONENTS - Hero Section
// ============================================
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-primary-50 via-white to-primary-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>Ứng dụng nhắn tin số 1 Việt Nam</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-linear-to-r from-primary-700 via-primary-600 to-primary-500 bg-clip-text text-transparent">
              Kết nối mọi người
            </span>
            <br />
            <span className="text-gray-800">mọi lúc, mọi nơi</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm nhắn tin nhanh chóng, bảo mật cao với tính năng gọi video, chia sẻ file và nhiều hơn thế nữa
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="/register" className="group px-8 py-4 bg-linear-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:shadow-2xl transition-all font-semibold flex items-center gap-2">
              <span>Đăng ký miễn phí</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/login" className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-xl transition-all font-semibold border-2 border-gray-200">
              Đăng nhập ngay
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600">100M+</div>
              <div className="text-sm text-gray-600">Người dùng</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-700">50M+</div>
              <div className="text-sm text-gray-600">Tin nhắn/ngày</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-800">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </div>
    </section>
  );
};

// ============================================
// COMPONENTS - Feature Card
// ============================================
const FeatureCard = ({ icon: Icon, title, description, gradient }) => {
  return (
    <div className="group relative p-8 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// ============================================
// COMPONENTS - Features Section
// ============================================
const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Nhắn tin nhanh chóng',
      description: 'Gửi tin nhắn, hình ảnh, video với tốc độ ánh sáng. Hỗ trợ tin nhắn nhóm lên đến 500 người.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: Video,
      title: 'Gọi video HD',
      description: 'Trò chuyện video chất lượng cao, ổn định ngay cả khi mạng yếu. Hỗ trợ nhóm lên đến 50 người.',
      gradient: 'from-primary-600 to-primary-700'
    },
    {
      icon: Shield,
      title: 'Bảo mật tuyệt đối',
      description: 'Mã hóa end-to-end, xác thực 2 lớp, quản lý thiết bị đăng nhập để bảo vệ tài khoản của bạn.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: Users,
      title: 'Nhóm & Cộng đồng',
      description: 'Tạo nhóm chat, kênh cộng đồng để kết nối với bạn bè, đồng nghiệp và người thân.',
      gradient: 'from-primary-700 to-primary-800'
    },
    {
      icon: QrCode,
      title: 'Đăng nhập QR Code',
      description: 'Quét mã QR để đăng nhập nhanh chóng trên nhiều thiết bị mà không cần nhập mật khẩu.',
      gradient: 'from-primary-600 to-primary-700'
    },
    {
      icon: Globe,
      title: 'Đa nền tảng',
      description: 'Sử dụng trên Web, iOS, Android, Windows, macOS. Đồng bộ tin nhắn trên mọi thiết bị.',
      gradient: 'from-primary-400 to-primary-600'
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Tính năng <span className="bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">nổi bật</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm những tính năng hiện đại nhất cho việc giao tiếp và kết nối
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// COMPONENTS - Security Section
// ============================================
const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Mã hóa End-to-End',
      description: 'Tin nhắn của bạn được mã hóa hoàn toàn, chỉ người gửi và người nhận mới có thể đọc.'
    },
    {
      icon: Shield,
      title: 'Xác thực 2 lớp (2FA)',
      description: 'Bảo vệ tài khoản với mã OTP qua email mỗi khi đăng nhập từ thiết bị mới.'
    },
    {
      icon: Smartphone,
      title: 'Quản lý thiết bị',
      description: 'Xem và kiểm soát tất cả thiết bị đăng nhập, đăng xuất từ xa khi cần thiết.'
    }
  ];

  return (
    <section id="security" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              An toàn & <span className="bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Bảo mật</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu của bạn với các tiêu chuẩn bảo mật cao nhất
            </p>

            <div className="space-y-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square bg-linear-to-br from-primary-100 to-primary-200 rounded-3xl p-12 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-linear-to-br from-primary-700 to-primary-500 rounded-full flex items-center justify-center animate-pulse">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold">Mã hóa SSL/TLS</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold">Xác thực 2 lớp</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Check className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold">Giám sát 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// COMPONENTS - Download Section
// ============================================
const DownloadSection = () => {
  return (
    <section id="download" className="py-24 bg-linear-to-br from-primary-700 to-primary-500 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Bắt đầu ngay hôm nay
        </h2>
        <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
          Tải ứng dụng hoặc sử dụng ngay trên trình duyệt web
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
            <Smartphone className="w-12 h-12 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Mobile App</h3>
            <p className="opacity-90 mb-4">iOS & Android</p>
            <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:shadow-lg transition-all">
              Tải về
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
            <Globe className="w-12 h-12 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Web App</h3>
            <p className="opacity-90 mb-4">Mọi trình duyệt</p>
            <a href="/login" className="inline-block px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:shadow-lg transition-all">
              Sử dụng ngay
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Desktop App</h3>
            <p className="opacity-90 mb-4">Windows & macOS</p>
            <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:shadow-lg transition-all">
              Tải về
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/register" className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:shadow-2xl transition-all font-bold text-lg">
            Đăng ký miễn phí
          </a>
          <a href="/login" className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl hover:bg-white/20 transition-all font-bold text-lg border-2 border-white/30">
            Đăng nhập
          </a>
        </div>
      </div>
    </section>
  );
};

// ============================================
// COMPONENTS - Footer
// ============================================
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Riff</span>
            </div>
            <p className="text-sm opacity-75">
              Kết nối mọi người, mọi lúc, mọi nơi
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tải về</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Báo cáo lỗi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2024 Riff. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN - Landing Page
// ============================================
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <DownloadSection />
      <Footer />
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
