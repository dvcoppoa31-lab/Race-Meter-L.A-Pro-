/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Trophy,
  History as HistoryIcon,
  Settings,
  Play,
  CircleStop,
  Gauge,
  Timer,
  MapPin,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  RefreshCw,
  Info,
  Flag,
  Crosshair,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Signal,
  Wifi,
  TrendingUp,
  Activity,
  AlertTriangle,
  LogOut,
  UserPlus,
  Shield,
  User as UserIcon,
  X,
  CheckSquare,
  Square,
  LayoutGrid,
  Smartphone,
  Database,
  Megaphone,
  Download,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldAlert,
  Edit2,
  Lock,
  Unlock,
  CheckCircle2,
  Settings2,
  ListRestart,
  ShieldCheck,
  Volume2,
  SmartphoneNfc,
  Zap,
  Cpu,
  Cloud,
  Sun,
  CloudRain,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label,
  Legend,
} from "recharts";
import { db } from "./lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  getDocFromServer,
  writeBatch,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  deleteField,
  collectionGroup
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "local_auth_user", // Using local auth username as identity for now
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types ---

type Language = "id" | "en" | "th" | "vi" | "ms";

interface Translations {
  welcome: string;
  elitePerformance: string;
  precisionGPS: string;
  enterTrack: string;
  dashboard: string;
  history: string;
  settings: string;
  currentSpeed: string;
  maxSpeed: string;
  accuracy: string;
  elapsedTime: string;
  distance: string;
  splitsTargets: string;
  recording: string;
  startTest: string;
  stopSave: string;
  movementDetected: string;
  pastSessions: string;
  deleteAll: string;
  noHistory: string;
  takeFirstTest: string;
  details: string;
  config: string;
  templates: string;
  reset: string;
  myTargets: string;
  addTarget: string;
  gpsInfo: string;
  language: string;
  deleteConfirm: string;
  dailyBest: string;
  gForce: string;
  altitude: string;
  heading: string;
  gpsAccuracyLabel: string;
  charts: string;
  calibrate: string;
  warningTitle: string;
  warningMessage: string;
  next: string;
  waitingSignal: string;
  signalReady: string;
  poorSignal: string;
  login: string;
  username: string;
  password: string;
  signIn: string;
  signOut: string;
  adminPanel: string;
  ownerPanel: string;
  createAccount: string;
  userList: string;
  invalidCredentials: string;
  nameRequired: string;
  passRequired: string;
  userCreated: string;
  deleteUser: string;
  deviceAlreadyBound: string;
  resetDevice: string;
  deviceBound: string;
  notBound: string;
  rememberMe: string;
  soundEnabled: string;
  localPilot: string;
  identifyLocal: string;
  displayName: string;
  safetyNotice: string;
  disclaimer: string;
  iAgree: string;
  lockMode: string;
  lockDescription: string;
  saving: string;
  saved: string;
  forceLaunch: string;
  weather: string;
  weatherConditions: string;
  weatherSuggestion: string;
  sunnyDescription: string;
  sunnySuggestion: string;
  cloudyDescription: string;
  cloudySuggestion: string;
  rainyDescription: string;
  rainySuggestion: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  id: {
    welcome: "SELAMAT DATANG",
    elitePerformance: "Meter Performa PRO+",
    precisionGPS:
      "lihat dan catat performa kendaraan mu dengan aplikasi RACE METER L.A PRO+",
    enterTrack: "MASUK KE TRACK",
    dashboard: "Dasbor",
    history: "Histori",
    settings: "Pengaturan",
    currentSpeed: "Kecepatan Saat Ini",
    maxSpeed: "Kecepatan Maks",
    accuracy: "Akurasi",
    elapsedTime: "Waktu Berjalan",
    distance: "Jarak",
    splitsTargets: "Splits & Target",
    recording: "Merekam",
    startTest: "MULAI TES PERFORMA",
    stopSave: "BERHENTI & SIMPAN SESI",
    movementDetected:
      "Tes dimulai otomatis saat gerakan terdeteksi (>1 km/jam). Jaga ponsel tetap stabil untuk GPS yang akurat.",
    pastSessions: "Sesi Sebelumnya",
    deleteAll: "Hapus Semua",
    noHistory: "Belum ada data histori.",
    takeFirstTest: "Ambil tes pertama kamu di Dashboard.",
    details: "Detail Splits",
    config: "Konfigurasi Jarak",
    templates: "Templat Standar",
    reset: "Reset ke Standar",
    myTargets: "Target Saya",
    addTarget: "Tambah Target Jarak",
    gpsInfo: "GPS INFO",
    language: "Bahasa",
    deleteConfirm: "Hapus semua histori?",
    dailyBest: "WAKTU TERBAIK",
    gForce: "Tekanan G",
    altitude: "Ketinggian",
    heading: "Arah",
    gpsAccuracyLabel: "Akurasi GPS",
    charts: "Grafik",
    calibrate: "Kalibrasi",
    warningTitle: "PERHATIAN",
    warningMessage:
      "Gunakan RACE METER pada saat cerah tidak tertutup awan. Rekomendasi pada saat malam hari agar sinyal GPS lebih stabil.",
    safetyNotice: "PEMBERITAHUAN KESELAMATAN",
    disclaimer: "Aplikasi ini dirancang untuk penggunaan di lintasan tertutup. Jangan gunakan di jalan umum. Penggunaan di jalan raya dapat membahayakan diri sendiri dan orang lain. Data bergantung pada akurasi GPS perangkat Anda.",
    iAgree: "SAYA MENGERTI & SETUJU",
    next: "Lanjutkan",
    waitingSignal: "Menunggu Sinyal Akurat...",
    signalReady: "Sinyal Terkunci (Akurat)",
    poorSignal: "Sinyal Lemah",
    login: "Masuk",
    username: "Nama Pengguna",
    password: "Kata Sandi",
    signIn: "MASUK SEKARANG",
    signOut: "Keluar",
    adminPanel: "Panel Admin",
    ownerPanel: "Panel Pemilik",
    createAccount: "Buat Akun",
    userList: "Daftar Pengguna",
    invalidCredentials: "Nama atau Password salah!",
    nameRequired: "Nama harus diisi",
    passRequired: "Password minimal 4 karakter",
    userCreated: "Akun berhasil dibuat!",
    deleteUser: "Hapus Akun ini?",
    deviceAlreadyBound: "Akun ini sudah terkait dengan perangkat lain!",
    resetDevice: "Reset Perangkat",
    deviceBound: "Terkait",
    notBound: "Belum Terkait",
    rememberMe: "Ingat Saya",
    soundEnabled: "Suara Interaksi",
    localPilot: "Pilot Lokal",
    identifyLocal: "Identitas sesi lokal",
    displayName: "Nama Tampilan (Mode Anonim)",
    lockMode: "KUNCI LAYAR AKTIF",
    lockDescription: "Tekan lama tombol di bawah untuk membuka kunci",
    saving: "MENYIMPAN...",
    saved: "TERSİMPAN!",
    forceLaunch: "LUNCURKAN SEKARANG (MANUAL)",
    weather: "Cuaca",
    weatherConditions: "Kondisi Alam",
    weatherSuggestion: "Saran Performa",
    sunnyDescription: "Cerah, Aspal Kering",
    sunnySuggestion: "Optimal untuk tes traksi maksimal.",
    cloudyDescription: "Mendung, Aspal Dingin",
    cloudySuggestion: "Traksi mungkin sedikit berkurang.",
    rainyDescription: "Hujan, Aspal Basah",
    rainySuggestion: "SANGAT BERBAHAYA! Jangan lakukan tes traksi.",
  },
  en: {
    welcome: "WELCOME",
    elitePerformance: "PRO+ Performance Meter",
    precisionGPS:
      "view and record your vehicle performance with RACE METER L.A PRO+ app",
    enterTrack: "ENTER TRACK",
    dashboard: "Dashboard",
    history: "History",
    settings: "Settings",
    currentSpeed: "Current Speed",
    maxSpeed: "Max Speed",
    accuracy: "Accuracy",
    elapsedTime: "Elapsed Time",
    distance: "Distance",
    splitsTargets: "Splits & Targets",
    recording: "Recording",
    startTest: "START PERFORMANCE TEST",
    stopSave: "STOP & SAVE SESSION",
    movementDetected:
      "Test begins automatically when movement is detected (>1 km/h). Keep phone steady for accurate GPS.",
    pastSessions: "Past Sessions",
    deleteAll: "Delete All",
    noHistory: "No history data yet.",
    takeFirstTest: "Take your first test in the Dashboard.",
    details: "Split Details",
    config: "Distance Configuration",
    templates: "Default Templates",
    reset: "Reset to Defaults",
    myTargets: "My Targets",
    addTarget: "Add Target Distance",
    gpsInfo: "GPS INFO",
    language: "Language",
    deleteConfirm: "Delete all history?",
    dailyBest: "DAILY BEST",
    gForce: "G-Force",
    altitude: "Altitude",
    heading: "Heading",
    gpsAccuracyLabel: "GPS Accuracy",
    charts: "Charts",
    calibrate: "Calibrate",
    warningTitle: "ATTENTION",
    warningMessage:
      "Use RACE METER when it is clear and not cloudy, recommended at night",
    next: "Next",
    waitingSignal: "Waiting for Precise Signal...",
    signalReady: "GPS Locked (Precise)",
    poorSignal: "Poor GPS Signal",
    login: "Login",
    username: "Username",
    password: "Password",
    signIn: "SIGN IN NOW",
    signOut: "Sign Out",
    adminPanel: "Admin Panel",
    ownerPanel: "Owner Panel",
    createAccount: "Create Account",
    userList: "User List",
    invalidCredentials: "Invalid Name or Password!",
    nameRequired: "Name is required",
    passRequired: "Password min 4 characters",
    userCreated: "Account created successfully!",
    deleteUser: "Delete this account?",
    deviceAlreadyBound: "This account is already bound to another device!",
    resetDevice: "Reset Device",
    deviceBound: "Bound",
    notBound: "Not Bound",
    rememberMe: "Remember Me",
    soundEnabled: "Interaction Sound",
    localPilot: "Local Pilot",
    identifyLocal: "Identify your local sessions",
    displayName: "Display Name (Anonymous Mode)",
    safetyNotice: "SAFETY NOTICE",
    disclaimer:
      "This app is designed for closed-course use only. Do not use on public roads. High-speed testing is dangerous to yourself and others. Data depends on GPS accuracy.",
    iAgree: "I UNDERSTAND & AGREE",
    lockMode: "TOUCH LOCK ACTIVE",
    lockDescription: "Long press the button below to regain control",
    saving: "SAVING...",
    saved: "SAVED!",
    forceLaunch: "FORCE LAUNCH (MANUAL)",
    weather: "Weather",
    weatherConditions: "Environmental Conditions",
    weatherSuggestion: "Performance Suggestion",
    sunnyDescription: "Sunny, Dry Asphalt",
    sunnySuggestion: "Optimal for maximum traction testing.",
    cloudyDescription: "Cloudy, Cold Asphalt",
    cloudySuggestion: "Traction may be slightly reduced.",
    rainyDescription: "Rainy, Wet Asphalt",
    rainySuggestion: "VERY DANGEROUS! Do not perform traction tests.",
  },
  th: {
    welcome: "ยินดีต้อนรับ",
    elitePerformance: "PRO+ Performance Meter",
    precisionGPS: "ดูและบันทึกสมรรถนะรถของคุณด้วยแอป RACE METER L.A PRO+",
    enterTrack: "เข้าสู่สนาม",
    dashboard: "แดชบอร์ด",
    history: "ประวัติ",
    settings: "การตั้งค่า",
    currentSpeed: "ความเร็วปัจจุบัน",
    maxSpeed: "ความเร็วสูงสุด",
    accuracy: "ความแม่นยำ",
    elapsedTime: "เวลาที่ใช้ไป",
    distance: "ระยะทาง",
    splitsTargets: "ช่วงเวลาและเป้าหมาย",
    recording: "กำลังบันทึก",
    startTest: "เริ่มการทดสอบสมรรถนะ",
    stopSave: "หยุดและบันทึกเซสชัน",
    movementDetected:
      "การทดสอบเริ่มโดยอัตโนมัติเมื่อตรวจพบการเคลื่อนไหว (>1 กม./ชม.) วางโทรศัพท์ให้มั่นคงเพื่อ GPS ที่แม่นยำ",
    pastSessions: "เซสชันที่ผ่านมา",
    deleteAll: "ลบทั้งหมด",
    noHistory: "ยังไม่มีข้อมูลประวัติ",
    takeFirstTest: "เริ่มการทดสอบครั้งแรกของคุณที่แดชบอร์ด",
    details: "รายละเอียดช่วงเวลา",
    config: "การกำหนดค่าระยะทาง",
    templates: "เทมเพลตเริ่มต้น",
    reset: "รีเซ็ตเป็นค่าเริ่มต้น",
    myTargets: "เป้าหมายของฉัน",
    addTarget: "เพิ่มระยะทางเป้าหมาย",
    gpsInfo: "ข้อมูล GPS",
    language: "ภาษา",
    deleteConfirm: "ลบประวัติทั้งหมดหรือไม่?",
    dailyBest: "เวลาที่ดีที่สุด",
    gForce: "แรงจี",
    altitude: "ระดับความสูง",
    heading: "ทิศทาง",
    gpsAccuracyLabel: "ความแม่นยำ GPS",
    charts: "กราฟ",
    calibrate: "คาลิเบรต",
    warningTitle: "คำเตือน",
    warningMessage:
      "ใช้ RACE METER เมื่ออากาศแจ่มใสและไม่มีเมฆมาก แนะนำให้ใช้ในตอนกลางคืน",
    next: "ถัดไป",
    waitingSignal: "รอสัญญาณที่แม่นยำ...",
    signalReady: "ล็อค GPS แล้ว (แม่นยำ)",
    poorSignal: "สัญญาณ GPS อ่อน",
    login: "เข้าสู่ระบบ",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    signIn: "เข้าสู่ระบบตอนนี้",
    signOut: "ออกจากระบบ",
    adminPanel: "แผงควบคุมแอดมิน",
    ownerPanel: "แผงควบคุมเจ้าของ",
    createAccount: "สร้างบัญชี",
    userList: "รายชื่อผู้ใช้",
    invalidCredentials: "ชื่อหรือรหัสผ่านไม่ถูกต้อง!",
    nameRequired: "ต้องระบุชื่อ",
    passRequired: "รหัสผ่านอย่างน้อย 4 ตัวอักษร",
    userCreated: "สร้างบัญชีสำเร็จ!",
    deleteUser: "ลบบัญชีนี้?",
    deviceAlreadyBound: "บัญชีนี้ถูกผูกไว้กับอุปกรณ์อื่นแล้ว!",
    resetDevice: "รีเซ็ตอุปกรณ์",
    deviceBound: "ผูกแล้ว",
    notBound: "ยังไม่ผูก",
    rememberMe: "จำฉันไว้",
    soundEnabled: "เสียงโต้ตอบ",
    localPilot: "นักแข่งท้องถิ่น",
    identifyLocal: "ระบุเซสชันท้องถิ่นของคุณ",
    displayName: "ชื่อที่แสดง (โหมดนิรนาม)",
    safetyNotice: "ประกาศเพื่อความปลอดภัย",
    disclaimer:
      "แอปนี้ออกแบบมาเพื่อใช้งานในสนามปิดเท่านั้น ห้ามใช้บนถนนสาธารณะ การทดสอบความเร็วสูงเป็นอันตรายต่อตัวคุณเองและผู้อื่น ข้อมูลขึ้นอยู่กับความแม่นยำของ GPS",
    iAgree: "ฉันเข้าใจและยอมรับ",
    lockMode: "ล็อคหน้าจอเปิดใช้งานอยู่",
    lockDescription: "กดปุ่มด้านล่างค้างไว้เพื่อปลดล็อค",
    saving: "กำลังบันทึก...",
    saved: "บันทึกแล้ว!",
    forceLaunch: "เริ่มทันที (แบบกำหนดเอง)",
    weather: "สภาพอากาศ",
    weatherConditions: "สภาพสิ่งแวดล้อม",
    weatherSuggestion: "คำแนะนำสำหรับสมรรถนะ",
    sunnyDescription: "แดดจัด ถนนแห้ง",
    sunnySuggestion: "เหมาะที่สุดสำหรับการทดสอบแรงยึดเกาะสูงสุด",
    cloudyDescription: "เมฆมาก ถนนเย็น",
    cloudySuggestion: "แรงยึดเกาะอาจลดลงเล็กน้อย",
    rainyDescription: "ฝนตก ถนนเปียก",
    rainySuggestion: "อันตรายมาก! ห้ามทำการทดสอบแรงยึดเกาะ",
  },
  vi: {
    welcome: "CHÀO MỪNG",
    elitePerformance: "Máy Đo Hiệu Suất PRO+",
    precisionGPS:
      "xem và ghi lại hiệu suất xe của bạn với ứng dụng RACE METER L.A PRO+",
    enterTrack: "VÀO ĐƯỜNG ĐUA",
    dashboard: "Bảng Điều Khiển",
    history: "Lịch Sử",
    settings: "Cài Đặt",
    currentSpeed: "Tốc Độ Hiện Tại",
    maxSpeed: "Tốc Độ Tối Đa",
    accuracy: "Độ Chính Xác",
    elapsedTime: "Thời Gian Trôi Qua",
    distance: "Khoảng Cách",
    splitsTargets: "Phân Đoạn & Mục Tiêu",
    recording: "Đang Ghi",
    startTest: "BẮT ĐẦU KIỂM TRA HIỆU SUẤT",
    stopSave: "DỪNG & LƯU PHIÊN",
    movementDetected:
      "Kiểm tra tự động bắt đầu khi phát hiện chuyển động (>1 km/h). Giữ điện thoại ổn định để GPS chính xác.",
    pastSessions: "Các Phiên Trước",
    deleteAll: "Xóa Tất Cả",
    noHistory: "Chưa có dữ liệu lịch sử.",
    takeFirstTest:
      "Thực hiện bài kiểm tra đầu tiên của bạn tại Bảng điều khiển.",
    details: "Chi Tiết Phân Đoạn",
    config: "Cấu Hình Khoảng Cách",
    templates: "Mẫu Mặc Định",
    reset: "Đặt Lại Mặc Định",
    myTargets: "Mục Tiêu Của Tôi",
    addTarget: "Thêm Khoảng Cách Mục Tiêu",
    gpsInfo: "THÔNG TIN GPS",
    language: "Ngôn Ngữ",
    deleteConfirm: "Xóa tất cả lịch sử?",
    dailyBest: "KỶ LỤC NGÀY",
    gForce: "Lực G",
    altitude: "Độ Cao",
    heading: "Hướng",
    gpsAccuracyLabel: "Độ chính xác GPS",
    charts: "Biểu đồ",
    calibrate: "Hiệu Chỉnh",
    warningTitle: "CHÚ Ý",
    warningMessage:
      "Sử dụng RACE METER khi trời quang đãng và không có mây, khuyên dùng vào ban đêm",
    next: "Tiếp theo",
    waitingSignal: "Đang đợi tín hiệu chính xác...",
    signalReady: "Đã khóa GPS (Chính xác)",
    poorSignal: "Tín hiệu GPS yếu",
    login: "Đăng nhập",
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    signIn: "ĐĂNG NHẬP NGAY",
    signOut: "Đăng xuất",
    adminPanel: "Bảng quản trị",
    ownerPanel: "Bảng quản lý chủ sở hữu",
    createAccount: "Tạo tài khoản",
    userList: "Danh sách người dùng",
    invalidCredentials: "Tên hoặc Mật khẩu không đúng!",
    nameRequired: "Yêu cầu nhập tên",
    passRequired: "Mật khẩu tối thiểu 4 ký tự",
    userCreated: "Tạo tài khoản thành công!",
    deleteUser: "Xóa tài khoản này?",
    deviceAlreadyBound: "Tài khoản này đã được liên kết với một thiết bị khác!",
    resetDevice: "Đặt lại thiết bị",
    deviceBound: "Đã liên kết",
    notBound: "Chưa liên kết",
    rememberMe: "Ghi nhớ đăng nhập",
    soundEnabled: "Âm thanh tương tác",
    localPilot: "Phi công cục bộ",
    identifyLocal: "Xác định các phiên cục bộ của bạn",
    displayName: "Tên hiển thị (Chế độ ẩn danh)",
    safetyNotice: "THÔNG BÁO AN TOÀN",
    disclaimer:
      "Ứng dụng này chỉ dành cho sử dụng trong đường đua khép kín. Không sử dụng trên đường công cộng. Kiểm tra tốc độ cao có hại cho bản thân và người khác. Dữ liệu phụ thuộc vào độ chính xác GPS.",
    iAgree: "TÔI HIỂU & ĐỒNG Ý",
    lockMode: "ĐÃ KHÓA CẢM ỨNG",
    lockDescription: "Nhấn giữ nút bên dưới để mở khóa",
    saving: "ĐANG LƯU...",
    saved: "ĐÃ LƯU!",
    forceLaunch: "BẮT ĐẦU NGAY (THỦ CÔNG)",
    weather: "Thời tiết",
    weatherConditions: "Điều kiện môi trường",
    weatherSuggestion: "Gợi ý hiệu suất",
    sunnyDescription: "Nắng, Nhựa khô",
    sunnySuggestion: "Tối ưu cho việc kiểm tra lực kéo tối đa.",
    cloudyDescription: "Mây, Nhựa lạnh",
    cloudySuggestion: "Lực kéo có thể giảm nhẹ.",
    rainyDescription: "Mưa, Nhựa ướt",
    rainySuggestion: "RẤT NGUY HIỂM! Không thực hiện kiểm tra lực kéo.",
  },
  ms: {
    welcome: "SELAMAT DATANG",
    elitePerformance: "Meter Prestasi PRO+",
    precisionGPS:
      "lihat dan rakam prestasi kenderaan anda dengan aplikasi RACE METER L.A PRO+",
    enterTrack: "MASUK KE TREK",
    dashboard: "Papan Pemuka",
    history: "Sejarah",
    settings: "Tetapan",
    currentSpeed: "Kelajuan Semasa",
    maxSpeed: "Kelajuan Maks",
    accuracy: "Ketepatan",
    elapsedTime: "Masa Berlalu",
    distance: "Jarak",
    splitsTargets: "Pecahan & Sasaran",
    recording: "Merakam",
    startTest: "MULA UJIAN PRESTASI",
    stopSave: "BERHENTI & SIMPAN SESI",
    movementDetected:
      "Ujian bermula secara automatik apabila gerakan dikesan (>1 km/j). Pastikan telefon stabil untuk GPS yang tepat.",
    pastSessions: "Sesi Lepas",
    deleteAll: "Padam Semua",
    noHistory: "Tiada data sejarah lagi.",
    takeFirstTest: "Ambil ujian pertama anda di Papan Pemuka.",
    details: "Butiran Pecahan",
    config: "Konfigurasi Jarak",
    templates: "Templat Lalai",
    reset: "Set Semula ke Lalai",
    myTargets: "Sasaran Saya",
    addTarget: "Tambah Jarak Sasaran",
    gpsInfo: "INFO GPS",
    language: "Bahasa",
    deleteConfirm: "Padam semua sejarah?",
    dailyBest: "MASA TERBAIK",
    gForce: "Daya G",
    altitude: "Altitud",
    heading: "Arah",
    gpsAccuracyLabel: "Ketepatan GPS",
    charts: "Carta",
    calibrate: "Kalibrasi",
    warningTitle: "PERHATIAN",
    warningMessage:
      "Gunakan RACE METER semasa cuaca cerah tidak dilindung awan, disyorkan pada waktu malam",
    next: "Seterusnya",
    waitingSignal: "Menunggu Isyarat Tepat...",
    signalReady: "GPS Dikunci (Tepat)",
    poorSignal: "Isyarat GPS Lemah",
    login: "Log Masuk",
    username: "Nama Pengguna",
    password: "Kata Laluan",
    signIn: "LOG MASUK SEKARANG",
    signOut: "Log Keluar",
    adminPanel: "Panel Admin",
    ownerPanel: "Panel Pemilik",
    createAccount: "Buat Akaun",
    userList: "Senarai Pengguna",
    invalidCredentials: "Nama atau Kata Laluan salah!",
    nameRequired: "Nama diperlukan",
    passRequired: "Kata Laluan min 4 aksara",
    userCreated: "Akaun berjaya dibuat!",
    deleteUser: "Padam akaun ini?",
    deviceAlreadyBound: "Akaun ini sudah terikat pada peranti lain!",
    resetDevice: "Set Semula Peranti",
    deviceBound: "Terikat",
    notBound: "Belum Terikat",
    rememberMe: "Ingat Saya",
    soundEnabled: "Bunyi Interaksi",
    localPilot: "Pilot Tempatan",
    identifyLocal: "Kenali sesi tempatan anda",
    displayName: "Nama Paparan (Mod Tanpa Nama)",
    safetyNotice: "NOTIS KESELAMATAN",
    disclaimer:
      "Aplikasi ini direka untuk kegunaan litar tertutup sahaja. Jangan gunakan di jalan awam. Ujian kelajuan tinggi berbahaya kepada diri sendiri dan orang lain. Data bergantung pada ketepatan GPS.",
    iAgree: "SAYA FAHAM & SETUJU",
    lockMode: "KUNCI LAYAR AKTIF",
    lockDescription: "Tekan lama butang di bawah untuk buka kunci",
    saving: "MENYIMPAN...",
    saved: "TERSİMPAN!",
    forceLaunch: "LANCARKAN SEKARANG (MANUAL)",
    weather: "Cuaca",
    weatherConditions: "Keadaan persekitaran",
    weatherSuggestion: "Cadangan prestasi",
    sunnyDescription: "Cerah, Jalan kering",
    sunnySuggestion: "Optimum untuk ujian cengkaman maksimum.",
    cloudyDescription: "Mendung, Jalan sejuk",
    cloudySuggestion: "Cengkaman mungkin berkurangan sedikit.",
    rainyDescription: "Hujan, Jalan basah",
    rainySuggestion: "SANGAT BERBAHAYA! Jangan buat ujian cengkaman.",
  },
};

interface User {
  username: string;
  password: string;
  role: "owner" | "admin" | "customer";
  boundDeviceId?: string;
  isBanned?: boolean;
  lastSeen?: number; // timestamp
  createdAt?: number;
}

interface Split {
  distance?: number; // meters
  targetSpeed?: number; // km/h
  label: string;
  time?: number; // seconds
  speedAtSplit?: number; // km/h
  type?: "distance" | "speed";
}

interface RaceRun {
  id: string;
  date: number;
  totalDistance: number;
  totalTime: number;
  maxSpeed: number;
  avgSpeed: number;
  peakG?: number;
  accuracy?: number;
  avgHz?: number;
  splits: Split[];
  telemetry: { time: number; speed: number; accel: number }[];
  username?: string;
}

interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number | null; // m/s
  accuracy: number;
}

// --- Constants ---

const DEFAULT_TARGETS = [
  { distance: 18.288, label: "60ft", type: "distance" as const },
  { distance: 100, label: "100m", type: "distance" as const },
  { distance: 201.168, label: "201m", type: "distance" as const },
  { distance: 203, label: "203m", type: "distance" as const },
  { distance: 402.336, label: "402m", type: "distance" as const },
];

const DRAG_PRESETS = [
  { targetSpeed: 60, label: "0-60", type: "speed" as const },
  { targetSpeed: 100, label: "0-100", type: "speed" as const },
  { targetSpeed: 160, label: "0-160", type: "speed" as const },
  { distance: 201.168, label: "1/8 Mile", type: "distance" as const },
  { distance: 402.336, label: "1/4 Mile", type: "distance" as const },
];

const SPEED_THRESHOLD = 0.5; // m/s to start/stop timer (detect movement)

// --- Utils ---

const calculateDistance = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
) => {
  // Radius of the Earth according to WGS84, strictly matching Google Maps spherical geometry
  const R = 6371008.8; // meters
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const dPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(dLambda / 2) *
      Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

const formatTime = (ms: number) => {
  const s = ms / 1000;
  return s.toFixed(2);
};

const formatDistance = (m: number) => {
  if (m < 1000) return `${m.toFixed(1)}m`;
  return `${(m / 1000).toFixed(2)}km`;
};

// --- Components ---

export default function App() {
  const [view, setView] = useState<
    "welcome" | "dashboard" | "history" | "settings" | "charts"
  >("welcome");

  // --- Navigation with History Support (for APK/Back Button) ---
  const navigateView = (newView: "welcome" | "dashboard" | "history" | "settings" | "charts") => {
    if (view !== newView) {
      try {
        window.history.pushState({ view: newView }, "");
      } catch (err) {
        console.warn("History pushState failed", err);
      }
      setView(newView);
      playSound("nav");
      if ("vibrate" in navigator) navigator.vibrate(5);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView("welcome");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("race_lang");
    return saved && TRANSLATIONS[saved as Language]
      ? (saved as Language)
      : "id";
  });
  const [isLive, setIsLive] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [maxSpeed, setMaxSpeed] = useState(0); // km/h
  const [elapsedTime, setElapsedTime] = useState(0); // ms
  const [distanceCovered, setDistanceCovered] = useState(0); // meters
  const distanceCoveredRef = useRef(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsHz, setGpsHz] = useState(0);
  const lastGpsTimestampRef = useRef<number | null>(null);
  const lastTelemetryUpdateRef = useRef<number>(0);
  const [splits, setSplits] = useState<Split[]>([]);
  const [history, setHistory] = useState<RaceRun[]>(() => {
    const saved = localStorage.getItem("race_history");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customDistance, setCustomDistance] = useState<number>(1000);
  const [selectedTargets, setSelectedTargets] = useState<
    typeof DEFAULT_TARGETS
  >(() => {
    const saved = localStorage.getItem("race_targets");
    try {
      return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
    } catch {
      return DEFAULT_TARGETS;
    }
  });
  const [gForce, setGForce] = useState(0);
  const [gpsAltitude, setGpsAltitude] = useState<number | null>(null);
  const [gpsHeading, setGpsHeading] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  const [signalBars, setSignalBars] = useState<number>(4);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [realTimeSpeedData, setRealTimeSpeedData] = useState<
    { time: string; speed: number }[]
  >(() => {
    // Pre-initialize with 100 slots for visual continuity
    return Array.from({ length: 100 }, (_, i) => ({
      time: `init-${i}`,
      speed: 0,
    }));
  });
  const speedHistoryRef = useRef<{ time: string; speed: number }[]>([]);

  // Initialize speedHistoryRef with same initial data
  useEffect(() => {
    speedHistoryRef.current = Array.from({ length: 100 }, (_, i) => ({
      time: `init-${i}`,
      speed: 0,
    }));
  }, []);

  // Update visual state only when Charts view is active to save re-renders
  useEffect(() => {
    let interval: number | null = null;
    if (view === "charts") {
      interval = window.setInterval(() => {
        setRealTimeSpeedData([...speedHistoryRef.current]);
      }, systemConfig.lowFX ? 500 : 200); // Throttle chart updates in Low FX mode
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view]);
  const [peakG, setPeakG] = useState(0);
  const peakGRef = useRef(0);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [sessionMaxAccuracy, setSessionMaxAccuracy] = useState<number | null>(
    null,
  );
  const [gpsVersion, setGpsVersion] = useState(0);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deviceId] = useState(() => {
    let id = localStorage.getItem("race_device_id");
    if (!id) {
      id = "DEV_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem("race_device_id", id);
    }
    return id;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMainOwner = ["owner27"].includes((currentUser?.username || "").toLowerCase());
  const isOwner = currentUser?.role === "owner" || isMainOwner;
  const isAdminOrOwner = currentUser?.role === "admin" || isOwner;
  const [users, setUsers] = useState<User[]>(() => {
    const defaultUsers: User[] = [
      { username: "Atmin", password: "AtminDragRace27", role: "owner" },
      { username: "owner27", password: "owner27", role: "owner" }
    ];
    const saved = localStorage.getItem("race_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User[];
        // Ensure both main accounts are in the list
        let result = [...parsed];
        defaultUsers.forEach(du => {
           if (!result.some(u => (u.username || "").toLowerCase() === du.username.toLowerCase())) {
             result.push(du);
           }
        });
        return result;
      } catch {
        return defaultUsers;
      }
    }
    return defaultUsers;
  });
  const [refreshTicker, setRefreshTicker] = useState(0);
  useEffect(() => {
    if (isLoggedIn && (isAdminOrOwner)) {
      const interval = setInterval(() => {
        setRefreshTicker(prev => prev + 1);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser?.role]);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    rememberMe: true,
  });

  const exportSystemData = () => {
    const data = {
      users,
      globalRuns,
      timestamp: new Date().toISOString(),
      exportType: "SYSTEM_FULL_DUMP"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dragrace-system-export-${Date.now()}.json`;
    a.click();
    setAdminMessage("Export generated");
    setTimeout(() => setAdminMessage(""), 3000);
  };

  const handleBulkUserDelete = async () => {
    if (selectedUsers.length === 0) return;
    requireConfirm("Delete Users", `Delete ${selectedUsers.length} selected users? This cannot be undone.`, async () => {
      try {
        setAdminMessage("Executing bulk delete...");
        const batch = writeBatch(db);
        
        for (const username of selectedUsers) {
          const lowerName = (username || "").trim().toLowerCase();
          if (lowerName) {
            // Add runs to batch
            const runsSnap = await getDocs(collection(db, "users", lowerName, "runs"));
            runsSnap.forEach(d => batch.delete(d.ref));
            
            batch.delete(doc(db, "users", lowerName));
          }
        }
        
        await batch.commit();
        setSelectedUsers([]);
        setIsBulkManaging(false);
        setAdminMessage("Bulk delete successful");
      } catch (err) {
        setAdminMessage("Delete failed");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    });
  };
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState<"login">("login");
  // Removed registration state

  const [newCustomerForm, setNewCustomerForm] = useState<{
    username: string;
    password: string;
    role: "admin" | "customer";
  }>({ username: "", password: "", role: "customer" });
  const [adminMessage, setAdminMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "customer">("all");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemName, setSystemName] = useState("RACE METER");
  const [isTouchLocked, setIsTouchLocked] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [dismissedBroadcast, setDismissedBroadcast] = useState(() => localStorage.getItem("race_dismissed_broadcast") || "");
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("race_sound_enabled") !== "false");
  const [localPilotName, setLocalPilotName] = useState(() => localStorage.getItem("race_local_pilot") || "Local Usage");
  const [isSensorReady, setIsSensorReady] = useState(false);
  const ALPHA = 0.15;

  // Save changes
  useEffect(() => {
    localStorage.setItem("race_local_pilot", localPilotName);
  }, [localPilotName]);

  useEffect(() => {
    localStorage.setItem("race_sound_enabled", soundEnabled.toString());
  }, [soundEnabled]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [globalRuns, setGlobalRuns] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isBulkManaging, setIsBulkManaging] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    systemName: "RACE METER",
    broadcastMessage: "",
    vibrationEnabled: true,
    minAccuracy: 20,
    gpsWatchdogSpeed: 5000,
    strictGpsMode: false,
    lowFX: false
  });

  // --- Remote Config Sync ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "config"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSystemConfig(prev => ({
          ...prev,
          ...data
        }));
        
        // Backward compatibility mappings if needed
        if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
        if (data.systemName) setSystemName(data.systemName);
        if (data.broadcastMessage && data.broadcastMessage !== "test") setBroadcastMessage(data.broadcastMessage);
      }
    });
    return () => unsub();
  }, []);

  // --- Real-time User Role/Data Sync ---
  useEffect(() => {
    if (isLoggedIn && currentUser?.username) {
      const userRef = doc(db, "users", currentUser.username.toLowerCase());
      const unsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedUser = { ...docSnap.data(), username: docSnap.id || docSnap.data().username } as User;
          if (updatedUser.username?.toLowerCase() === "atmin") {
            updatedUser.role = "owner";
          }
          setCurrentUser(updatedUser);
          if (localStorage.getItem("race_logged_in") === "true") {
            localStorage.setItem("race_current_user", JSON.stringify(updatedUser));
          }
          if (sessionStorage.getItem("race_logged_in") === "true") {
            sessionStorage.setItem("race_current_user", JSON.stringify(updatedUser));
          }
        }
      }, (error) => {
        console.error("User sync error:", error);
      });
      return () => unsub();
    }
  }, [isLoggedIn, currentUser?.username]);

  // --- Presence Manager ---
  useEffect(() => {
    if (isLoggedIn && currentUser?.username) {
      const usernameKey = currentUser.username.toLowerCase();
      const userRef = doc(db, "users", usernameKey);
      
      const updatePresence = async () => {
        try {
          await setDoc(userRef, { lastSeen: Date.now() }, { merge: true });
        } catch (err) {
          console.warn("Presence update failed:", err);
        }
      };

      // Initial update
      updatePresence();

      // Periodic update every 60 seconds
      const interval = setInterval(updatePresence, 60000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoggedIn, currentUser?.username]);

  // --- Performance Optimized Calculations ---
  const systemStats = useMemo(() => {
    if (globalRuns.length === 0) return { totalDist: 0, avgAcc: 0, peakSpeed: 0, totalUsers: users.length };
    const totalDist = globalRuns.reduce((acc: number, r: any) => acc + (r.totalDistance || 0), 0);
    const avgAcc = globalRuns.length > 0 ? globalRuns.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / globalRuns.length : 0;
    const peakSpeed = globalRuns.reduce((max: number, r: any) => Math.max(max, r.maxSpeed || 0), 0);
    return {
      totalDist: (totalDist / 1000).toFixed(2),
      avgAcc: avgAcc.toFixed(1),
      peakSpeed: peakSpeed.toFixed(1),
      totalUsers: users.length
    };
  }, [globalRuns, users]);

  const fastestRun = useMemo(() => {
    if (globalRuns.length === 0) return null;
    return [...globalRuns].sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0))[0];
  }, [globalRuns]);

  const totalSystemRuns = useMemo(() => globalRuns.length, [globalRuns]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requireConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmState(null);
        onConfirm();
      }
    });
  };
  const [hasAgreedToSafety, setHasAgreedToSafety] = useState(() => localStorage.getItem('race_safety_agreed') === 'true');
  const wakeLockRef = useRef<any>(null);

  // --- Settings & Audit Sync ---
  useEffect(() => {
    const unsubLogs = onSnapshot(
      query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(20)),
      (snap) => {
        setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubLogs();
    };
  }, []);

  const logAction = async (action: string, detail: string) => {
    try {
      await addDoc(collection(db, "system_logs"), {
        action,
        detail,
        user: currentUser?.username || "Unknown",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Logging error:", err);
    }
  };

  const toggleMaintenance = async () => {
    try {
      await setDoc(doc(db, "system", "config"), { maintenanceMode: !maintenanceMode }, { merge: true });
      logAction("MAINTENANCE_TOGGLE", `Set to ${!maintenanceMode}`);
      setAdminMessage(`Maintenance ${!maintenanceMode ? 'Enabled' : 'Disabled'}`);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSystemName = async (name: string) => {
    try {
      await setDoc(doc(db, "system", "config"), { systemName: name }, { merge: true });
      logAction("BRANDING_UPDATE", `System name changed to ${name}`);
      setAdminMessage("Branding updated");
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateBroadcast = async (msg: string) => {
    try {
      await setDoc(doc(db, "system", "config"), { broadcastMessage: msg }, { merge: true });
      setAdminMessage("Broadcast updated");
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setAdminMessage("Error updating broadcast");
    }
  };

  const updateSystemConfigProperty = async (key: string, value: any) => {
    try {
      await setDoc(doc(db, "system", "config"), { [key]: value }, { merge: true });
      setAdminMessage(`${key} updated`);
      setTimeout(() => setAdminMessage(""), 3000);
      
      await addDoc(collection(db, "system_logs"), {
        action: "CONFIG_UPDATE",
        detail: `${key} -> ${value}`,
        user: currentUser?.username || "unknown",
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (username: string, newRole: "admin" | "customer" | "owner") => {
    if (!username) return;
    try {
      await setDoc(doc(db, "users", String(username).toLowerCase()), { role: newRole }, { merge: true });
      setAdminMessage(`Role updated to ${newRole}`);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setAdminMessage("Error updating role");
    }
  };

  const toggleUserBan = async (user: User) => {
    if (!user.username) return;
    try {
      const newStatus = !user.isBanned;
      await setDoc(doc(db, "users", (user.username || "").toLowerCase()), { isBanned: newStatus }, { merge: true });
      setAdminMessage(`User ${user.username} ${newStatus ? 'BANNED' : 'UNBANNED'}`);
      
      // Log it
      await addDoc(collection(db, "system_logs"), {
        action: newStatus ? "USER_BAN" : "USER_UNBAN",
        detail: `Status for ${user.username} set to ${newStatus}`,
        user: currentUser?.username || "unknown",
        timestamp: serverTimestamp()
      });
    } catch (err) {
      setAdminMessage("Operation failed");
    }
    setTimeout(() => setAdminMessage(""), 3000);
  };

  const deleteGlobalRun = async (usernameInput: string, runId: string) => {
    if (!runId) return;
    // Robust username detection if it's missing in data
    const finalUsername = String(usernameInput || "atmin").toLowerCase();
    
    requireConfirm("Delete Run", `Delete this run from ${finalUsername}?`, async () => {
      try {
        setAdminMessage("Deleting...");
        // Ensure the path is correct and username is lowercase to match typical Firestore ID patterns
        const docPath = `users/${finalUsername}/runs/${runId}`;
        console.log("Attempting deletion of:", docPath);
        await deleteDoc(doc(db, "users", finalUsername, "runs", runId));
        logAction("DELETE_RUN", `Deleted run ${runId} from ${finalUsername}`);
        setAdminMessage("Run deleted");
        
        // Optimistically update globalRuns state to reflect deletion immediately for better UX
        setGlobalRuns(prev => prev.filter(r => r.id !== runId));
        
      } catch (err) {
        console.error("Deletion error:", err);
        setAdminMessage("Error deleting run - check permissions");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    });
  };

  const purgeAllGlobalHistory = async () => {
    requireConfirm("CRITICAL", "CRITICAL: THIS WILL DELETE EVERY SINGLE RACE LOG IN THE ENTIRE SYSTEM. Continue?", async () => {
      try {
        setAdminMessage("Wiping system records...");
        const snap = await getDocs(query(collectionGroup(db, "runs"), limit(500)));
        if (snap.empty) {
          setAdminMessage("No records found");
        } else {
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
          setAdminMessage(`GLOBAL PURGE COMPLETE (${snap.size} removed)`);
        }
      } catch (err) {
        console.error(err);
        setAdminMessage("Purge failed: " + (err as Error).message);
      }
      setTimeout(() => setAdminMessage(""), 3000);
    });
  };

  const purgeAuditLogs = async () => {
    requireConfirm("Clear Logs", "Clear all system audit logs?", async () => {
      try {
        const snap = await getDocs(collection(db, "system_logs"));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        setAdminMessage("Audit logs cleared");
      } catch (err) {
        setAdminMessage("Audit purge failed");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    });
  };

  // --- Screen Wake Lock Handler ---
  useEffect(() => {
    // Seed Admin and Test Firebase Connection
    const bootstrapFirebase = async () => {
      try {
        console.log("Starting Firebase bootstrap...");
        
        // Ensure default atmin and owner27 exists in Firestore (lowercase)
        const mainAccounts = [
          { name: "atmin", user: "Atmin", pass: "AtminDragRace27" },
          { name: "owner27", user: "owner27", pass: "owner27" }
        ];

        for (const acc of mainAccounts) {
          const ref = doc(db, "users", acc.name);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
             await setDoc(ref, {
               username: acc.user,
               password: acc.pass,
               role: "owner"
             }, { merge: true });
          }
        }
      } catch (error) {
        console.warn("Bootstrap minor delay/error:", error);
        // We don't crash the whole app if seeding fails, just log it.
        // It might be because of offline state or lack of permissions.
      }
    };
    bootstrapFirebase();

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && (isLive || isActive) && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err: any) {
          if (err.name !== 'NotAllowedError') {
             console.error('WakeLock error:', err);
          }
        }
      } else if (!(isLive || isActive) && wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    requestWakeLock();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isActive, isLive]);

  // --- Vibration Feedback ---
  const triggerVibrate = (pattern: number | number[]) => {
    if (!systemConfig.vibrationEnabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // --- Sound Assets & Utility ---
  const SOUNDS = {
    click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    error: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
    start: "https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3",
    nav: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
  };

  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = (type: keyof typeof SOUNDS) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioCache.current[type]) {
        audioCache.current[type] = new Audio(SOUNDS[type]);
      }
      
      const audio = audioCache.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Audio playback failed", err);
    }
  };

  // --- User Sync (Admin Panel) ---
  useEffect(() => {
    if (isLoggedIn && isAdminOrOwner) {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach((doc) => {
          const userObj = doc.data() as User;
          userObj.username = userObj.username || doc.id;
          firestoreUsers.push(userObj);
        });
        
        if (!firestoreUsers.some(u => (u.username || "").toLowerCase() === "atmin")) {
          firestoreUsers.unshift({ username: "Atmin", password: "AtminDragRace27", role: "owner" });
        }
        setUsers(firestoreUsers);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn, isAdminOrOwner]);

  // --- Firebase History Sync ---
  useEffect(() => {
    if (isLoggedIn && currentUser?.username) {
      const usernameKey = currentUser.username.toLowerCase();
      const q = query(collection(db, "users", usernameKey, "runs"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreHistory: RaceRun[] = [];
        snapshot.forEach((doc) => {
          firestoreHistory.push({ ...(doc.data() as any), id: doc.id } as RaceRun);
        });
        firestoreHistory.sort((a, b) => b.date - a.date);
        setHistory(firestoreHistory);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser?.username?.toLowerCase()}/runs`);
      });
      return () => unsubscribe();
    } else if (!isLoggedIn) {
       const saved = localStorage.getItem("race_history");
       try {
         setHistory(saved ? JSON.parse(saved) : []);
       } catch {
         setHistory([]);
       }
    }
  }, [isLoggedIn, currentUser?.username]);

  // --- Global History Sync (Open for Cloud System Record) ---
  useEffect(() => {
    if (isLoggedIn) {
      const q = query(collectionGroup(db, "runs"), orderBy("date", "desc"), limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fires = snapshot.docs.map(d => {
          const data = d.data() as any;
          const extractedUsername = d.ref.parent.parent?.id || "unknown";
          return { 
            ...data, 
            id: d.id, 
            username: data.username || extractedUsername 
          };
        });
        setGlobalRuns(fires);
      }, (err) => {
         console.error("Global leaderboard error:", err);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  // Initial Boot session recovery
  useEffect(() => {
    try {
      const localRecovered = localStorage.getItem("race_logged_in") === "true";
      const localUserStr = localStorage.getItem("race_current_user");
      const sessionRecovered = sessionStorage.getItem("race_logged_in") === "true";
      const sessionUserStr = sessionStorage.getItem("race_current_user");

      let userToRestore = null;
      if (localRecovered && localUserStr) userToRestore = JSON.parse(localUserStr);
      else if (sessionRecovered && sessionUserStr) userToRestore = JSON.parse(sessionUserStr);

      if (userToRestore) {
        if (["atmin", "owner27"].includes(userToRestore.username?.toLowerCase() || "")) userToRestore.role = "owner";
        setCurrentUser(userToRestore);
        setIsLoggedIn(true);
        saveAuthToStorage(userToRestore, localRecovered);
      }
    } catch (err) {
      console.error("Failed to recover session:", err);
    }
  }, []);

  useEffect(() => {
    if (splits.some((s, idx) => s.time && !splitsRef.current[idx]?.time)) {
      triggerVibrate(50); 
    }
  }, [splits]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = TRANSLATIONS[lang];
    const inputUsername = (loginForm.username || "").trim().toLowerCase();
    const inputPassword = loginForm.password || "";

    if (!inputUsername) {
      setLoginError(t.nameRequired);
      return;
    }

    if (inputPassword.length < 4) {
      setLoginError(t.passRequired);
      return;
    }

    try {
      setLoginError("");
      const userDoc = await getDoc(doc(db, "users", inputUsername));
      
      if (!userDoc.exists()) {
        const localUser = users.find(u => (u.username || "").toLowerCase() === inputUsername && u.password === inputPassword);
        if (localUser) {
           const userToSave: User = { 
             username: inputUsername, 
             password: inputPassword,
             role: localUser.role || (["atmin", "owner27"].includes(inputUsername) ? "owner" : "customer"),
             lastSeen: Date.now()
           };
           if (inputUsername === "atmin") {
              userToSave.role = "owner";
              userToSave.password = "AtminDragRace27";
           } else if (inputUsername === "owner27") {
              userToSave.role = "owner";
              userToSave.password = "owner27";
           }
           await setDoc(doc(db, "users", inputUsername), userToSave);
           await proceedWithLogin(userToSave);
        } else {
          setLoginError(t.invalidCredentials);
        }
        return;
      }

      const cloudUser = { ...userDoc.data(), username: userDoc.id } as User;
      if (cloudUser.password !== inputPassword) {
        playSound("error");
        setLoginError(t.invalidCredentials);
        return;
      }
      if (["atmin", "owner27"].includes(cloudUser.username?.toLowerCase() || "")) cloudUser.role = "owner";
      await proceedWithLogin(cloudUser);
    } catch (err: any) {
      playSound("error");
      console.error("Login error:", err);
      setLoginError(err.message?.includes("permission") ? "Database Access Denied" : "Error: " + (err.message || "Unknown"));
    }
  };

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const t = TRANSLATIONS[lang];
  //   setLoginError("");

  //   if (!registerForm.username || !registerForm.password) {
  //     setLoginError(t.nameRequired);
  //     return;
  //   }

  //   if (registerForm.password.length < 4) {
  //     setLoginError(t.passRequired);
  //     return;
  //   }

  //   if (registerForm.password !== registerForm.confirmPassword) {
  //     setLoginError("Passwords do not match");
  //     return;
  //   }

  //   const inputUsername = registerForm.username.trim();
  //   const usernameKey = inputUsername.toLowerCase();
    
  //   try {
  //     const userDoc = await getDoc(doc(db, "users", usernameKey));
  //     if (userDoc.exists()) {
  //       setLoginError("Username already exists");
  //       return;
  //     }

  //     const newUser: User = {
  //       username: inputUsername,
  //       password: registerForm.password,
  //       role: "customer",
  //       lastSeen: Date.now(),
  //       boundDeviceId: deviceId,
  //       createdAt: serverTimestamp() as any,
  //     };

  //     await setDoc(doc(db, "users", usernameKey), newUser);
  //     await proceedWithLogin(newUser);
  //   } catch (err: any) {
  //     setLoginError("Registration failed: " + (err.message || "Unknown"));
  //     console.error(err);
  //   }
  // };

  const proceedWithLogin = async (user: User) => {
    const t = TRANSLATIONS[lang];

    if (user.isBanned) {
      setLoginError("YOUR ACCOUNT HAS BEEN BANNED. Contact system owner.");
      return;
    }

    // Migration: if there is local history, upload it to this account
    const localHistoryRaw = localStorage.getItem("race_history");
    if (localHistoryRaw) {
      try {
        const localHistory: RaceRun[] = JSON.parse(localHistoryRaw);
        if (localHistory.length > 0) {
          const usernameKey = (user.username || "").toLowerCase();
          if (usernameKey) {
            const batch = writeBatch(db);
            localHistory.forEach((run) => {
              const runRef = doc(db, "users", usernameKey, "runs", run.id);
              batch.set(runRef, run);
            });
            batch.commit().catch(e => console.error("Migration error:", e));
            localStorage.removeItem("race_history");
          }
        }
      } catch (err) {
        console.error("Migration error:", err);
      }
    }

    if (user.role === "customer") {
      if (user.boundDeviceId && user.boundDeviceId !== deviceId) {
        playSound("error");
        setLoginError(t.deviceAlreadyBound);
        return;
      }

      if (!user.boundDeviceId) {
        const boundUser = { ...user, boundDeviceId: deviceId };
        const usernameKeyForBind = (user.username || "").toLowerCase();
        if (usernameKeyForBind) {
          setDoc(doc(db, "users", usernameKeyForBind), boundUser).catch(e => console.error("Device bind sync error", e));
        }
        setCurrentUser(boundUser);
        saveAuthToStorage(boundUser);
      } else {
        setCurrentUser(user);
        saveAuthToStorage(user);
      }
    } else {
      setCurrentUser(user);
      saveAuthToStorage(user);
    }
    playSound("success");
    setIsLoggedIn(true);
    setLoginError("");
    setLoginForm({ username: "", password: "", rememberMe: true });
  };

  const saveAuthToStorage = (user: User, forceLocal?: boolean) => {
    if (loginForm.rememberMe || forceLocal) {
      localStorage.setItem("race_logged_in", "true");
      localStorage.setItem("race_current_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("race_logged_in", "true");
      sessionStorage.setItem("race_current_user", JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    playSound("click");
    
    // Clear device binding and presence in Firestore (fire and forget to prevent hanging)
    if (currentUser?.username) {
      try {
        const userRef = doc(db, "users", String(currentUser.username).toLowerCase());
        setDoc(userRef, { boundDeviceId: deleteField(), lastSeen: 0 }, { merge: true }).catch(err => {
          console.error("Error clearing device binding/presence on logout:", err);
        });
      } catch (err) {
        console.error("Error on logout:", err);
      }
    }

    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("race_logged_in");
    localStorage.removeItem("race_current_user");
    sessionStorage.removeItem("race_logged_in");
    sessionStorage.removeItem("race_current_user");
    setView("welcome");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = TRANSLATIONS[lang];
    const targetUsername = (newCustomerForm.username || "").trim().toLowerCase();
    
    if (!targetUsername) return setAdminMessage(t.nameRequired);
    if (!newCustomerForm.password || newCustomerForm.password.length < 4)
      return setAdminMessage(t.passRequired);

    try {
      const userDoc = await getDoc(doc(db, "users", targetUsername));
      if (userDoc.exists()) {
        return setAdminMessage("Username already exists");
      }

      // Security check: Only owner can create admin accounts
      if (newCustomerForm.role === "admin" && !isOwner) {
        return setAdminMessage("Only owner can create admin accounts");
      }

      const userData = { ...newCustomerForm, username: targetUsername };
      // Optimistic update
      setUsers((prev) => [...prev, userData]);
      
      await setDoc(doc(db, "users", targetUsername.toLowerCase()), userData);
      setNewCustomerForm({ username: "", password: "", role: "customer" });
      setAdminMessage(t.userCreated);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      // Revert optimistic update
      setUsers((prev) => prev.filter(u => u.username !== targetUsername));
      console.error("Create user error:", err);
      setAdminMessage("Error creating user");
    }
  };

  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<User>({ username: "", password: "", role: "customer" });

  const handleRenameUser = async (oldUsername: string, newData: User) => {
    try {
      setAdminMessage(`Renaming ${oldUsername}...`);
      const oldLower = (oldUsername || "").toLowerCase();
      const newLower = (newData.username || "").toLowerCase();

      // 1. Check if new username exists
      if (oldLower !== newLower) {
        const newSnap = await getDoc(doc(db, "users", newLower));
        if (newSnap.exists()) throw new Error("Target username exists");
      }

      // 2. Fetch all runs from old user
      const runsRef = collection(db, "users", oldLower, "runs");
      const runsSnap = await getDocs(runsRef);
      const runsData = runsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Create new user doc
      const userToSave = { ...newData };
      if (userToSave.boundDeviceId === undefined) delete userToSave.boundDeviceId;
      await setDoc(doc(db, "users", newLower), userToSave);

      // 4. Migrate runs
      if (runsData.length > 0) {
        const batch = writeBatch(db);
        for (const run of runsData) {
          const { id, ...data } = run;
          batch.set(doc(db, "users", newLower, "runs", id), data);
        }
        await batch.commit();

        // 5. Delete old runs
        const deleteBatch = writeBatch(db);
        runsSnap.docs.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      // 6. Delete old user doc
      await deleteDoc(doc(db, "users", oldLower));

      // 7. Update local state
      setUsers(prev => prev.map(u => u.username === oldUsername ? newData : u));
      if (currentUser?.username === oldUsername) {
        setCurrentUser(newData);
        saveAuthToStorage(newData);
      }

      setAdminMessage("User updated and migrated");
      setUserToEdit(null);
    } catch (err: any) {
      console.error(err);
      setAdminMessage(err.message || "Update failed");
    }
    setTimeout(() => setAdminMessage(""), 3000);
  };

  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!editForm.username || editForm.username.trim() === "") {
      setAdminMessage("Username cannot be empty");
      setTimeout(() => setAdminMessage(""), 3000);
      return;
    }

    if (editForm.username !== userToEdit.username) {
      await handleRenameUser(userToEdit.username, editForm);
    } else {
      try {
        const userToSave = { ...editForm };
        if (userToSave.boundDeviceId === undefined) delete userToSave.boundDeviceId;
        await setDoc(doc(db, "users", (editForm.username || "").toLowerCase()), userToSave, { merge: true });
        setUsers(prev => prev.map(u => u.username === userToEdit.username ? editForm : u));
        if (currentUser?.username === userToEdit.username) {
          setCurrentUser(editForm);
          saveAuthToStorage(editForm);
        }
        setAdminMessage("User updated");
        setUserToEdit(null);
      } catch (err) {
        setAdminMessage("Update failed");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    }
  };

  const handleDeleteUser = (username: string) => {
    const lowerName = (username || "").toLowerCase();
    
    // Security check: Only owner can delete admins or other owners
    const targetUser = users.find(u => (u.username || "").toLowerCase() === lowerName);
    
    if (targetUser?.role === "owner" && ["owner27"].includes(lowerName)) return; // Primary safety
    if (lowerName === (currentUser?.username || "").toLowerCase()) return; // Protect self
    
    if (targetUser && targetUser.role === "owner" && !isMainOwner && lowerName !== "atmin") {
      setAdminMessage("Only the main owner can delete owners");
      setTimeout(() => setAdminMessage(""), 3000);
      return;
    }

    setUserToDelete(username);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const lowerName = String(userToDelete).toLowerCase();
        
        // Optimistic update
        const deletedUser = users.find(u => u.username === userToDelete);
        setUsers((prev) => prev.filter((u) => u.username !== userToDelete));

        // Delete runs subcollection first
        const runsRef = collection(db, "users", lowerName, "runs");
        const runsSnapshot = await getDocs(runsRef);
        const batch = writeBatch(db);
        runsSnapshot.forEach((runDoc) => {
          batch.delete(runDoc.ref);
        });
        
        // Delete the user document
        batch.delete(doc(db, "users", lowerName));
        
        await batch.commit();
        setUserToDelete(null);
        setAdminMessage("User deleted successfully");
      } catch (err) {
        // Revert optimistic update
        if (userToDelete) {
           const deletedUser = users.find(u => u.username === userToDelete);
           if (deletedUser) setUsers((prev) => [...prev, deletedUser]);
        }
        console.error("Delete user error:", err);
        setAdminMessage("Error deleting user");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    }
  };

  const handleMasterReset = async () => {
    requireConfirm("MASTER RESET", "CRITICAL: All users and history will be DELETED. The new Admin account will be created. Continue?", async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        for (const userDoc of usersSnapshot.docs) {
          const username = userDoc.id;
          // Delete runs
          const runsSnapshot = await getDocs(collection(db, "users", username, "runs"));
          const batch = writeBatch(db);
          runsSnapshot.forEach(r => batch.delete(r.ref));
          // Delete user
          batch.delete(userDoc.ref);
          await batch.commit();
        }
        
        // Create requested Admin account
        await setDoc(doc(db, "users", "atmin"), {
          username: "Atmin",
          password: "AtminDragRace27",
          role: "owner"
        });
        
        setAdminMessage("MASTER RESET COMPLETE. New Admin created.");
      } catch (err) {
        console.error("Master reset error:", err);
        setAdminMessage("Reset Error");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    });
  };

  const handleResetDevice = async (username: string) => {
    try {
      const userRef = doc(db, "users", String(username).toLowerCase());
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        await setDoc(userRef, { ...userData, boundDeviceId: deleteField() });
        setAdminMessage(TRANSLATIONS[lang].resetDevice + " OK");
      }
    } catch (err) {
      console.error("Reset device error:", err);
      setAdminMessage("Error resetting device");
    }
    setTimeout(() => setAdminMessage(""), 3000);
  };

  // Refs for GPS callback to avoid re-triggering watchPosition
  const isLiveRef = useRef(isLive);
  const isActiveRef = useRef(isActive);
  const maxSpeedRef = useRef(maxSpeed);
  const accuracyRef = useRef(accuracy);
  const splitsRef = useRef(splits);
  const elapsedTimeRef = useRef(elapsedTime);
  const selectedTargetsRef = useRef(selectedTargets);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  useEffect(() => {
    maxSpeedRef.current = maxSpeed;
  }, [maxSpeed]);
  useEffect(() => {
    accuracyRef.current = accuracy;
  }, [accuracy]);
  useEffect(() => {
    splitsRef.current = splits;
  }, [splits]);
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);
  useEffect(() => {
    distanceCoveredRef.current = distanceCovered;
  }, [distanceCovered]);
  useEffect(() => {
    peakGRef.current = peakG;
  }, [peakG]);
  useEffect(() => {
    selectedTargetsRef.current = selectedTargets;
  }, [selectedTargets]);

  const startPointRef = useRef<GPSPoint | null>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);
  const timerRef = useRef<number | null>(null);
  const pointsRef = useRef<GPSPoint[]>([]);
  const sessionTelemetryRef = useRef<
    { time: number; speed: number; accel: number }[]
  >([]);
  const sessionHzValuesRef = useRef<number[]>([]);

  // System Status monitor (Battery & Signal)
  useEffect(() => {
    // Battery
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setBatteryCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
        return () => {
          battery.removeEventListener("levelchange", updateBattery);
          battery.removeEventListener("chargingchange", updateBattery);
        };
      });
    }

    // Signal/Connection
    const updateConnection = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setSignalBars(0);
        return;
      }

      const conn = (navigator as any).connection;
      if (conn) {
        if (conn.effectiveType === "4g") setSignalBars(4);
        else if (conn.effectiveType === "3g") setSignalBars(3);
        else if (conn.effectiveType === "2g") setSignalBars(2);
        else setSignalBars(1);
      } else {
        setSignalBars(4); // Default to full if unknown but online
      }
    };

    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener("change", updateConnection);

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      if (conn) conn.removeEventListener("change", updateConnection);
    };
  }, []);

  const t = TRANSLATIONS[lang];

  // --- SENSOR FUSION REFS ---
  const fusedSpeedRef = useRef<number>(0); 
  const lastAccelTimestampRef = useRef<number>(performance.now());
  const accelIntegrationRef = useRef<number>(0);
  const lastGpsSpeedRef = useRef<number>(0);
  
  // Vector Auto-Calibration
  const forwardVectorRef = useRef<{x: number, y: number, z: number} | null>(null);
  const smoothedAccelRef = useRef<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0});
  const calibrationConfidenceRef = useRef<number>(0);

  // Save changes
  useEffect(() => {
    localStorage.setItem("race_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("race_targets", JSON.stringify(selectedTargets));
  }, [selectedTargets]);

  useEffect(() => {
    localStorage.setItem("race_lang", lang);
  }, [lang]);

  const dailyBestIds = useMemo(() => {
    const bests: Record<string, string> = {}; // key: date_distance, value: runId
    const bestTimes: Record<string, number> = {};

    history.forEach((run) => {
      const d = new Date(run.date);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      // Round distance to avoid tiny floating point differences
      const distKey = `${dateKey}_${Math.round(run.totalDistance)}`;

      if (!bestTimes[distKey] || run.totalTime < bestTimes[distKey]) {
        bestTimes[distKey] = run.totalTime;
        bests[distKey] = run.id;
      }
    });

    return new Set(Object.values(bests));
  }, [history]);

  // G-Force Sensor Calibration
  useEffect(() => {
    // Sensor warmth/stabilization timer
    const timer = setTimeout(() => setIsSensorReady(true), 2500);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsSensorReady(false);
        setTimeout(() => setIsSensorReady(true), 2500);
      } else {
        setIsSensorReady(false);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const lastUIUpdateRef = useRef(0);
  
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isSensorReady || !event.acceleration) return;

    const accel = event.acceleration;
    const now = performance.now();
    const dt = (now - lastAccelTimestampRef.current) / 1000;
    lastAccelTimestampRef.current = now;

    if (accel && accel.x !== null && accel.y !== null && accel.z !== null) {
        // Apply Low-Pass Filter
        smoothedAccelRef.current.x = smoothedAccelRef.current.x + ALPHA * ((accel.x || 0) - smoothedAccelRef.current.x);
        smoothedAccelRef.current.y = smoothedAccelRef.current.y + ALPHA * ((accel.y || 0) - smoothedAccelRef.current.y);
        smoothedAccelRef.current.z = smoothedAccelRef.current.z + ALPHA * ((accel.z || 0) - smoothedAccelRef.current.z);

        // Calculate G-Force magnitude
        const totalAcceleration = Math.sqrt(
            (smoothedAccelRef.current.x ** 2) + 
            (smoothedAccelRef.current.y ** 2) + 
            (smoothedAccelRef.current.z ** 2)
        );
        
        let currentG = totalAcceleration / 9.81;

        if (isNaN(currentG) || currentG > 5) return;
        if (currentG < 0.08) currentG = 0;

        // Peak update
        if (currentG > peakGRef.current) {
            peakGRef.current = parseFloat(currentG.toFixed(2));
        }

        // Smoothing and Peak tracking - THROTTLED to 10 FPS
        if (now - lastUIUpdateRef.current > 100) {
          setGForce(parseFloat(currentG.toFixed(2)));
          setPeakG(peakGRef.current);
          lastUIUpdateRef.current = now;
        }

        // --- REFINED SENSOR FUSION INTEGRATION ---
        if (isActiveRef.current || isLiveRef.current) {
          let projectedAccel = 0;
          
          if (forwardVectorRef.current) {
            // Ultra-Precise True Forward Acceleration via Dot Product (ignores side-to-side and vertical bumps!)
            projectedAccel = 
                (accel.x || 0) * forwardVectorRef.current.x + 
                (accel.y || 0) * forwardVectorRef.current.y + 
                (accel.z || 0) * forwardVectorRef.current.z;
          } else {
            // Fallback heuristic if not yet calibrated
            const totalAccel = Math.sqrt((accel.x || 0)**2 + (accel.y || 0)**2 + (accel.z || 0)**2);
            if (lastGpsSpeedRef.current !== lastGpsSpeedRef.current) { // Refactored
              // Need a way to track gpsTrend if it was in the old closure.
              // I will use Refs for these variables if I need to maintain state across calls.
            }
            projectedAccel = totalAccel; // Simply use total accel as fallback for now
          }

          // Convert dt from milliseconds to seconds just in case it was too big. Cap it at 0.1s to prevent huge jumps.
          const safeDt = Math.min(dt, 0.1);

          // Add to speed (v = u + at). 
          const frictionDecay = forwardVectorRef.current ? 0.999 : 0.98; // Very low decay if confident
          accelIntegrationRef.current = (accelIntegrationRef.current + projectedAccel * safeDt) * frictionDecay;
          
          // Fused speed is the last known good GPS speed + the change measured by accelerometer
          const estimatedSpeed = (lastGpsSpeedRef.current + accelIntegrationRef.current) * 3.6; // convert to km/h
          
          // Update the ref that the UI tick loop reads
          fusedSpeedRef.current = Math.max(0, estimatedSpeed);
        }
    }
  }, [isSensorReady]);

  // Accelerometer handling for G-Force & Sensor Fusion
  useEffect(() => {
    window.addEventListener("devicemotion", handleMotion as any);
    return () => window.removeEventListener("devicemotion", handleMotion as any);
  }, [handleMotion]);

  // Geolocation handling with aggressive watchdog
  useEffect(() => {
    let watchdog: number | null = null;
    
    const startWatchdog = () => {
      if (watchdog) window.clearInterval(watchdog);
      watchdog = window.setInterval(() => {
        if (isLiveRef.current) {
          const now = Date.now();
          if (lastGpsTimestampRef.current && (now - lastGpsTimestampRef.current > systemConfig.gpsWatchdogSpeed)) {
            console.warn("GPS Stale - Restarting watch...");
            lastGpsTimestampRef.current = now; // Give the new sensor time to breathe
            setGpsVersion(v => v + 1);
          }
        }
      }, 3000);
    };

    if (isLive) startWatchdog();

    // SMOOTH SPEED UPDATER (Sensor Fusion Loop)
    let speedLoop: number | null = null;
    if (isLive) {
      let lastSpeedUpdate = performance.now();
      const updateSpeedSmoothly = () => {
        // Fast UI refresh - no frame limit, relying on requestAnimationFrame sync
        if (!isActiveRef.current && isLiveRef.current) {
          setCurrentSpeed(fusedSpeedRef.current);
        }
        speedLoop = requestAnimationFrame(updateSpeedSmoothly);
      };
      speedLoop = requestAnimationFrame(updateSpeedSmoothly);
    }
    
    // AGGRESSIVE GPS BOOST: Recursive polling to force high-power states indefinitely
    // even if the device tries to throttle setInterval or watchPosition.
    let boostTimeout: number | null = null;
    let boostActive = true;
    
    // We run the poller continuously to keep the hardware warm.
    const aggressiveGpsPoller = () => {
      if (!boostActive) return;
      if (isLiveRef.current || isActiveRef.current) {
        // High frequency during active race or live mode to keep sensor polling hot
        navigator.geolocation.getCurrentPosition(
          () => {
            boostTimeout = window.setTimeout(aggressiveGpsPoller, 1000);
          }, 
          () => {
            boostTimeout = window.setTimeout(aggressiveGpsPoller, 2000);
          }, 
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        // Keeps GPS hardware initialized in background but slightly slower
        navigator.geolocation.getCurrentPosition(
          () => {
            boostTimeout = window.setTimeout(aggressiveGpsPoller, 3000);
          }, 
          () => {
            boostTimeout = window.setTimeout(aggressiveGpsPoller, 5000);
          },
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
      }
    };
    // Start the aggressive poller immediately
    aggressiveGpsPoller();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, altitude, heading } =
          position.coords;

        // --- ULTRA-PRECISION ACCURACY OPTIMIZATION ---
        setAccuracy(accuracy);
        setGpsAltitude(altitude);
        setGpsHeading(heading);

        // Reset watchdog upon receiving valid data
        if (isLiveRef.current) startWatchdog();

        // Calculate Hz and Precision Auto-Calibration
        if (lastGpsTimestampRef.current) {
          const diff = position.timestamp - lastGpsTimestampRef.current;
          if (diff > 0) {
            const diffSeconds = diff / 1000;
            const hz = 1000 / diff;
            setGpsHz(hz);
            if (isActiveRef.current) {
              sessionHzValuesRef.current.push(hz);
            }
            
            const rawSpeedKmr = (speed !== null && speed > 0.4 ? speed : 0) * 3.6;
            
            // Ultra-precise orientation auto-calibration using device linear acceleration
            const dv = rawSpeedKmr - lastGpsSpeedRef.current;
            const gpsAcceleration = dv / diffSeconds; // km/h/s
            
            // If GPS detects strong, sustained forward acceleration (>5 km/h/s, approx 0.14g), lock the vector!
            if (gpsAcceleration > 5.0) {
               const sA = smoothedAccelRef.current;
               const mag = Math.sqrt(sA.x**2 + sA.y**2 + sA.z**2);
               if (mag > 1.0) {
                 forwardVectorRef.current = {
                   x: sA.x / mag,
                   y: sA.y / mag,
                   z: sA.z / mag
                 };
                 // Gain confidence!
                 calibrationConfidenceRef.current = Math.min(100, calibrationConfidenceRef.current + 25);
               }
            } else if (rawSpeedKmr < 2 && gpsAcceleration > -2 && gpsAcceleration < 2) {
               // Stopped. Do not drop confidence heavily, maybe the phone is just resting.
               // We keep the vector!
            }
          }
        }
        lastGpsTimestampRef.current = position.timestamp;

        // 2. Determine if Signal is "Locked" (Accuracy < 10m is standard, < 5m is pro)
        const locked = accuracy !== null && accuracy <= 10;
        setIsGpsLocked(locked);

        // --- SPEED UI UPDATES ---
        const filteredSpeed = speed !== null && speed > 0.4 ? speed : 0;
        
        // RESET SENSOR FUSION WITH GROUND TRUTH
        // GPS Speed is our anchor. When it updates, we reset the accelerometer integration
        // and snap to the measured GPS speed.
        lastGpsSpeedRef.current = filteredSpeed;
        accelIntegrationRef.current = 0; 
        fusedSpeedRef.current = filteredSpeed * 3.6;
        
        const rawSpeedKmr = filteredSpeed * 3.6;
        const speedKmr = rawSpeedKmr;
        const now = Date.now();

        if (now - lastTelemetryUpdateRef.current > 120) {
          const newPoint = {
            time: `t-${now}`,
            speed: Math.round(speedKmr),
          };
          
          speedHistoryRef.current = [...(speedHistoryRef.current || []).slice(1), newPoint];
          lastTelemetryUpdateRef.current = now;
        }

        // 3. Noise Filtering: If signal is extremely poor (> 30m), we ignore this point for distance calculation
        if (accuracy > 30) return;

        const currentPoint: GPSPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: position.timestamp,
          speed: speed,
          accuracy: accuracy,
        };

        if (isActiveRef.current) {
          sessionTelemetryRef.current.push({
            time: elapsedTimeRef.current / 1000,
            speed: speedKmr,
            accel: gForce,
          });
        }

        setSessionMaxAccuracy((prev) =>
          accuracy < (prev || Infinity) ? accuracy : prev,
        );

        if (!isLiveRef.current) return;

        setMaxSpeed((prev) => {
          const nextMax = speedKmr > prev ? speedKmr : prev;
          maxSpeedRef.current = nextMax;
          return nextMax;
        });

        // Auto-start logic: tighter threshold to prevent jitter starts
        if (!isActiveRef.current && speedKmr > 2.0) {
          setIsActive(true);
          isActiveRef.current = true;
          setIsTouchLocked(true); // Auto-lock touch on start
          startPointRef.current = currentPoint;
          lastPointRef.current = currentPoint;
          pointsRef.current = [currentPoint];
          setElapsedTime(0);
          elapsedTimeRef.current = 0;
          setDistanceCovered(0);
          distanceCoveredRef.current = 0;

          const freshSplits = selectedTargetsRef.current.map((t) => ({
            ...t,
            time: undefined,
            speedAtSplit: undefined,
          }));
          setSplits(freshSplits);
          splitsRef.current = freshSplits;

          const startTime = performance.now();
          if (timerRef.current) cancelAnimationFrame(timerRef.current);
          
          let lastTickTime = startTime;
          let lastUpdate = startTime;
          let lastFusedMs = fusedSpeedRef.current / 3.6;
          
          let lastFusedKmhLoop1 = fusedSpeedRef.current;
          let lastTotalDistLoop1 = 0;
          let lastElapsedLoop1 = 0;
          
          const tick = (timeRaw: number) => {
            const now = performance.now();
            const elapsed = now - startTime;
            const dt = (now - lastTickTime) / 1000;
            lastTickTime = now;
            elapsedTimeRef.current = elapsed;
            
            // High precision 60Hz Doppler + Accel Integration
            const currentFusedKmh = fusedSpeedRef.current;
            const currentFusedMs = currentFusedKmh / 3.6;
            
            // Trapezoidal integration for higher distance accuracy
            if (currentFusedKmh > 1.0 || lastFusedMs > 0) {
              const avgSpeedMs = (currentFusedMs + lastFusedMs) / 2;
              distanceCoveredRef.current += avgSpeedMs * dt;
            }
            lastFusedMs = currentFusedMs;
            
            const totalDist = distanceCoveredRef.current;

            let splitReached = false;
            const nextSplits = splitsRef.current.map((s) => {
              if (!s.time) {
                const isSpeedSplit = s.type === "speed";
                const targetVal = isSpeedSplit ? s.targetSpeed : s.distance;
                const currentVal = isSpeedSplit ? currentFusedKmh : totalDist;
                const lastVal = isSpeedSplit ? lastFusedKmhLoop1 : lastTotalDistLoop1;
                  
                if (targetVal !== undefined && currentVal >= targetVal) {
                  splitReached = true;
                  
                  // Sub-frame EXACT mathematical interpolation
                  let exactTime = elapsed / 1000;
                  let exactSpeed = currentFusedKmh;
                  
                  if (currentVal > lastVal && currentVal > targetVal) {
                    const frac = (targetVal - lastVal) / (currentVal - lastVal);
                    // Interpolate the exact split time
                    exactTime = (lastElapsedLoop1 + frac * (elapsed - lastElapsedLoop1)) / 1000;
                    if (!isSpeedSplit) {
                      exactSpeed = lastFusedKmhLoop1 + frac * (currentFusedKmh - lastFusedKmhLoop1);
                    } else {
                      exactSpeed = targetVal;
                    }
                  }

                  return {
                    ...s,
                    time: exactTime,
                    speedAtSplit: exactSpeed,
                  };
                }
              }
              return s;
            });
            
            lastFusedKmhLoop1 = currentFusedKmh;
            lastTotalDistLoop1 = totalDist;
            lastElapsedLoop1 = elapsed;
            
            if (splitReached) {
              splitsRef.current = nextSplits;
              setSplits(nextSplits);
            }
            
            // Auto stop check
            const allTargetsPassed = nextSplits.every(s => s.time !== undefined);
            if (selectedTargetsRef.current.length > 0 && allTargetsPassed) {
               handleStop(totalDist, elapsed, nextSplits);
               return; // break loop
            }
            
            // Uncapped UI Sync at screen refresh rate
            setElapsedTime(elapsed);
            setDistanceCovered(totalDist);
            setCurrentSpeed(currentFusedKmh);
            
            if (isLiveRef.current && isActiveRef.current) {
              timerRef.current = requestAnimationFrame(tick);
            }
          };
          timerRef.current = requestAnimationFrame(tick);
        }

        if (isActiveRef.current && lastPointRef.current) {
          // Just save track points for the map view, ignore distances
          pointsRef.current.push(currentPoint);
          lastPointRef.current = currentPoint;
        }
      },
      (error) => {
        console.error("Geo error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000, // Increased timeout slightly to avoid frequent errors, but accuracy remains top priority
      },
    );

    return () => {
      boostActive = false;
      navigator.geolocation.clearWatch(watchId);
      if (watchdog) window.clearInterval(watchdog);
      if (boostTimeout) window.clearTimeout(boostTimeout);
      if (speedLoop) cancelAnimationFrame(speedLoop);
    };
  }, [gpsVersion]); // ONLY depend on version (manual reset)

  const calibrateGPS = () => {
    playSound("click");
    setGpsVersion((v) => v + 1);
    // Force a small notification or just trust the re-mount
  };

  const handleStart = () => {
    setIsLive(true);
    setIsActive(false);
    isActiveRef.current = false;
    isLiveRef.current = true;
    setMaxSpeed(0);
    maxSpeedRef.current = 0;
    setPeakG(0);
    peakGRef.current = 0;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setDistanceCovered(0);
    distanceCoveredRef.current = 0;
    setSessionMaxAccuracy(null);
    sessionTelemetryRef.current = [];
    sessionHzValuesRef.current = [];
    setSplits(
      selectedTargets.map((t) => ({
        ...t,
        time: undefined,
        speedAtSplit: undefined,
      })),
    );
  };

  const handleForceLaunch = () => {
    if (!isLiveRef.current || isActiveRef.current) return;

    setIsActive(true);
    isActiveRef.current = true;
    setIsTouchLocked(true);
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setDistanceCovered(0);
    distanceCoveredRef.current = 0;

    const freshSplits = selectedTargetsRef.current.map((t) => ({
      ...t,
      time: undefined,
      speedAtSplit: undefined,
    }));
    setSplits(freshSplits);
    splitsRef.current = freshSplits;

    const startTime = performance.now();
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    let lastTickTime = startTime;
    let lastUpdate = startTime;
    let lastFusedMs = fusedSpeedRef.current / 3.6;
    
    let lastFusedKmhLoop2 = fusedSpeedRef.current;
    let lastTotalDistLoop2 = 0;
    let lastElapsedLoop2 = 0;
    
    const tick = (timeRaw: number) => {
      const now = performance.now();
      const elapsed = now - startTime;
      const dt = (now - lastTickTime) / 1000;
      lastTickTime = now;
      elapsedTimeRef.current = elapsed;
      
      // High precision 60Hz Doppler + Accel Integration
      const currentFusedKmh = fusedSpeedRef.current;
      const currentFusedMs = currentFusedKmh / 3.6;
      
      // Trapezoidal integration for higher distance accuracy
      if (currentFusedKmh > 1.0 || lastFusedMs > 0) {
        const avgSpeedMs = (currentFusedMs + lastFusedMs) / 2;
        distanceCoveredRef.current += avgSpeedMs * dt;
      }
      lastFusedMs = currentFusedMs;
      
      const totalDist = distanceCoveredRef.current;

      let splitReached = false;
      const nextSplits = splitsRef.current.map((s) => {
        if (!s.time) {
          const isSpeedSplit = s.type === "speed";
          const targetVal = isSpeedSplit ? s.targetSpeed : s.distance;
          const currentVal = isSpeedSplit ? currentFusedKmh : totalDist;
          const lastVal = isSpeedSplit ? lastFusedKmhLoop2 : lastTotalDistLoop2;
            
          if (targetVal !== undefined && currentVal >= targetVal) {
            splitReached = true;
            
            let exactTime = elapsed / 1000;
            let exactSpeed = currentFusedKmh;
            
            if (currentVal > lastVal && currentVal > targetVal) {
              const frac = (targetVal - lastVal) / (currentVal - lastVal);
              exactTime = (lastElapsedLoop2 + frac * (elapsed - lastElapsedLoop2)) / 1000;
              if (!isSpeedSplit) {
                exactSpeed = lastFusedKmhLoop2 + frac * (currentFusedKmh - lastFusedKmhLoop2);
              } else {
                exactSpeed = targetVal;
              }
            }

            return {
              ...s,
              time: exactTime,
              speedAtSplit: exactSpeed,
            };
          }
        }
        return s;
      });
      
      lastFusedKmhLoop2 = currentFusedKmh;
      lastTotalDistLoop2 = totalDist;
      lastElapsedLoop2 = elapsed;
      
      if (splitReached) {
        splitsRef.current = nextSplits;
        setSplits(nextSplits);
      }
      
      // Auto stop check
      const allTargetsPassed = nextSplits.every(s => s.time !== undefined);
      if (selectedTargetsRef.current.length > 0 && allTargetsPassed) {
         handleStop(totalDist, elapsed, nextSplits);
         return; // break loop
      }
      
      // Uncapped UI Sync at screen refresh rate
      setElapsedTime(elapsed);
      setDistanceCovered(totalDist);
      setCurrentSpeed(currentFusedKmh);
      
      if (isLiveRef.current && isActiveRef.current) {
        timerRef.current = requestAnimationFrame(tick);
      }
    };
    timerRef.current = requestAnimationFrame(tick);
    playSound("success");
  };

  const handleStop = (
    finalDistance?: number | any,
    finalTime?: number,
    finalSplits?: Split[],
  ) => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    if (isActiveRef.current) {
      // If triggered by a button click event, finalDistance will be an object.
      // We only want numbers for automatic stops.
      const isAutoStop = typeof finalDistance === "number";
      const effectiveDistance = isAutoStop ? finalDistance : distanceCoveredRef.current;
      const effectiveTime =
        typeof finalTime === "number" ? finalTime : elapsedTimeRef.current;
      const effectiveSplits = Array.isArray(finalSplits) ? finalSplits : splitsRef.current;

      const avgHz =
        sessionHzValuesRef.current.length > 0
          ? sessionHzValuesRef.current.reduce((a, b) => a + b, 0) /
            sessionHzValuesRef.current.length
          : gpsHz;

      const calculatedAvgSpeed = (effectiveTime > 0) ? (effectiveDistance / (effectiveTime / 1000)) * 3.6 : 0;

      const rawRun: RaceRun = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        date: Date.now(),
        totalDistance: effectiveDistance,
        totalTime: effectiveTime,
        maxSpeed: maxSpeedRef.current,
        avgSpeed: isFinite(calculatedAvgSpeed) ? calculatedAvgSpeed : 0,
        peakG: peakGRef.current || 0,
        accuracy: accuracyRef.current || 0,
        avgHz: avgHz || 0,
        splits: [...effectiveSplits],
        telemetry: [...sessionTelemetryRef.current],
        username: currentUser ? currentUser.username : localPilotName,
      };

      const newRun = JSON.parse(JSON.stringify(rawRun)) as RaceRun;

      setIsSaving(true);

      const finalizeSave = () => {
        setIsActive(false);
        isActiveRef.current = false;
        setIsLive(false);
        isLiveRef.current = false;
        setIsTouchLocked(false);
        playSound("click");

        // Small delay to let user see "SAVED" state
        setTimeout(() => setIsSaving(false), 2000);
      };

      if (isLoggedIn && currentUser?.username) {
        const usernameKey = currentUser.username.toLowerCase();
        
        // Optimistic UI update: resolve the saving state immediately
        finalizeSave();
        
        // Background sync
        setDoc(doc(db, "users", usernameKey, "runs", newRun.id), newRun)
          .catch(e => {
            handleFirestoreError(e, OperationType.WRITE, `users/${usernameKey}/runs/${newRun.id}`);
          });
      } else {
        setHistory((prev) => [newRun, ...prev]);
        finalizeSave();
      }
      return; // Exit early since we handle state in finalizeSave
    }

    setIsActive(false);
    isActiveRef.current = false;
    setIsLive(false);
    isLiveRef.current = false;
    setIsTouchLocked(false);
    playSound("click");
  };

  const deleteHistory = async (id: string) => {
    playSound("click");
    requireConfirm("Delete Run", t.deleteConfirm || "Delete this run?", async () => {
      if (isLoggedIn && currentUser?.username) {
        const usernameKey = currentUser.username.toLowerCase();
        try {
          // Optimistic update
          setHistory((prev) => prev.filter((h) => h.id !== id));
          await deleteDoc(doc(db, "users", usernameKey, "runs", id));
        } catch (e) {
          // Revert optimistic update on failure
          setHistory((prev) => [...prev, history.find((h) => h.id === id)].filter(Boolean) as any);
          handleFirestoreError(e, OperationType.DELETE, `users/${usernameKey}/runs/${id}`);
        }
      } else {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    });
  };

  const clearHistory = async () => {
    playSound("click");
    requireConfirm("Clear History", t.deleteConfirm || "Are you sure?", async () => {
      playSound("error");
      if (isLoggedIn && currentUser?.username) {
        const usernameKey = currentUser.username.toLowerCase();
        try {
          const q = query(collection(db, "users", usernameKey, "runs"));
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);
          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${usernameKey}/runs`);
        }
      } else {
        setHistory([]);
      }
    });
  };

  const blurClass = systemConfig.lowFX ? "" : "backdrop-blur-md";
  const blurXlClass = systemConfig.lowFX ? "" : "backdrop-blur-xl";
  const blurSmClass = systemConfig.lowFX ? "" : "backdrop-blur-sm";
  const blurLgClass = systemConfig.lowFX ? "" : "backdrop-blur-lg";

  return (
    <div className={`min-h-screen bg-[linear-gradient(to_bottom_right,#000000,#0f0c29,#302b63,#000000)] text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden relative ${systemConfig.lowFX ? 'low-fx-active' : ''} landscape:max-h-screen landscape:overflow-y-auto`}>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {!systemConfig.lowFX && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[50vw] rounded-full bg-fuchsia-600/10 blur-[120px]" />
          </>
        )}
      </div>
      <AnimatePresence>
        {broadcastMessage && broadcastMessage !== dismissedBroadcast && broadcastMessage !== "test" && !isOwner && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border border-violet-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-violet-600">
                <motion.div 
                  className="h-full bg-white/50"
                  initial={{ width: "100%" }} animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  onAnimationComplete={() => {
                    setDismissedBroadcast(broadcastMessage);
                    localStorage.setItem("race_dismissed_broadcast", broadcastMessage);
                  }}
                />
              </div>
              <div className="bg-violet-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-black text-white text-center uppercase mb-2">Notice</h3>
              <p className="text-gray-300 text-center text-sm leading-relaxed mb-8">{broadcastMessage}</p>
              <button 
                onClick={() => {
                  setDismissedBroadcast(broadcastMessage);
                  localStorage.setItem("race_dismissed_broadcast", broadcastMessage);
                }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-widest shadow-lg shadow-violet-600/20"
              >
                Tutup Pesan
              </button>
            </motion.div>
          </motion.div>
        )}
        {isOffline && (
          <motion.div 
            initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-[10px] font-black uppercase py-1 text-center flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-3 h-3" /> Offline Mode - Some features may be limited
          </motion.div>
        )}
        {maintenanceMode && !isOwner && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <Lock className="w-16 h-16 text-violet-500 mb-6 animate-pulse" />
            <h2 className="text-4xl font-black text-white uppercase mb-2 tracking-tighter">{systemName}</h2>
            <p className="text-violet-500 font-bold uppercase tracking-widest text-[10px] mb-8">System Upgrade in Progress</p>
            <div className="w-12 h-1 bg-violet-500/20 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className="h-full bg-violet-500"
                animate={{ x: [-50, 50] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed uppercase font-bold tracking-tight">
              Tuning current engines for maximum performance. Standby for reconnection.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!hasAgreedToSafety && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-xs w-full flex flex-col items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-violet-600/10 border border-violet-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                <AlertTriangle className="w-10 h-10 text-violet-500 relative z-10" />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-black italic tracking-widest text-white uppercase">
                  {t.safetyNotice}
                </h2>
                <div className="h-1 w-12 bg-violet-600 mx-auto rounded-full" />
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">
                  {t.disclaimer}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setHasAgreedToSafety(true);
                  localStorage.setItem("race_safety_agreed", "true");
                  triggerVibrate(10);
                }}
                className="w-full py-5 bg-violet-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-2xl shadow-violet-600/40 border border-violet-400/30"
              >
                {t.iAgree}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-violet-600/40 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-600/40 blur-[80px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.main
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className={`w-full max-w-sm bg-gray-900/60 ${blurXlClass} border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mb-4 border border-violet-500/20">
                  <Flag className="w-8 h-8 text-violet-500 -rotate-12 fill-violet-500/20" />
                </div>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                  DRAG <span className="text-violet-500">RACE</span>
                </h1>
              </div>

              {loginError && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase text-center py-3 rounded-xl animate-shake">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder={t.username.toUpperCase()}
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder={t.password.toUpperCase()}
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1 mb-2">
                    <div
                      onClick={() =>
                        setLoginForm((prev) => ({
                          ...prev,
                          rememberMe: !prev.rememberMe,
                        }))
                      }
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          loginForm.rememberMe
                            ? "bg-violet-600 border-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                            : "bg-gray-950 border-gray-800 group-hover:border-gray-700"
                        }`}
                      >
                        {loginForm.rememberMe && (
                          <CheckSquare className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {t.rememberMe}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="w-full py-5 bg-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-violet-600/20 text-white mt-4 border border-violet-400/30"
                  >
                    {t.signIn}
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </motion.button>
                  
                  {!isLoggedIn && loginError && loginForm.username.toLowerCase() === "atmin" && (
                    <p className="text-[9px] text-violet-400 font-bold italic text-center animate-pulse mt-4">
                      Hint: AtminDragRace27
                    </p>
                  )}
                  {!isLoggedIn && loginError && loginForm.username.toLowerCase() === "owner27" && (
                    <p className="text-[9px] text-violet-400 font-bold italic text-center animate-pulse mt-4">
                      Hint: owner27
                    </p>
                  )}
                </form>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col p-4 pt-safe pb-safe touch-manipulation"
          >
            {/* System Bar */}
            <div className="flex justify-end items-center gap-3 mb-2 px-1">
              <div className="flex items-center gap-1.5 mr-auto">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"}`}
                />
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? "text-gray-500" : "text-red-500 italic"}`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {broadcastMessage && broadcastMessage !== dismissedBroadcast && broadcastMessage !== "test" && (
                <div className="flex-1 mx-4 overflow-hidden bg-violet-600/10 border border-violet-500/20 rounded h-4 flex items-center">
                  <motion.div
                    animate={{ x: [200, -400] }}
                    transition={{ duration: 15, ease: "linear" }}
                    onAnimationComplete={() => {
                      setDismissedBroadcast(broadcastMessage);
                      localStorage.setItem("race_dismissed_broadcast", broadcastMessage);
                    }}
                    className="whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-violet-400 italic"
                  >
                   SYSTEM BROADCAST: {broadcastMessage}
                  </motion.div>
                </div>
              )}

              <div className="flex items-center gap-1">
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3, 4].map((b) => (
                    <div
                      key={b}
                      className={`w-0.5 rounded-full transition-all ${b <= signalBars ? "bg-violet-400" : "bg-gray-800"}`}
                      style={{ height: `${25 * b}%` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-black text-gray-500 font-mono italic ml-1">
                  {signalBars === 4
                    ? "LTE"
                    : signalBars === 3
                      ? "4G"
                      : signalBars === 2
                        ? "3G"
                        : signalBars === 1
                          ? "E"
                          : "OFF"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-900/40 px-2 py-0.5 rounded-full border border-gray-800/50">
                <span className="text-[9px] font-black font-mono text-gray-400">
                  {batteryLevel}%
                </span>
                <div className="relative">
                  {batteryLevel > 80 ? (
                    <BatteryFull
                      className={`w-3.5 h-3.5 ${batteryCharging ? "text-green-400" : "text-gray-400"}`}
                    />
                  ) : batteryLevel > 30 ? (
                    <BatteryMedium
                      className={`w-3.5 h-3.5 ${batteryCharging ? "text-green-400" : "text-gray-400"}`}
                    />
                  ) : (
                    <BatteryLow
                      className={`w-3.5 h-3.5 ${batteryCharging ? "text-green-400" : "text-red-500 animate-pulse"}`}
                    />
                  )}
                  {batteryCharging && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Header */}
            {view !== "welcome" && (
              <header className="flex items-center justify-between py-2 border-b border-gray-800 mb-4">
                <div className="flex flex-col">
                  <h1 className="text-base font-black tracking-tighter flex items-center gap-1.5 italic uppercase leading-none">
                    <Flag className="w-3.5 h-3.5 text-violet-500 -rotate-12 fill-violet-500/20" />
                    DRAG <span className="text-violet-500">RACE</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] not-italic font-mono bg-violet-500 text-black px-1 py-0.5 rounded font-black tracking-tighter">
                      L.A PRO+
                    </span>
                    <p className="text-[7px] text-gray-700 uppercase tracking-[0.2em] font-mono leading-none">
                      {t.elitePerformance}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 bg-gray-950/80 p-0.5 rounded-full border border-gray-800">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateView("dashboard")}
                    className={`p-1.5 rounded-full transition-all ${view === "dashboard" ? "bg-violet-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                    title={t.dashboard}
                  >
                    <Gauge className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateView("charts")}
                    className={`p-1.5 rounded-full transition-all ${view === "charts" ? "bg-violet-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                    title={t.charts}
                  >
                    <Activity className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateView("history")}
                    className={`p-1.5 rounded-full transition-all ${view === "history" ? "bg-violet-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                    title={t.history}
                  >
                    <HistoryIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateView("settings")}
                    className={`p-1.5 rounded-full transition-all ${view === "settings" ? "bg-violet-500 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                    title={t.settings}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                </div>
              </header>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {view === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden"
                >
                  {/* Performance Background elements */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-12 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
                  </div>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="relative z-10 w-full flex flex-col items-center"
                  >
                    <div className="flex flex-col items-center mb-12">
                      <div className="relative mb-8 group">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-gray-900 p-8 rounded-[3rem] border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
                           <Flag className="w-20 h-20 text-violet-500 relative z-10 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] fill-violet-500/10" />
                        </motion.div>
                        <div className="absolute -bottom-4 -right-4 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-violet-400/50 italic tracking-tighter">
                          PRO+ SERIES
                        </div>
                      </div>

                      <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase leading-none">
                        DRAG <span className="text-violet-500">RACE</span>
                      </h1>
                      <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-violet-500/50" />
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] italic">
                          L.A TECH DIVISION
                        </p>
                        <div className="h-px w-8 bg-violet-500/50" />
                      </div>
                    </div>

                    <div className="space-y-6 w-full max-w-sm mb-12 text-center">
                      <p className="text-sm text-gray-400 leading-relaxed font-medium italic px-6">
                        {t.precisionGPS}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                          <Signal className="w-5 h-5 text-violet-500 mb-2 mx-auto" />
                          <p className="text-[10px] font-black text-white uppercase mb-1">1Hz Precision</p>
                          <p className="text-[8px] text-gray-500 leading-none uppercase tracking-widest font-bold font-mono italic">Live telemetry</p>
                        </div>
                        <div className="bg-gray-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                          <Activity className="w-5 h-5 text-blue-500 mb-2 mx-auto" />
                          <p className="text-[10px] font-black text-white uppercase mb-1">Real-time G's</p>
                          <p className="text-[8px] text-gray-500 leading-none uppercase tracking-widest font-bold font-mono italic">Sensor Fusion</p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigateView("dashboard")}
                      className="w-full bg-white text-black font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 text-lg italic tracking-tight group hover:bg-violet-500 hover:text-white"
                    >
                      {t.enterTrack}
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-10 text-[8px] font-mono tracking-[0.5em] uppercase"
                  >
                    Authorized by L.A Tech Division
                  </motion.p>
                </motion.div>
              )}

              {view === "dashboard" && (
                <DashboardView 
                  key="dashboard-view"
                  t={t} 
                  currentSpeed={currentSpeed} 
                  accuracy={accuracy} 
                  gpsHz={gpsHz} 
                  gpsVersion={gpsVersion} 
                  calibrateGPS={calibrateGPS} 
                  maxSpeed={maxSpeed} 
                  elapsedTime={elapsedTime} 
                  distanceCovered={distanceCovered} 
                  splits={splits} 
                  isActive={isActive} 
                  isLive={isLive}
                  isTouchLocked={isTouchLocked}
                  setIsTouchLocked={setIsTouchLocked}
                  gForce={gForce} 
                  peakG={peakG} 
                  gpsAltitude={gpsAltitude} 
                  gpsHeading={gpsHeading} 
                  isGpsLocked={isGpsLocked} 
                  formatTime={formatTime}
                  formatDistance={formatDistance}
                  navigateView={navigateView}
                  systemConfig={systemConfig}
                  fastestRun={fastestRun}
                  systemStats={systemStats}
                  isAdminOrOwner={isAdminOrOwner}
                />
              )}

              {view === "history" && (
                <motion.div
                  key="history-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col gap-4 will-change-[opacity,transform]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                      {t.pastSessions}
                    </h2>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 p-1"
                      >
                        {t.deleteAll}
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-12 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                      <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">
                        {t.noHistory}
                        <br />
                        <span className="text-xs opacity-50">
                          {t.takeFirstTest}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {history.map((run, index) => {
                        const currentDate = new Date(
                          run.date,
                        ).toLocaleDateString(
                          lang === "id" ? "id-ID" : "en-US",
                          { day: "2-digit", month: "long", year: "numeric" },
                        );
                        const previousDate =
                          index > 0
                            ? new Date(
                                history[index - 1].date,
                              ).toLocaleDateString(
                                lang === "id" ? "id-ID" : "en-US",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : null;
                        const showDivider = currentDate !== previousDate;

                        return (
                          <React.Fragment key={`${run.id}-${index}`}>
                            {showDivider && (
                              <div className="flex items-center gap-4 pt-4 pb-2 px-1">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 whitespace-nowrap bg-gray-950/50 px-3 py-1 rounded-full border border-violet-500/10">
                                  {currentDate}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-800" />
                              </div>
                            )}
                            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-2">
                                  <p className="text-[10px] text-gray-400 font-mono mb-1 bg-gray-950/50 inline-block px-2 py-0.5 rounded border border-gray-800 self-start">
                                    {new Date(run.date).toLocaleTimeString(
                                      lang === "id" ? "id-ID" : "en-US",
                                      { hour12: false },
                                    )}{" "}
                                    •{" "}
                                    {new Date(run.date).toLocaleDateString(
                                      lang === "id" ? "id-ID" : "en-US",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      },
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xl font-black italic text-violet-500 uppercase leading-none">
                                      {run.maxSpeed.toFixed(0)}{" "}
                                      <span className="text-xs text-violet-400">
                                        {t.maxSpeed.toUpperCase()}
                                      </span>
                                    </p>
                                    {dailyBestIds.has(run.id) && (
                                      <div className="flex items-center gap-1 bg-violet-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black italic">
                                        <Trophy className="w-2 h-2 fill-current" />
                                        {t.dailyBest}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setExpandedHistoryId(
                                        expandedHistoryId === run.id
                                          ? null
                                          : run.id,
                                      )
                                    }
                                    className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 ${expandedHistoryId === run.id ? "bg-violet-500 border-violet-400 text-white" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600"}`}
                                  >
                                    <span className="text-[10px] font-black uppercase tracking-widest px-1">
                                      {t.details}
                                    </span>
                                    <motion.div
                                      animate={{
                                        rotate:
                                          expandedHistoryId === run.id
                                            ? 180
                                            : 0,
                                      }}
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </motion.div>
                                  </button>
                                  <button
                                    onClick={() => deleteHistory(run.id)}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-black/20 p-2 rounded-xl relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/20 group-hover:bg-violet-500 transition-colors" />
                                  <div className="text-[8px] uppercase text-gray-500 mb-1">
                                    {t.elapsedTime}
                                  </div>
                                  <div className="text-sm font-black font-mono tracking-tight">
                                    {(run.totalTime / 1000).toFixed(2)}
                                    <span className="text-[10px] ml-0.5 opacity-30">
                                      S
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-black/20 p-2 rounded-xl relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                                  <div className="text-[8px] uppercase text-gray-500 mb-1">
                                    {t.distance}
                                  </div>
                                  <div className="text-sm font-black font-mono tracking-tight">
                                    {formatDistance(run.totalDistance)}
                                  </div>
                                </div>
                                <div className="bg-black/20 p-2 rounded-xl border border-gray-800/30">
                                  <div className="text-[8px] uppercase text-gray-500 mb-1">
                                    Peak G
                                  </div>
                                  <div className="text-sm font-black font-mono text-violet-400">
                                    {run.peakG ? run.peakG.toFixed(2) : "--.--"}
                                    <span className="text-[10px] ml-0.5 opacity-30">
                                      G
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-black/20 p-2 rounded-xl border border-gray-800/30">
                                  <div className="text-[8px] uppercase text-gray-500 mb-1">
                                    GPS RATE
                                  </div>
                                  <div className="text-sm font-black font-mono text-blue-400">
                                    {run.avgHz ? run.avgHz.toFixed(1) : "0.0"}
                                    <span className="text-[10px] ml-0.5 opacity-30">
                                      Hz
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedHistoryId === run.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-t border-gray-800 pt-4 mt-2">
                                      <p className="text-[9px] uppercase font-black text-gray-500 mb-3 tracking-[0.2em] text-center">
                                        {t.splitsTargets.toUpperCase()}
                                      </p>
                                      <div className="bg-gray-950/40 rounded-2xl overflow-hidden border border-gray-800/50">
                                        {run.splits && run.splits.map((s, i) => (
                                          <div
                                            key={`${run.id}-split-${i}`}
                                            className={`px-4 py-2.5 flex items-center justify-between border-b border-gray-800/30 last:border-0 ${s.time ? "bg-violet-500/[0.03]" : "opacity-40"}`}
                                          >
                                            <div className="flex flex-col">
                                              <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-tighter">
                                                {s.label}
                                              </span>
                                              <span className="text-[8px] font-mono text-gray-600 uppercase">
                                                {s.type === "speed" ? `${s.targetSpeed} KPH` : formatDistance(s.distance || 0)}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-6">
                                              <div className="text-right min-w-[60px]">
                                                <div
                                                  className={`text-sm font-black italic tabular-nums ${s.time ? "text-white" : "text-gray-800"}`}
                                                >
                                                  {s.time
                                                    ? s.time.toFixed(2)
                                                    : "--.--"}
                                                  <span className="text-[8px] ml-0.5 not-italic opacity-40 uppercase">
                                                    s
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="text-right min-w-[50px]">
                                                <div
                                                  className={`text-[11px] font-black font-mono italic ${s.speedAtSplit ? "text-blue-400" : "text-gray-800"}`}
                                                >
                                                  {s.speedAtSplit
                                                    ? Math.round(s.speedAtSplit)
                                                    : "---"}
                                                  <span className="text-[7px] ml-0.5 not-italic opacity-40 uppercase">
                                                    kph
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

      {view === "charts" && (
        <motion.div
          key="charts-view"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col gap-6"
        >
                  <LiveTelemetryChart 
                    realTimeSpeedData={realTimeSpeedData}
                    currentSpeed={currentSpeed}
                    gForce={gForce}
                    peakG={peakG}
                    t={t}
                    lowFX={systemConfig.lowFX}
                  />

                  {/* COMPARE RECORDS MANAGER */}
                  <div className={`bg-gray-900/60 rounded-3xl border border-violet-500/20 p-1 ${blurClass} overflow-hidden shadow-xl shadow-violet-500/5`}>
                    <div className="bg-violet-600/20 text-violet-400 px-4 py-2 flex items-center justify-between mb-1 rounded-t-2xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-violet-500" />{" "}
                        Records Manager
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-violet-500/60 uppercase">
                          Cloud Sync Active
                        </span>
                      </div>
                    </div>

                    <RecordsTable 
                      history={history}
                      selectedRuns={selectedRuns}
                      setSelectedRuns={setSelectedRuns}
                      lowFX={systemConfig.lowFX}
                    />

                    <div className="px-4 py-2 flex justify-between items-center text-[7px] font-black text-violet-500/40 uppercase tracking-[0.2em]">
                      <span>{history.length} OBJECTS REGISTERED</span>
                      <span>Compare Graph Viewer v1.0.4 PRO</span>
                    </div>
                  </div>

                  <CompareChart 
                    history={history}
                    selectedRuns={selectedRuns}
                    lowFX={systemConfig.lowFX}
                  />
                </motion.div>
              )}

              {view === "settings" && (
                <motion.div
                  key="settings-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col gap-6 will-change-[opacity,transform]"
                >
                  <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> {t.localPilot}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 block mb-2">{t.displayName}</label>
                        <input
                          type="text"
                          value={localPilotName}
                          onChange={(e) => setLocalPilotName(e.target.value)}
                          placeholder="Local Racer"
                          className="w-full bg-gray-950/80 border border-gray-800 rounded-xl p-4 text-xs font-bold text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-gray-700"
                        />
                        <p className="text-[8px] text-gray-600 font-bold uppercase mt-2 ml-1">{t.identifyLocal}</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-4 h-4 text-violet-400" />
                          <span className="text-xs font-bold text-white uppercase italic">{t.soundEnabled}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSoundEnabled(!soundEnabled);
                            playSound("click");
                          }}
                          className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${soundEnabled ? "bg-violet-600" : "bg-gray-800"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${soundEnabled ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <SmartphoneNfc className="w-4 h-4 text-violet-400" />
                          <span className="text-xs font-bold text-white uppercase italic">VIBRATION</span>
                        </div>
                        <button
                          onClick={() => {
                            setSystemConfig({ ...systemConfig, vibrationEnabled: !systemConfig.vibrationEnabled });
                            playSound("click");
                          }}
                          className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${systemConfig.vibrationEnabled ? "bg-violet-600" : "bg-gray-800"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${systemConfig.vibrationEnabled ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center gap-2">
                      <Gauge className="w-4 h-4" /> {t.language}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(["id", "en", "th", "vi", "ms"] as Language[]).map(
                        (l) => (
                          <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${lang === l ? "bg-violet-500 border-violet-400 text-white shadow-lg" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"}`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {l === "id"
                                ? "Indonesia"
                                : l === "en"
                                  ? "English"
                                  : l === "th"
                                    ? "Thailand"
                                    : l === "vi"
                                      ? "Vietnam"
                                      : "Malaysia"}
                            </span>
                            {lang === l && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </section>

                  <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> {t.config}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                          {t.templates}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedTargets(DEFAULT_TARGETS)}
                            className="px-3 py-1.5 rounded-lg bg-gray-800 text-[10px] font-bold hover:bg-violet-500 transition-colors uppercase"
                          >
                            {t.reset}
                          </button>
                          <button
                            onClick={() => setSelectedTargets(DRAG_PRESETS)}
                            className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 text-[10px] font-bold hover:bg-violet-500 hover:text-white transition-colors uppercase"
                          >
                            Drag Mode
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-4 mt-4">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 block">
                          {t.myTargets}
                        </label>
                        <div className="space-y-2">
                          {selectedTargets.map((target, idx) => (
                            <div
                              key={target.label + idx}
                              className="flex items-center gap-2 bg-gray-950/80 p-3 rounded-xl border border-gray-800"
                            >
                              <input
                                type="text"
                                value={target.label}
                                onChange={(e) => {
                                  const newTargets = [...selectedTargets];
                                  newTargets[idx].label = e.target.value;
                                  setSelectedTargets(newTargets);
                                }}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
                              />
                              <input
                                type="number"
                                value={target.type === "speed" ? target.targetSpeed : target.distance}
                                onChange={(e) => {
                                  const newTargets = [...selectedTargets];
                                  const val = parseFloat(e.target.value);
                                  if (target.type === "speed") {
                                    newTargets[idx].targetSpeed = val;
                                  } else {
                                    newTargets[idx].distance = val;
                                  }
                                  setSelectedTargets(newTargets);
                                }}
                                className="bg-transparent border-none focus:ring-0 text-sm font-mono text-violet-400 text-right w-24"
                              />
                              <span className="text-[10px] text-gray-600 font-bold uppercase w-8">
                                {target.type === "speed" ? "KPH" : "M"}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedTargets(
                                    selectedTargets.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-gray-600 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                              onClick={() =>
                                setSelectedTargets([
                                  ...selectedTargets,
                                  { distance: 1000, label: "Dist", type: "distance" },
                                ])
                              }
                              className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-800 rounded-xl text-[10px] font-bold text-gray-500 hover:text-violet-500 hover:border-violet-500/50 transition-all uppercase"
                            >
                              <Plus className="w-3 h-3" /> + Dist
                            </button>
                            <button
                              onClick={() =>
                                setSelectedTargets([
                                  ...selectedTargets,
                                  { targetSpeed: 100, label: "Speed", type: "speed" },
                                ])
                              }
                              className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-800 rounded-xl text-[10px] font-bold text-gray-500 hover:text-violet-500 hover:border-violet-500/50 transition-all uppercase"
                            >
                              <Plus className="w-3 h-3" /> + Speed
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {(isAdminOrOwner) && (
                    <section className="bg-gray-900/60 rounded-3xl border border-violet-500/30 p-6 shadow-xl shadow-violet-500/5">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> {isOwner ? t.ownerPanel : t.adminPanel}
                        </div>
                        {(isAdminOrOwner) && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-black animate-pulse">
                            {isOwner ? "OWNER PRIVILEGES ACTIVE" : "ADMIN PRIVILEGES ACTIVE"}
                          </span>
                        )}
                      </h3>

                      {/* Online Members Section */}
                      {(isAdminOrOwner) && (
                        <section className="bg-gray-900/60 rounded-3xl border border-violet-500/30 p-6 shadow-xl shadow-violet-500/5 mb-8">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-4 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Online Members
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {users.filter(u => u.lastSeen && Date.now() - u.lastSeen < 120000).map(u => (
                              <div key={u.username} className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-gray-200">{u.username}</p>
                              </div>
                            ))}
                            {users.filter(u => u.lastSeen && Date.now() - u.lastSeen < 120000).length === 0 && (
                              <p className="text-[10px] text-gray-600 italic px-3">No members currently online.</p>
                            )}
                          </div>
                        </section>
                      )}

                      {(isAdminOrOwner) && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          <div className="bg-gray-950/50 rounded-2xl p-4 border border-violet-500/10">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Users</p>
                            <p className="text-2xl font-black text-violet-400 leading-none">{systemStats.totalUsers}</p>
                          </div>
                          <div className="bg-gray-950/50 rounded-2xl p-4 border border-violet-500/10">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">System Distance</p>
                            <p className="text-2xl font-black text-violet-400 leading-none">{systemStats.totalDist} <span className="text-[10px]">KM</span></p>
                          </div>
                          <div className="bg-gray-950/50 rounded-2xl p-4 border border-violet-500/10">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Avg Accuracy</p>
                            <p className="text-2xl font-black text-violet-400 leading-none">{systemStats.avgAcc} <span className="text-[10px]">M</span></p>
                          </div>
                          <div className="bg-gray-950/50 rounded-2xl p-4 border border-violet-500/10">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Record Speed</p>
                            <p className="text-2xl font-black text-violet-400 leading-none">{systemStats.peakSpeed} <span className="text-[10px]">KM/H</span></p>
                          </div>
                          <div className="col-span-2 lg:col-span-4 bg-violet-600/5 rounded-2xl p-4 border border-violet-500/20">
                             <p className="text-[10px] text-violet-400 uppercase font-black mb-2 flex items-center gap-2">
                               <Trophy className="w-3 h-3" /> System Record (Fastest Time)
                             </p>
                             <div className="flex items-end justify-between">
                               <div>
                                 {fastestRun ? (
                                   <>
                                     <p className="text-3xl font-black text-white leading-none mb-1">{(fastestRun.totalTime / 1000).toFixed(3)}s</p>
                                     <p className="text-[10px] text-gray-500 font-black uppercase">Race {Math.round(fastestRun.totalDistance)}m by {fastestRun.username}</p>
                                   </>
                                 ) : <p className="text-sm text-gray-600">No logs yet</p>}
                               </div>
                               <div className="text-right">
                                 <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">Verified Historical<br/>Global Benchmarking</p>
                               </div>
                             </div>
                          </div>
                        </div>
                      )}

                      {(isOwner) && (
                        <div className="bg-gray-950/40 rounded-2xl border border-amber-500/20 p-4 mb-8 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">System Command Center</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] text-gray-400 font-black uppercase">System Lock</label>
                              <button 
                                onClick={toggleMaintenance}
                                className={`w-full py-2 rounded-xl border flex items-center justify-center gap-2 transition-all ${maintenanceMode ? 'bg-amber-600 border-amber-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                              >
                                {maintenanceMode ? <Lock className="w-3 h-3" /> : <Settings2 className="w-3 h-3" />}
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  {maintenanceMode ? 'Maintenance ON' : 'Normal Mode'}
                                </span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-gray-400 font-black uppercase">System Branding</label>
                              <input 
                                type="text"
                                defaultValue={systemName}
                                onBlur={(e) => updateSystemName(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-xl p-2 text-[10px] font-bold text-violet-400"
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Performance (For Low-end devices)</label>
                              <button 
                                onClick={() => {
                                  const newVal = !systemConfig.lowFX;
                                  updateSystemConfigProperty("lowFX", newVal);
                                  setAdminMessage(`Low FX: ${newVal ? 'ENABLED' : 'DISABLED'}`);
                                  setTimeout(() => setAdminMessage(""), 3000);
                                }}
                                className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-3 transition-all ${systemConfig.lowFX ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                              >
                                <Cpu className={`w-3.5 h-3.5 ${systemConfig.lowFX ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {systemConfig.lowFX ? 'LOW FX MODE: ON (STABLE)' : 'LOW FX MODE: OFF (HIGH)'}
                                </span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-[9px] text-gray-500 font-black uppercase">System Broadcaster</label>
                             <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 placeholder="Enter system announcement..."
                                 onKeyDown={(e) => {
                                   if (e.key === "Enter") updateBroadcast((e.target as any).value);
                                 }}
                                 className="flex-1 bg-black border border-gray-800 rounded-lg p-2 text-[10px] font-bold"
                               />
                               <button 
                                 onClick={() => {
                                   const input = document.querySelector('input[placeholder="Enter system announcement..."]') as HTMLInputElement;
                                   if (input) input.value = '';
                                   updateBroadcast('');
                                 }}
                                 className="bg-gray-800 p-2 rounded-lg"
                               ><X className="w-3 h-3 text-white" /></button>
                               <button 
                                 onClick={() => {
                                   const input = document.querySelector('input[placeholder="Enter system announcement..."]') as HTMLInputElement;
                                   if (input) updateBroadcast(input.value);
                                 }}
                                 className="bg-violet-600 p-2 rounded-lg"
                               ><Megaphone className="w-3 h-3 text-white" /></button>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                             <button 
                               onClick={exportSystemData}
                               className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                             >
                                <Download className="w-3 h-3" /> Export Data
                             </button>
                             <button 
                               onClick={purgeAllGlobalHistory}
                               className="flex items-center justify-center gap-2 bg-red-600/10 border border-red-500/20 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white"
                             >
                                <Database className="w-3 h-3" /> Purge Logs
                             </button>
                          </div>

                          <div className="border-t border-gray-800 pt-4 space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Advanced Config</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gray-400">Interaction Sound</span>
                                  <button 
                                    onClick={() => {
                                      setSoundEnabled(!soundEnabled);
                                      playSound("click");
                                    }}
                                    className={`w-8 h-4 rounded-full relative transition-all ${soundEnabled ? 'bg-violet-600' : 'bg-gray-800'}`}
                                  >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${soundEnabled ? 'left-4.5' : 'left-0.5'}`} />
                                  </button>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gray-400">Vibration Feedback</span>
                                  <button 
                                    onClick={() => updateSystemConfigProperty("vibrationEnabled", !systemConfig.vibrationEnabled)}
                                    className={`w-8 h-4 rounded-full relative transition-all ${systemConfig.vibrationEnabled ? 'bg-violet-600' : 'bg-gray-800'}`}
                                  >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${systemConfig.vibrationEnabled ? 'left-4.5' : 'left-0.5'}`} />
                                  </button>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gray-400">Min Accuracy (m)</span>
                                  <input 
                                    type="number"
                                    value={systemConfig.minAccuracy}
                                    onChange={(e) => updateSystemConfigProperty("minAccuracy", parseInt(e.target.value))}
                                    className="bg-transparent border-none focus:ring-0 text-[10px] font-mono text-violet-400 text-right w-12"
                                  />
                                </div>
                             </div>
                             <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] font-bold text-gray-400">GPS Watchdog (ms)</label>
                                  <span className="text-[10px] text-violet-400 font-mono">{systemConfig.gpsWatchdogSpeed}ms</span>
                                </div>
                                <input 
                                  type="range"
                                  min="1000"
                                  max="15000"
                                  step="500"
                                  value={systemConfig.gpsWatchdogSpeed}
                                  onChange={(e) => updateSystemConfigProperty("gpsWatchdogSpeed", parseInt(e.target.value))}
                                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                                <div className="flex justify-between mt-1">
                                  <span className="text-[8px] text-gray-600 font-bold">FAST (1s)</span>
                                  <span className="text-[8px] text-gray-600 font-bold">STRICT (15s)</span>
                                </div>
                             </div>
                          </div>

                          <div className="border-t border-gray-800 pt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-4">
                              <Trophy className="w-3 h-3 text-red-500" /> Global Run Moderation
                            </h4>
                            <div className="space-y-1.5 max-h-48 overflow-auto pr-2 custom-scrollbar mb-8">
                              {globalRuns.map((run, i) => (
                                <div key={run.id + i} className="bg-black/40 p-3 rounded-lg border border-gray-900 flex justify-between items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-tighter leading-none">{run.username}</p>
                                      <span className="text-[8px] text-gray-500 font-bold bg-gray-900 rounded px-1 py-0.5">{Math.round(run.totalDistance)}m</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-tight">{(run.totalTime / 1000).toFixed(3)}s | {(run.maxSpeed || 0).toFixed(1)} km/h peak</p>
                                  </div>
                                  <button
                                    onClick={() => deleteGlobalRun(run.username, run.id)}
                                    className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                    title="Delete Run"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {globalRuns.length === 0 && <p className="text-[10px] text-gray-600">No runs found</p>}
                            </div>
                          </div>

                          <div className="border-t border-gray-800 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[9px] text-gray-500 font-black uppercase flex items-center gap-2">
                                <ListRestart className="w-3 h-3" /> Global Audit Logs
                              </label>
                              <div className="flex gap-2">
                                <button 
                                  onClick={exportSystemData}
                                  className="text-[8px] font-black text-violet-400 hover:text-violet-300 uppercase tracking-tighter"
                                >Export Stats</button>
                                <button 
                                  onClick={purgeAuditLogs}
                                  className="text-[8px] font-black text-red-500 hover:text-red-400 uppercase tracking-tighter"
                                >Clear All</button>
                              </div>
                            </div>
                            <div className="space-y-1.5 max-h-32 overflow-auto pr-2 custom-scrollbar">
                              {auditLogs.map((log, i) => (
                                <div key={log.id + i} className="bg-black/40 p-2 rounded-lg border border-gray-900 flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-tighter leading-none mb-1">{log.action}</p>
                                    <p className="text-[8px] text-gray-500 leading-tight">{log.detail}</p>
                                  </div>
                                  <div className="text-right flex flex-col gap-0.5">
                                    <span className="text-[7px] text-gray-600 font-bold uppercase">{log.user}</span>
                                    <span className="text-[7px] text-gray-700">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : '...'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={handleCreateCustomer}
                        className="space-y-4 mb-8"
                      >
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">
                          {t.createAccount}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder={t.username}
                            value={newCustomerForm.username}
                            onChange={(e) =>
                              setNewCustomerForm((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 text-xs font-bold focus:border-violet-500/50"
                          />
                          <input
                            type="text"
                            placeholder={t.password}
                            value={newCustomerForm.password}
                            onChange={(e) =>
                              setNewCustomerForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 text-xs font-bold focus:border-violet-500/50"
                          />
                        </div>

                        <div className="flex gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800">
                          {(isOwner ? ["customer", "admin", "owner"] : isAdminOrOwner ? ["customer", "admin"] : ["customer"]).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() =>
                                setNewCustomerForm((prev) => ({
                                  ...prev,
                                  role: r,
                                }))
                              }
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${newCustomerForm.role === r ? "bg-violet-500 text-white shadow-lg" : "text-gray-600 hover:text-gray-400"}`}
                            >
                              {r === "admin" ? (
                                <Shield className="w-3 h-3" />
                              ) : (
                                <UserIcon className="w-3 h-3" />
                              )}
                              {r === "customer" ? "MEMBER" : r}
                            </button>
                          ))}
                        </div>

                        {adminMessage && (
                          <div
                            className={`text-[9px] font-black uppercase text-center py-2 rounded-lg ${adminMessage === t.userCreated ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                          >
                            {adminMessage}
                          </div>
                        )}
                        <button
                          type="submit"
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all text-[10px] uppercase tracking-widest"
                        >
                          {t.createAccount}
                        </button>
                      </form>

                      {userToEdit && (
                        <div className="mb-8 p-6 bg-violet-600/10 border border-violet-500/30 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4 flex items-center gap-2">
                             <Edit2 className="w-3 h-3" /> Editing {userToEdit.username}
                          </h4>
                          <form onSubmit={handleUpdateUserDetails} className="space-y-3">
                            <input 
                              type="text" 
                              value={editForm.username}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                              placeholder="New Username"
                              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm"
                            />
                            <input 
                              type="password" 
                              value={editForm.password}
                              onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                              placeholder="New Password"
                              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm"
                            />
                            <div className="flex gap-2">
                              <button 
                                type="submit"
                                className="flex-1 bg-violet-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >Save Changes</button>
                              <button 
                                type="button"
                                onClick={() => setUserToEdit(null)}
                                className="px-4 bg-gray-800 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >Cancel</button>
                            </div>
                            {editForm.username !== userToEdit.username && (
                              <p className="text-[9px] text-amber-500 font-bold italic text-center">
                                * Changing username will migrate all race history
                              </p>
                            )}
                          </form>
                        </div>
                      )}

                      <div className="border-t border-gray-800 pt-6">
                        <div className="space-y-4 mb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                              {t.userList}
                            </p>
                            {(isAdminOrOwner) && (
                              <div className="flex gap-2">
                                {isBulkManaging && (
                                  <button 
                                    onClick={handleBulkUserDelete}
                                    disabled={selectedUsers.length === 0}
                                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-red-600/10 border border-red-500/20 shadow-lg ${selectedUsers.length > 0 ? "text-red-500 animate-pulse" : "text-gray-700 opacity-50"}`}
                                  >Delete ({selectedUsers.length})</button>
                                )}
                                <button 
                                  onClick={() => {
                                    setIsBulkManaging(!isBulkManaging);
                                    setSelectedUsers([]);
                                  }}
                                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border transition-all ${isBulkManaging ? "bg-amber-600/20 border-amber-500 text-amber-500" : "bg-violet-600/10 border-violet-500/20 text-violet-400"}`}
                                >
                                  {isBulkManaging ? "Cancel Bulk" : "Bulk Manage"}
                                </button>
                                <button
                                  onClick={handleMasterReset}
                                  className="text-[8px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-2 py-1 rounded-md border border-red-500/20 font-black transition-all"
                                >
                                  MASTER RESET
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                              <input 
                                type="text" 
                                placeholder="Search users..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-[10px] font-bold"
                              />
                            </div>
                            <select 
                              value={roleFilter}
                              onChange={(e) => setRoleFilter(e.target.value as any)}
                              className="bg-black/40 border border-gray-800 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-400 uppercase"
                            >
                               <option value="all">ALL</option>
                               <option value="admin">ADMINS</option>
                               <option value="customer">MEMBERS</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {users
                            .filter(u => {
                              const matchesSearch = (u.username || "").toLowerCase().includes((searchTerm || "").toLowerCase());
                              const matchesRole = roleFilter === "all" || u.role === roleFilter;
                              return matchesSearch && matchesRole;
                            })
                            .map((u) => (
                            <div
                              key={u.username}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isBulkManaging && selectedUsers.includes(u.username) && u.role !== 'owner' ? 'bg-violet-500/10 border-violet-500/50' : 'bg-gray-950/50 border-gray-800/50'}`}
                            >
                              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                {isBulkManaging && u.role !== "owner" && (
                                  <div 
                                    onClick={() => {
                                      setSelectedUsers(prev => 
                                        prev.includes(u.username) 
                                          ? prev.filter(un => un !== u.username)
                                          : [...prev, u.username]
                                      );
                                    }}
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${selectedUsers.includes(u.username) ? "bg-violet-600 border-violet-500" : "bg-black border-gray-800"}`}
                                  >
                                    {selectedUsers.includes(u.username) && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                )}
                                <div className="flex flex-col flex-1 overflow-hidden">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-2 h-2 rounded-full ${u.role === "owner" ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" : u.role === "admin" ? "bg-violet-500 shadow-[0_0_5px_rgba(139,92,246,0.5)]" : "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"}`}
                                    />
                                    <span className="text-xs font-bold leading-none truncate pr-2">
                                      {u.username}
                                    </span>
                                    {u.lastSeen && (Date.now() - u.lastSeen < 120000) ? (
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Online</span>
                                      </div>
                                    ) : u.lastSeen && u.lastSeen > 0 ? (
                                      <span className="text-[8px] font-bold text-gray-600 uppercase">
                                        {formatLastSeen(u.lastSeen)}
                                      </span>
                                    ) : null}
                                  {(isOwner && u.role !== "owner" || isMainOwner) && (
                                     <div className="flex gap-1 ml-auto">
                                        {u.role === "customer" ? (
                                          <button 
                                            onClick={() => handleUpdateRole(u.username, "admin")}
                                            className="p-1 rounded-md bg-violet-600/10 text-violet-500 hover:bg-violet-600 hover:text-white transition-all"
                                            title="Promote to Admin"
                                          ><ArrowUpCircle className="w-3 h-3" /></button>
                                        ) : u.role === "admin" ? (
                                          <>
                                            <button 
                                              onClick={() => handleUpdateRole(u.username, "customer")}
                                              className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all mr-1"
                                              title="Demote to Member"
                                            ><ArrowDownCircle className="w-3 h-3" /></button>
                                            <button 
                                              onClick={() => handleUpdateRole(u.username, "owner")}
                                              className="p-1 rounded-md bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white transition-all"
                                              title="Promote to Owner"
                                            ><ShieldAlert className="w-3 h-3" /></button>
                                          </>
                                        ) : null}
                                     </div>
                                  )}
                                </div>
                                {u.role === "customer" && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span
                                      className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${u.boundDeviceId ? "bg-violet-500/10 text-violet-400" : "bg-gray-800 text-gray-500"}`}
                                    >
                                      {u.boundDeviceId
                                        ? `${t.deviceBound}: ${u.boundDeviceId}`
                                        : t.notBound}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {(isAdminOrOwner || (u.username !== currentUser?.username && u.role === "customer")) && (
                                  <div className="flex gap-1 items-center">
                                    {(isAdminOrOwner) && (u.role !== "owner" || isMainOwner) && (
                                      <button
                                        onClick={() => toggleUserBan(u)}
                                        title={u.isBanned ? "Unban User" : "Ban User"}
                                        className={`p-1.5 rounded-lg border transition-all active:scale-95 ${u.isBanned ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-red-500'}`}
                                      >
                                        <ShieldAlert className="w-3 h-3" />
                                      </button>
                                    )}
                                    {(isAdminOrOwner) && (u.role !== "owner" || isMainOwner) && (
                                      <button
                                        onClick={() => {
                                          setUserToEdit(u);
                                          setEditForm(u);
                                        }}
                                        title="Edit User Credentials"
                                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-all border border-blue-500/20 active:scale-95"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    )}
                                    {(isAdminOrOwner) && u.boundDeviceId && (u.role !== "owner" || isMainOwner) && (
                                      <button
                                        onClick={() => handleResetDevice(u.username)}
                                        title="Force Unbind Device"
                                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-all border border-amber-500/20 active:scale-95"
                                      >
                                        <Smartphone className="w-3 h-3" />
                                      </button>
                                    )}
                                    {(isAdminOrOwner) && (u.role !== "owner" || isMainOwner) && (
                                      <button
                                        onClick={async () => {
                                          requireConfirm("Wipe History", `Wipe all history for ${u.username}?`, async () => {
                                            try {
                                              setAdminMessage(`Cleaning ${u.username}...`);
                                              // Use collectionGroup search to find runs belonging to this user regardless of path casing
                                              const q = query(collectionGroup(db, "runs"), where("username", "==", u.username));
                                              const snap = await getDocs(q);
                                              const batch = writeBatch(db);
                                              snap.docs.forEach(docSnap => batch.delete(docSnap.ref));
                                              await batch.commit();
                                              setAdminMessage(`History wiped for ${u.username}`);
                                              setTimeout(() => setAdminMessage(""), 3000);
                                            } catch (err) {
                                              console.error(err);
                                              setAdminMessage("Error wiping history");
                                              setTimeout(() => setAdminMessage(""), 3000);
                                            }
                                          });
                                        }}
                                        title="Wipe History"
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95"
                                      >
                                        <Database className="w-3 h-3" />
                                      </button>
                                    )}
                                    {!["owner27"].includes((u.username || "").toLowerCase()) && u.username !== currentUser?.username && (isMainOwner || u.role !== "owner") && (
                                      <button
                                        onClick={() => handleDeleteUser(u.username)}
                                        title="Delete User"
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                                <span
                                  className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${u.role === "owner" ? "bg-amber-500/20 text-amber-400" : u.role === "admin" ? "bg-violet-500/20 text-violet-400" : "bg-blue-500/20 text-blue-400"}`}
                                >
                                  {u.role === "customer"
                                    ? "MEMBER DRAG RACE"
                                    : u.role === "owner" ? "OWNER" : u.role}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-violet-500 shrink-0" />
                    <p className="text-[10px] text-violet-200/70 leading-relaxed font-medium uppercase tracking-wider">
                      Always ensure clear sky view for best results
                    </p>
                  </div>

                  <div className="bg-gray-950/80 rounded-3xl p-6 border border-gray-800 border-t-red-500/30">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Privacy & Local Data
                    </h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => {
                          playSound("click");
                          requireConfirm("Wipe Data", "This will wipe your 'Remember Me' status and local racer name. Continue?", () => {
                            playSound("error");
                            localStorage.removeItem("race_logged_in");
                            localStorage.removeItem("race_current_user");
                            localStorage.removeItem("race_local_pilot");
                            window.location.reload();
                          });
                        }}
                        className="w-full flex items-center justify-between p-4 bg-red-600/5 border border-red-500/20 rounded-2xl group hover:bg-red-600 transition-all text-left"
                      >
                        <div>
                          <span className="text-xs font-black text-red-500 group-hover:text-white uppercase italic">Wipe Device Memory</span>
                          <p className="text-[8px] text-gray-700 group-hover:text-red-100 font-bold uppercase mt-1">Clears local pilot name and login session</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-500 group-hover:text-white" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl text-sm font-black uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-500/5 mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    {t.signOut}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode={systemConfig.lowFX ? "wait" : "popLayout"}>
              {confirmState?.isOpen && (
                <motion.div
                  initial={systemConfig.lowFX ? { opacity: 0 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: systemConfig.lowFX ? 0.1 : 0.3 }}
                  className={`fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 ${systemConfig.lowFX ? '' : 'backdrop-blur-md'}`}
                >
                  <motion.div
                    initial={systemConfig.lowFX ? { opacity: 0, y: 10 } : { scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={systemConfig.lowFX ? { opacity: 0, y: 10 } : { scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: systemConfig.lowFX ? 0.1 : 0.3 }}
                    className={`bg-gray-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl shadow-red-500/10 text-center relative overflow-hidden`}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black italic text-white mb-4 tracking-tighter uppercase">
                      {confirmState.title}
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium italic">
                      {confirmState.message}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmState(null)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest italic"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmState.onConfirm()}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all text-xs uppercase tracking-widest italic"
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete User Confirmation Modal */}
            <AnimatePresence>
              {userToDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-gray-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl shadow-red-500/10 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>

                    <h2 className="text-xl font-black italic text-white mb-4 tracking-tighter uppercase">
                      {TRANSLATIONS[lang].deleteUser}
                    </h2>

                    <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium italic">
                      "{userToDelete}"
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setUserToDelete(null)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest italic"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDeleteUser}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all text-xs uppercase tracking-widest italic"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isTouchLocked && (
                <TouchLockOverlay 
                  t={t} 
                  onUnlock={() => {
                    setIsTouchLocked(false);
                    triggerVibrate([10, 50, 10]);
                  }} 
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isSaving && (
                <SavingOverlay t={t} isActive={isActive} />
              )}
            </AnimatePresence>

            {/* Footer info */}
            <footer className="mt-8 text-center pb-8 opacity-30">
              <p className="text-[8px] font-mono tracking-[0.3em] uppercase">
                Built for Performance • L.A Tech Division
              </p>
            </footer>

            {/* Safety Notice Overlay */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-gray-950 border border-white/5 rounded-[3rem] p-10 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent" />
                    
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />

                    <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                      <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-black italic text-white mb-4 tracking-tighter uppercase leading-tight">
                      {t.safetyNotice}
                    </h2>

                    <div className="relative mb-10">
                       <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-widest italic text-center px-2">
                         {t.disclaimer}
                       </p>
                    </div>

                    <button
                      onClick={() => setShowWelcome(false)}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-violet-950 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] italic"
                    >
                      {t.iAgree}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1" />
                    </button>
                    
                    <p className="mt-6 text-[8px] text-gray-700 font-black uppercase tracking-[0.3em]">
                       {t.elitePerformance}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}

        {/* Fixed Controls for Dashboard */}
        <AnimatePresence>
          {view === "dashboard" && (
            <motion.div 
              key="fixed-dashboard-controls"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-8 left-4 right-4 z-50 max-w-lg mx-auto"
            >
              <div className={`bg-black/60 ${blurXlClass} p-4 rounded-[2rem] border border-white/5 shadow-2xl`}>
                {!isLive ? (
                  <div className="flex flex-col gap-3">
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.3em] text-center px-4 py-2.5 rounded-xl transition-all border ${isGpsLocked ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-orange-500/10 border-orange-500/30 text-orange-500 animate-pulse"}`}
                    >
                      {isGpsLocked ? t.signalReady : t.waitingSignal}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStart}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-950/40 transition-all flex items-center justify-center gap-3 text-xl italic tracking-tight group"
                    >
                      <Play className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
                      {t.startTest}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {!isActive && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleForceLaunch}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base italic tracking-tight border border-gray-800"
                      >
                        <Zap className="w-5 h-5 fill-current animate-pulse" />
                        {t.forceLaunch}
                      </motion.button>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStop}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-950/40 transition-all flex items-center justify-center gap-3 text-xl italic tracking-tight"
                    >
                      <CircleStop className="w-7 h-7" />
                      {t.stopSave}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

const TouchLockOverlay = ({ t, onUnlock }: { t: Translations, onUnlock: () => void }) => {
  const [unlockProgress, setUnlockProgress] = useState(0);
  const pressTimer = useRef<number | null>(null);

  const handleStart = () => {
    setUnlockProgress(0);
    pressTimer.current = window.setInterval(() => {
      let shouldUnlock = false;
      setUnlockProgress((prev) => {
        if (prev >= 100) {
          shouldUnlock = true;
          return 100;
        }
        return prev + 3;
      });

      if (shouldUnlock) {
        if (pressTimer.current) {
          clearInterval(pressTimer.current);
          pressTimer.current = null;
        }
        onUnlock();
      }
    }, 30);
  };

  const handleEnd = () => {
    if (pressTimer.current) {
      clearInterval(pressTimer.current);
      pressTimer.current = null;
    }
    setUnlockProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 select-none touch-none"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-32 h-32 bg-violet-500/10 rounded-full flex items-center justify-center mb-8 border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
      >
        <Lock className="w-12 h-12 text-violet-500" />
      </motion.div>

      <div className="text-center space-y-2 relative z-10">
        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">
          {t.lockMode || "TOUCH LOCK ACTIVE"}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-[200px]">
          {t.lockDescription || "Long press unlock button to regain control"}
        </p>
      </div>

      <div className="mt-auto w-full max-w-xs relative z-10">
        <motion.button
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className="relative w-full py-6 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden active:scale-95 transition-transform"
        >
          {/* Progress Bar Background */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-violet-600 transition-all duration-75"
            style={{ width: `${unlockProgress}%` }}
          />
          
          <span className="relative z-10 text-[11px] font-black italic tracking-widest uppercase text-white drop-shadow-md">
            {unlockProgress >= 100 ? "RELEASE" : "HOLD TO UNLOCK"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const SavingOverlay = ({ t, isActive }: { t: Translations, isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderColor: ["#8b5cf6", "#d946ef", "#8b5cf6"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl border-2 border-violet-500 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)]"
        >
          {isActive ? (
            <RefreshCw className="w-10 h-10 text-violet-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          )}
        </motion.div>
        
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 rounded-full blur-xl"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">
          {isActive ? t.saving : t.saved}
        </h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] max-w-[240px] leading-loose">
          {isActive 
            ? "Syncing telemetry with cloud storage. Do not close the app." 
            : "Race data secured and mirrored to historical records."}
        </p>
      </div>
      
      {!isActive && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          className="mt-8 h-1 bg-green-500 absolute bottom-0 left-0"
          transition={{ duration: 2 }}
        />
      )}
    </motion.div>
  );
};

// --- Memoized Components for Performance ---

interface DashboardViewProps {
  t: Translations;
  currentSpeed: number;
  accuracy: number | null;
  gpsHz: number;
  gpsVersion: number;
  calibrateGPS: () => void;
  maxSpeed: number;
  elapsedTime: number;
  distanceCovered: number;
  splits: Split[];
  isActive: boolean;
  isLive: boolean;
  isTouchLocked: boolean;
  setIsTouchLocked: (locked: boolean) => void;
  gForce: number;
  peakG: number;
  gpsAltitude: number | null;
  gpsHeading: number | null;
  isGpsLocked: boolean;
  formatTime: (ms: number) => string;
  formatDistance: (m: number) => string;
  navigateView: (newView: "welcome" | "dashboard" | "history" | "settings" | "charts") => void;
  systemConfig: any;
  fastestRun: any;
  systemStats: any;
  isAdminOrOwner: boolean;
}

const getBlurClasses = (lowFX: boolean) => ({
  blurClass: lowFX ? "" : "backdrop-blur-md",
  blurXlClass: lowFX ? "" : "backdrop-blur-xl",
  blurSmClass: lowFX ? "" : "backdrop-blur-sm",
  blurLgClass: lowFX ? "" : "backdrop-blur-lg",
});

// --- Optimized Small Components ---

const LiveValue = React.memo(({ 
  value, 
  unit, 
  label, 
  color = "text-white",
  size = "text-4xl",
  icon: Icon,
  lowFX = false
}: { 
  value: string | number, 
  unit?: string, 
  label: string, 
  color?: string,
  size?: string,
  icon?: any,
  lowFX?: boolean
}) => {
  const { blurSmClass } = getBlurClasses(lowFX);
  return (
    <div className={`bg-gray-900/40 rounded-3xl p-5 border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-violet-500/30 transition-colors ${blurSmClass}`}>
      <div className="absolute top-3 left-3 opacity-20 group-hover:opacity-40 transition-opacity">
        {Icon && <Icon className="w-3 h-3" />}
      </div>
      <div className="text-[10px] font-mono text-gray-500 mb-1 tracking-widest uppercase">
        {label}
      </div>
      <div className={`font-black italic tracking-tighter tabular-nums ${size} ${color} flex items-baseline gap-1`}>
        {value}
        {unit && <span className="text-xs not-italic opacity-30 font-bold uppercase">{unit}</span>}
      </div>
    </div>
  );
});

const BentoCard = ({ children, className = "", title, icon: Icon, lowFX = false }: { children: React.ReactNode, className?: string, title?: string, icon?: any, lowFX?: boolean }) => {
  const { blurClass } = getBlurClasses(lowFX);
  return (
    <div className={`bg-gray-900/40 rounded-[2rem] border border-gray-800/50 p-6 relative overflow-hidden group ${blurClass} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-3.5 h-3.5 text-violet-500/70" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

const LiveTelemetryChart = React.memo(({ 
  realTimeSpeedData, 
  currentSpeed, 
  gForce, 
  peakG, 
  t,
  lowFX = false
}: { 
  realTimeSpeedData: any[], 
  currentSpeed: number, 
  gForce: number, 
  peakG: number, 
  t: Translations,
  lowFX?: boolean
}) => {
  const { blurXlClass } = getBlurClasses(lowFX);
  return (
    <div className={`bg-gray-900/80 rounded-[2.5rem] border border-violet-500/20 p-6 ${blurXlClass} shadow-2xl relative overflow-hidden group`}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(139,92,246,1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,1)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${currentSpeed > 2 ? "bg-red-500 animate-pulse shadow-[0_0_10px_red]" : "bg-gray-600"}`}
          />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 italic">
            Live Telemetry Monitor
          </h3>
        </div>
        <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
          <span className="text-[8px] font-bold text-violet-500 uppercase flex items-center gap-1">
            <Signal className="w-2 h-2" /> GPS-L1 LOCKED
          </span>
        </div>
      </div>

      <div className="h-48 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={realTimeSpeedData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="colorSpeedLive"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="#8b5cf6"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff05"
              vertical={true}
            />
            <XAxis dataKey="time" hide />
            <YAxis
              stroke="#ffffff10"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              domain={[
                0,
                (dataMax: number) =>
                  Math.max(
                    100,
                    Math.ceil(dataMax / 20) * 20 + 20,
                  ),
              ]}
              tick={{
                fill: "#444",
                fontSize: 8,
                fontWeight: "bold",
              }}
            />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpeedLive)"
              isAnimationActive={false}
              connectNulls={true}
            />
            {(() => {
              const realPoints = realTimeSpeedData.filter(
                (p) =>
                  p.speed !== undefined &&
                  !p.time.startsWith("future") &&
                  !p.time.startsWith("init"),
              );
              const lastPoint = realPoints[realPoints.length - 1];
              if (!lastPoint) return null;
              return (
                <ReferenceDot
                  x={lastPoint.time}
                  y={lastPoint.speed}
                  r={4}
                  fill="#8b5cf6"
                  stroke="#fff"
                  strokeWidth={1}
                  isFront={true}
                />
              );
            })()}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
          <p className="text-[7px] text-gray-500 font-black uppercase mb-1">
            Velocity
          </p>
          <p className="text-xl font-black text-white italic">
            {Math.round(currentSpeed)}{" "}
            <span className="text-[8px] opacity-40">KPH</span>
          </p>
        </div>
        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
          <p className="text-[7px] text-gray-500 font-black uppercase mb-1">
            G-Force
          </p>
          <p className="text-xl font-black text-violet-400 italic">
            {gForce.toFixed(2)}{" "}
            <span className="text-[8px] opacity-40">G</span>
          </p>
        </div>
        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
          <p className="text-[7px] text-gray-500 font-black uppercase mb-1">
            Peak-G
          </p>
          <p className="text-xl font-black text-blue-400 italic">
            {peakG.toFixed(2)}{" "}
            <span className="text-[8px] opacity-40">MAX</span>
          </p>
        </div>
      </div>
    </div>
  );
});

const CompareChart = React.memo(({ 
  history, 
  selectedRuns,
  lowFX = false
}: { 
  history: any[], 
  selectedRuns: string[],
  lowFX?: boolean
}) => {
  const activeRuns = useMemo(() => history.filter((r) => selectedRuns.includes(r.id)), [history, selectedRuns]);
  const { blurClass } = getBlurClasses(lowFX);
  
  const chartData = useMemo(() => {
    let timeMap: Record<number, any> = {};
    
    activeRuns.forEach((run, idx) => {
      const runData = (run.telemetry && run.telemetry.length > 5) ? run.telemetry : Array.from({ length: 20 }, (_, i) => {
        const t = (i / 19) * (run.totalTime / 1000);
        const progress = i / 19;
        const speed = run.maxSpeed * (1 - Math.pow(1 - progress, 2));
        return { time: t, speed };
      });
      
      runData.forEach((pt: any) => {
        // Group by 100ms buckets to align the disparate telemetry points
        const roundedTime = Math.round(pt.time * 10) / 10;
        if (!timeMap[roundedTime]) {
          timeMap[roundedTime] = { time: roundedTime };
        }
        timeMap[roundedTime][`run${idx}_speed`] = pt.speed;
      });
    });
    
    // Sort ascending by time
    const sortedData = Object.values(timeMap).sort((a: any, b: any) => a.time - b.time);
    return sortedData;
  }, [activeRuns]);

  if (activeRuns.length === 0) return null;

  const runColors = [
    { speed: "#ef4444" }, // Red
    { speed: "#06b6d4" }, // Cyan
    { speed: "#a855f7" }, // Purple
    { speed: "#10b981" }, // Emerald
    { speed: "#f59e0b" }, // Amber
  ];

  return (
    <div className="bg-[#050505] rounded-[2.5rem] border border-white/5 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl mt-4">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="flex flex-col w-full z-20 mb-2 items-center">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-1 italic">Compare Graphs</h3>
      </div>

      <div className="flex flex-wrap gap-4 w-full z-10 justify-center">
        {activeRuns.map((run, idx) => {
          const colors = runColors[idx % runColors.length];
          return (
            <div key={run.id} className={`flex items-center gap-4 bg-white/5 ${blurClass} px-4 py-2 rounded-xl border border-white/5`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Run {idx + 1}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-[2px]" style={{ backgroundColor: colors.speed }} />
                <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: colors.speed }}>Speed ({run.maxSpeed.toFixed(0)} MAX)</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-[350px] w-full bg-black/40 border border-white/5 shadow-inner rounded-[1.5rem] p-4 lg:p-6 pb-2 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="time" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              stroke="#555" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: "#333" }} 
              tick={{ fill: "#666", fontWeight: "bold" }}
              tickFormatter={(v) => v.toFixed(1)}
              label={{
                value: "TIME (SECONDS)",
                position: "insideBottom",
                offset: -10,
                fill: "#555",
                fontSize: 10,
                fontWeight: "black",
                letterSpacing: 2
              }}
            />
            <YAxis 
              stroke="#555" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: "#333" }} 
              tick={{ fill: "#666", fontWeight: "bold" }}
              tickFormatter={(v) => Math.round(v).toString()}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "10px", fontWeight: "bold" }}
              itemStyle={{ fontSize: "12px", fontWeight: "900" }}
              formatter={(value: any, name: string) => {
                const parts = name.split('_');
                return [`${Number(value).toFixed(1)} KM/H`, `RUN ${parseInt(parts[0].replace('run', '')) + 1}`];
              }}
              labelFormatter={(label) => `${Number(label).toFixed(2)}s`}
            />
            {activeRuns.map((run, idx) => (
              <Line 
                key={run.id}
                type="monotone" 
                dataKey={`run${idx}_speed`} 
                stroke={runColors[idx % runColors.length].speed}
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: runColors[idx % runColors.length].speed, stroke: "#111", strokeWidth: 2 }}
                connectNulls={true}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const RecordsTable = React.memo(({ 
  history, 
  selectedRuns, 
  setSelectedRuns,
  lowFX = false
}: { 
  history: any[], 
  selectedRuns: string[], 
  setSelectedRuns: React.Dispatch<React.SetStateAction<string[]>>,
  lowFX?: boolean
}) => {
  const { blurSmClass } = getBlurClasses(lowFX);
  return (
    <div className={`bg-gray-950/40 border border-violet-500/10 overflow-hidden mx-1 mb-1 rounded-xl ${blurSmClass}`}>
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-violet-950/30 border-b border-violet-500/10">
            <th className="px-3 py-3 w-10"></th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest">Date & Time</th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest">ID Run</th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">Max KPH</th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">Max G</th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">Dist (m)</th>
            <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">Time (s)</th>
          </tr>
        </thead>
        <tbody className="text-[9px] font-mono">
          {history.length === 0 ? (
            <tr className="text-gray-600 italic">
              <td colSpan={7} className="px-4 py-12 text-center bg-transparent uppercase tracking-[0.4em] opacity-30 text-[8px]">
                No records found
              </td>
            </tr>
          ) : (
            history.map((run, i) => (
              <tr
                key={`${run.id}-${i}`}
                className={`border-b border-violet-500/5 transition-all uppercase cursor-pointer relative group ${selectedRuns.includes(run.id) ? "bg-violet-600/15" : "hover:bg-violet-500/5"}`}
                onClick={() => {
                  setSelectedRuns((prev) => prev.includes(run.id) ? prev.filter((id) => id !== run.id) : [...prev, run.id]);
                }}
              >
                <td className="px-3 py-3 text-center">
                  {selectedRuns.includes(run.id) ? (
                    <div className="flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-violet-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Square className="w-4 h-4 text-gray-700 group-hover:text-gray-600" />
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 font-bold text-gray-300">
                  {new Date(run.date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-3 text-gray-500 font-medium">RUN_{(run.id || "0000").slice(-4)}</td>
                <td className="px-3 py-3 font-black text-red-500/80 text-center text-xs italic">{Math.round(run.maxSpeed)}</td>
                <td className="px-3 py-3 font-black text-blue-500/80 text-center text-xs italic">{run.peakG?.toFixed(2) || "0.00"}</td>
                <td className="px-3 py-3 text-center text-gray-400">{Math.round(run.totalDistance)}</td>
                <td className="px-3 py-3 font-black text-center text-violet-400 text-xs italic">{(run.totalTime / 1000).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
});

const formatLastSeen = (lastSeen: number) => {
  const diff = Date.now() - lastSeen;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const WeatherCard = React.memo(({ t }: { t: Translations }) => {
  const [condition, setCondition] = useState<"sunny" | "cloudy" | "rainy">("sunny");
  
  const info = useMemo(() => {
    switch (condition) {
      case "sunny": return { desc: t.sunnyDescription, sugg: t.sunnySuggestion, icon: Sun, color: "text-amber-500", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/50" };
      case "cloudy": return { desc: t.cloudyDescription, sugg: t.cloudySuggestion, icon: Cloud, color: "text-gray-400", bgClass: "bg-gray-500/10", borderClass: "border-gray-500/50" };
      case "rainy": return { desc: t.rainyDescription, sugg: t.rainySuggestion, icon: CloudRain, color: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/50" };
    }
  }, [condition, t]);
  
  const Icon = info.icon;
  return (
    <section className="bg-gray-950/60 rounded-3xl border border-violet-500/30 p-6 shadow-xl shadow-violet-500/5">
       <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4" /> {t.weather}
        </div>
       </h3>
       
       <div className="grid grid-cols-3 gap-2 mb-4">
         {(["sunny", "cloudy", "rainy"] as const).map(c => (
           <button 
             key={c}
             onClick={() => setCondition(c)} 
             className={`p-3 rounded-xl flex items-center justify-center transition-all ${condition === c ? 'bg-violet-600/30 border border-violet-500/50' : 'bg-white/5 border border-transparent'}`}
           >
             {c === "sunny" ? <Sun size={20} className="text-amber-500"/> : c === "cloudy" ? <Cloud size={20} className="text-gray-400"/> : <CloudRain size={20} className="text-blue-400"/>}
           </button>
         ))}
       </div>
       
       <div className={`p-4 rounded-xl ${info.bgClass} border-l-4 ${info.borderClass}`}>
         <div className="text-white font-bold text-sm">{info.desc}</div>
         <div className="text-gray-400 text-xs mt-1">{info.sugg}</div>
       </div>
    </section>
  );
});

const DashboardView = React.memo(({ 
  t, currentSpeed, accuracy, gpsHz, gpsVersion, calibrateGPS, 
  maxSpeed, elapsedTime, distanceCovered, splits, isActive, isLive,
  isTouchLocked, setIsTouchLocked,
  gForce, peakG, gpsAltitude, gpsHeading, isGpsLocked, 
  formatTime, formatDistance, navigateView, systemConfig,
  fastestRun, systemStats, isAdminOrOwner
}: DashboardViewProps) => {
  const { lowFX } = systemConfig;
  const { blurClass } = getBlurClasses(lowFX);
  return (
    <>
      <motion.div
      key="dashboard"
      initial={lowFX ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={lowFX ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: lowFX ? 0.05 : 0.1 }}
      className="flex-1 flex flex-col gap-4 pb-8 landscape:pb-4"
    >
      {/* Hero Section: Speed & Main Metrics */}
      <div className="grid grid-cols-1 landscape:grid-cols-3 gap-4 w-full">
        <div className={`bg-gray-900/40 rounded-[2.5rem] p-6 landscape:p-8 border border-violet-500/20 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl shadow-violet-950/20 col-span-1 landscape:col-span-2 ${blurClass}`}>
          {!lowFX && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)]" />}
          
          <div className="absolute top-6 right-6 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsTouchLocked(!isTouchLocked)}
                className={`p-3 rounded-2xl border transition-all shadow-lg ${blurClass} ${isTouchLocked ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-gray-800 text-violet-500 hover:bg-violet-600 hover:text-white'}`}
              >
                {isTouchLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </motion.button>
          </div>

          <div className="text-xs font-mono text-violet-500 mb-2 tracking-[0.3em] uppercase font-black">
            {t.currentSpeed}
          </div>
          
          <div className="relative transform-gpu will-change-transform flex items-center justify-center">
            <motion.div 
              key={`speed-${Math.round(currentSpeed)}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[10rem] font-black italic tracking-tighter tabular-nums leading-none drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              {Math.round(currentSpeed)}
            </motion.div>
            <div className="absolute -right-8 bottom-6 text-xl font-black text-gray-600 italic tracking-tighter">
              KPH
            </div>
          </div>

          {/* Quick Stats in Hero */}
          <div className="mt-8 grid grid-cols-2 gap-12 w-full max-w-xs border-t border-white/5 pt-8">
            <div className="text-center">
              <div className="text-[9px] uppercase font-black text-gray-500 mb-1 tracking-widest">
                {t.maxSpeed}
              </div>
              <div className="text-3xl font-black font-mono text-violet-400 italic leading-none">
                {Math.round(maxSpeed)}
              </div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-[9px] uppercase font-black text-gray-500 mb-1 tracking-widest">
                {t.accuracy}
              </div>
              <div className={`text-3xl font-black font-mono italic leading-none ${accuracy !== null && accuracy < 10 ? "text-green-500" : "text-yellow-500"}`}>
                {accuracy ? `±${Math.round(accuracy)}` : "--"}
                <span className="text-[10px] ml-0.5 opacity-50 uppercase">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Splits Panel */}
        <div className="bg-gray-950 rounded-[2.5rem] border border-gray-800/80 overflow-hidden shadow-2xl relative flex flex-col col-span-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.05),transparent_50%)]" />
          
          <div className="flex items-center justify-center p-7 border-b border-white/5 bg-gray-900/20 relative z-10 shrink-0 min-h-[76px]">
            <div className="absolute inset-0 flex flex-row items-center justify-center gap-3 pointer-events-none">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white italic text-center">
                {t.splitsTargets}
              </h2>
            </div>
            {isActive && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-7 flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">
                  {t.recording}
                </span>
              </motion.div>
            )}
          </div>

          <div className="divide-y divide-white/[0.03] relative z-10 overflow-y-auto max-h-[300px] landscape:max-h-[350px] lg:max-h-[460px] custom-scrollbar">
            {splits.map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                className={`px-8 py-4 flex flex-col gap-3 transition-all ${s.time ? "bg-violet-500/[0.02]" : "hover:bg-white/[0.01]"}`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-200 italic uppercase">
                    {s.label}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                    {s.type === "speed" ? `${s.targetSpeed} KPH TARGET` : `${formatDistance(s.distance || 0)} TARGET`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div
                      className={`text-2xl font-black italic tabular-nums leading-none tracking-tighter ${s.time ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-gray-800"}`}
                    >
                      {s.time ? s.time.toFixed(2) : "--.--"}
                      <span className="text-xs ml-1 not-italic uppercase opacity-20 font-bold">
                        s
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-black font-mono tracking-tighter italic ${s.speedAtSplit ? "text-blue-400" : "text-gray-800"}`}
                    >
                      {s.speedAtSplit
                        ? Math.round(s.speedAtSplit)
                        : "---"}
                      <span className="text-[10px] ml-1 not-italic opacity-30 font-bold uppercase">
                        kph
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 landscape:grid-cols-4 gap-4">
        <BentoCard icon={Timer} title={t.elapsedTime} lowFX={lowFX}>
          <div className="text-5xl font-black font-mono italic tracking-tighter text-blue-400 leading-none mb-1">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">SECONDS</div>
        </BentoCard>

        <BentoCard icon={MapPin} title={t.distance} lowFX={lowFX}>
          <div className="text-5xl font-black font-mono italic tracking-tighter text-green-400 leading-none mb-1">
            {formatDistance(distanceCovered).replace(/[a-z]/g, '')}
          </div>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            {formatDistance(distanceCovered).includes('km') ? 'KILOMETERS' : 'METERS'}
          </div>
        </BentoCard>

        <BentoCard icon={Activity} title={t.gForce} className="col-span-2" lowFX={lowFX}>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black font-mono italic text-violet-500 leading-none">
              {gForce.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 font-black italic">G</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Peak G</div>
            <div className="text-2xl font-black text-violet-400 font-mono italic leading-none">{peakG.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-black/40 rounded-full p-0.5 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]"
            animate={{ width: `${Math.min(Math.abs(gForce) * 50, 100)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </BentoCard>

      {/* Cloud Insights Card */}
      {isAdminOrOwner && (
        <BentoCard icon={Cloud} title="System Cloud Analytics" className="col-span-2" lowFX={lowFX}>
          <div className="grid grid-cols-2 gap-6">
            <div className="border-r border-white/5 pr-4">
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Peak System Speed</div>
              <div className="text-3xl font-black text-red-500 italic font-mono leading-none">
                {systemStats.peakSpeed} <span className="text-[10px] opacity-50">KPH</span>
              </div>
            </div>
            <div className="pl-2">
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Global Data Points</div>
              <div className="text-3xl font-black text-blue-500 italic font-mono leading-none">
                {systemStats.totalDist} <span className="text-[10px] opacity-50">K</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 p-2 bg-violet-600/5 rounded-xl border border-violet-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <div className="text-[9px] font-bold text-violet-400/80 uppercase">Maximizing Cloud Sync: {systemStats.totalUsers} Active Nodes Detected</div>
          </div>
        </BentoCard>
      )}
    </div>


      <WeatherCard t={t} />

      {/* GPS Status & Calibration Bar */}
      <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800 flex items-center justify-between px-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${accuracy !== null && accuracy < 10 ? "bg-green-500" : accuracy !== null && accuracy <= 30 ? "bg-yellow-500" : "bg-red-500"} animate-pulse shadow-lg`} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t.gpsAccuracyLabel}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="text-[10px] font-black font-mono text-gray-500 italic">
            {gpsHz > 0 ? gpsHz.toFixed(1) : "0.0"} <span className="opacity-50">HZ RATE</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={calibrateGPS}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-wider hover:bg-violet-600 hover:text-white transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
          {t.calibrate}
        </motion.button>
      </div>

      <div className="h-40" /> {/* Spacer for fixed controls */}
    </motion.div>
    </>
  );
});
