/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Settings2,
  ListRestart,
  ShieldCheck,
  Volume2,
  SmartphoneNfc,
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
}

const TRANSLATIONS: Record<Language, Translations> = {
  id: {
    welcome: "SELAMAT DATANG",
    elitePerformance: "Meter Performa PRO+",
    precisionGPS:
      "lihat dan catat performa kendaraan mu dengan aplikasi DRAG RACE L.A PRO+",
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
      "Gunakan DRAG RACE pada saat cerah tidak tertutup awan. Rekomendasi pada saat malam hari agar sinyal GPS lebih stabil.",
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
  },
  en: {
    welcome: "WELCOME",
    elitePerformance: "PRO+ Performance Meter",
    precisionGPS:
      "view and record your vehicle performance with DRAG RACE L.A PRO+ app",
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
      "Use DRAG RACE when it is clear and not cloudy, recommended at night",
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
  },
  th: {
    welcome: "ยินดีต้อนรับ",
    elitePerformance: "PRO+ Performance Meter",
    precisionGPS: "ดูและบันทึกสมรรถนะรถของคุณด้วยแอป DRAG RACE L.A PRO+",
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
      "ใช้ DRAG RACE เมื่ออากาศแจ่มใสและไม่มีเมฆมาก แนะนำให้ใช้ในตอนกลางคืน",
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
  },
  vi: {
    welcome: "CHÀO MỪNG",
    elitePerformance: "Máy Đo Hiệu Suất PRO+",
    precisionGPS:
      "xem và ghi lại hiệu suất xe của bạn với ứng dụng DRAG RACE L.A PRO+",
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
      "Sử dụng DRAG RACE khi trời quang đãng và không có mây, khuyên dùng vào ban đêm",
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
  },
  ms: {
    welcome: "SELAMAT DATANG",
    elitePerformance: "Meter Prestasi PRO+",
    precisionGPS:
      "lihat dan rakam prestasi kenderaan anda dengan aplikasi DRAG RACE L.A PRO+",
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
      "Gunakan DRAG RACE semasa cuaca cerah tidak dilindung awan, disyorkan pada waktu malam",
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
  },
};

interface User {
  username: string;
  password: string;
  role: "owner" | "admin" | "customer";
  boundDeviceId?: string;
  isBanned?: boolean;
}

interface Split {
  distance: number; // meters
  label: string;
  time?: number; // seconds
  speedAtSplit?: number; // km/h
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
  { distance: 18.288, label: "60ft" },
  { distance: 100, label: "100m" },
  { distance: 201.168, label: "201m" },
  { distance: 203, label: "203m" },
  { distance: 402.336, label: "402m" },
];

const SPEED_THRESHOLD = 0.5; // m/s to start/stop timer (detect movement)

// --- Utils ---

const calculateDistance = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
) => {
  const R = 6371e3; // meters
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
      window.history.pushState({ view: newView }, "");
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
  const [showWarning, setShowWarning] = useState(true);
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
    // Pre-initialize with 60 slots to ensure a continuous line from the start
    return Array.from({ length: 100 }, (_, i) => ({
      time: `t-${i}`,
      speed: 0,
    }));
  });
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
  const [users, setUsers] = useState<User[]>(() => {
    const defaultAdmin: User = { username: "Atmin", password: "AtminDragRace27", role: "owner" };
    const saved = localStorage.getItem("race_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User[];
        // Ensure the requested admin is always in the list
        if (!parsed.some(u => u.username.toLowerCase() === "atmin")) {
          return [defaultAdmin, ...parsed];
        }
        return parsed;
      } catch {
        return [defaultAdmin];
      }
    }
    return [defaultAdmin];
  });
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
    if (!window.confirm(`Delete ${selectedUsers.length} selected users? This cannot be undone.`)) return;
    
    try {
      setAdminMessage("Executing bulk delete...");
      const batch = writeBatch(db);
      selectedUsers.forEach(username => {
        batch.delete(doc(db, "users", username.toLowerCase()));
      });
      await batch.commit();
      setSelectedUsers([]);
      setIsBulkManaging(false);
      setAdminMessage("Bulk delete successful");
    } catch (err) {
      setAdminMessage("Delete failed");
    }
    setTimeout(() => setAdminMessage(""), 3000);
  };
  const [loginError, setLoginError] = useState("");
  const [newCustomerForm, setNewCustomerForm] = useState<{
    username: string;
    password: string;
    role: "admin" | "customer";
  }>({ username: "", password: "", role: "customer" });
  const [adminMessage, setAdminMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "customer">("all");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemName, setSystemName] = useState("DRAG RACE");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("race_sound_enabled") !== "false");
  const [localPilotName, setLocalPilotName] = useState(() => localStorage.getItem("race_local_pilot") || "Local Usage");

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
    systemName: "DRAG RACE",
    broadcastMessage: "",
    vibrationEnabled: true,
    minAccuracy: 20,
    gpsWatchdogSpeed: 5000,
    strictGpsMode: false
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
        if (data.broadcastMessage) setBroadcastMessage(data.broadcastMessage);
      }
    });
    return () => unsub();
  }, []);

  // --- Real-time User Role/Data Sync ---
  useEffect(() => {
    if (isLoggedIn && currentUser?.username) {
      const userRef = doc(db, "users", currentUser.username.toLowerCase());
      const unsub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const updatedUser = doc.data() as User;
          setCurrentUser(updatedUser);
          if (localStorage.getItem("race_logged_in") === "true") {
            localStorage.setItem("race_current_user", JSON.stringify(updatedUser));
          }
        }
      }, (error) => {
        console.error("User sync error:", error);
      });
      return () => unsub();
    }
  }, [isLoggedIn, currentUser?.username]);

  // --- Performance Optimized Calculations ---
  const systemStats = useMemo(() => {
    if (globalRuns.length === 0) return { totalDist: 0, avgAcc: 0, peakSpeed: 0, totalUsers: users.length };
    const totalDist = globalRuns.reduce((acc, r) => acc + (r.totalDistance || 0), 0);
    const avgAcc = globalRuns.reduce((acc, r) => acc + (r.accuracy || 0), 0) / globalRuns.length;
    const peakSpeed = Math.max(...globalRuns.map(r => r.maxSpeed || 0));
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

  const handleUpdateRole = async (username: string, newRole: "admin" | "customer") => {
    try {
      await setDoc(doc(db, "users", username), { role: newRole }, { merge: true });
      setAdminMessage(`User promoted to ${newRole}`);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setAdminMessage("Error updating role");
    }
  };

  const toggleUserBan = async (user: User) => {
    try {
      const newStatus = !user.isBanned;
      await setDoc(doc(db, "users", user.username.toLowerCase()), { isBanned: newStatus }, { merge: true });
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

  const purgeAllGlobalHistory = async () => {
    if (!window.confirm("CRITICAL: THIS WILL DELETE EVERY SINGLE RACE LOG IN THE ENTIRE SYSTEM. Continue?")) return;
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
  };

  const purgeAuditLogs = async () => {
    if (!window.confirm("Clear all system audit logs?")) return;
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
  };

  // --- Screen Wake Lock Handler ---
  useEffect(() => {
    // Seed Admin and Test Firebase Connection
    const bootstrapFirebase = async () => {
      try {
        console.log("Starting Firebase bootstrap...");
        
        // Ensure default atmin exists in Firestore (lowercase)
        // We use getDoc which will use cache if offline, better UX
        const adminRef = doc(db, "users", "atmin");
        const adminSnap = await getDoc(adminRef);
        
        if (!adminSnap.exists()) {
          console.log("Seeding default admin...");
          await setDoc(adminRef, {
            username: "Atmin",
            password: "AtminDragRace27",
            role: "owner"
          }, { merge: true });
        } else {
          console.log("Admin record found.");
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
          wakeLockRef.current.addEventListener('release', () => {
             // Handle release
          });
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            console.warn('Wake Lock disallowed by permissions policy or user preference.');
          } else {
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
    
    if (!audioCache.current[type]) {
      audioCache.current[type] = new Audio(SOUNDS[type]);
    }
    
    const audio = audioCache.current[type];
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Browsers often block autoplay or rapid triggers; ignore failures
    });
  };

  // --- Firebase User List Sync (for Admin/Owner) ---
  useEffect(() => {
    if (isLoggedIn && (currentUser?.role === "admin" || currentUser?.role === "owner")) {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach((doc) => {
          firestoreUsers.push(doc.data() as User);
        });
        setUsers(firestoreUsers);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn, currentUser?.role]);

  // --- Firebase History Sync ---
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const usernameKey = currentUser.username.toLowerCase();
      const q = query(collection(db, "users", usernameKey, "runs"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreHistory: RaceRun[] = [];
        snapshot.forEach((doc) => {
          firestoreHistory.push(doc.data() as RaceRun);
        });
        // Sort by date descending
        firestoreHistory.sort((a, b) => b.date - a.date);
        
        setHistory(firestoreHistory);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser?.username?.toLowerCase()}/runs`);
      });
      return () => unsubscribe();
    } else if (!isLoggedIn) {
       // Show local history when logged out, or empty it?
       // Let's load the local one
       const saved = localStorage.getItem("race_history");
       try {
         setHistory(saved ? JSON.parse(saved) : []);
       } catch {
         setHistory([]);
       }
    }
  }, [isLoggedIn, currentUser?.username]);

  // --- Global History Sync (Owner/Admin) ---
  useEffect(() => {
    if (isLoggedIn && (currentUser?.role === "admin" || currentUser?.role === "owner")) {
      const q = query(collectionGroup(db, "runs"), orderBy("date", "desc"), limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fires = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setGlobalRuns(fires);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn, currentUser?.role]);

  // Initial Boot session recovery
  useEffect(() => {
    const localRecovered = localStorage.getItem("race_logged_in") === "true";
    const localUser = localStorage.getItem("race_current_user");
    const sessionRecovered = sessionStorage.getItem("race_logged_in") === "true";
    const sessionUser = sessionStorage.getItem("race_current_user");

    if (localRecovered && localUser) {
      setCurrentUser(JSON.parse(localUser));
      setIsLoggedIn(true);
    } else if (sessionRecovered && sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (splits.some((s, idx) => s.time && !splitsRef.current[idx]?.time)) {
      triggerVibrate(50); // Short buzz on split achievement
    }
  }, [splits]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = TRANSLATIONS[lang];
    
    // Normalize username for case-insensitivity in check but use original for fetch?
    // Actually common practice is to keep it consistent.
    const inputUsername = loginForm.username.trim().toLowerCase();

    try {
      setLoginError(""); // Clear old errors
      const userDoc = await getDoc(doc(db, "users", inputUsername));
      
      if (!userDoc.exists()) {
        const localUser = users.find(u => u.username.toLowerCase() === inputUsername && u.password === loginForm.password);
        if (localUser) {
           try {
             await setDoc(doc(db, "users", localUser.username), localUser);
             await proceedWithLogin(localUser);
           } catch (migrateErr: any) {
             console.error("Migration error:", migrateErr);
             // If migration fails but local exists, we should still allow login but warn or proceed
             await proceedWithLogin(localUser);
           }
        } else {
          setLoginError(t.invalidCredentials);
        }
        return;
      }

      const user = userDoc.data() as User;
      if (user.password !== loginForm.password) {
        playSound("error");
        setLoginError(t.invalidCredentials);
        return;
      }

      await proceedWithLogin(user);
    } catch (err: any) {
      playSound("error");
      console.error("Login error details:", err);
      if (err.message?.includes("offline")) {
        setLoginError("Offline / Connection Error");
      } else if (err.message?.includes("permission")) {
        setLoginError("Database Permission Error");
      } else {
        setLoginError("Error: " + (err.message || "Unknown"));
      }
    }
  };

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
          const batch = writeBatch(db);
          const usernameKey = user.username.toLowerCase();
          localHistory.forEach((run) => {
            const runRef = doc(db, "users", usernameKey, "runs", run.id);
            batch.set(runRef, run);
          });
          await batch.commit();
          localStorage.removeItem("race_history");
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
        await setDoc(doc(db, "users", user.username), boundUser);
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

  const saveAuthToStorage = (user: User) => {
    if (loginForm.rememberMe) {
      localStorage.setItem("race_logged_in", "true");
      localStorage.setItem("race_current_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("race_logged_in", "true");
      sessionStorage.setItem("race_current_user", JSON.stringify(user));
    }
  };

  const handleLogout = async () => {
    playSound("click");
    
    // Clear device binding in Firestore so the account can be used on another device
    if (currentUser?.username) {
      try {
        const userRef = doc(db, "users", currentUser.username.toLowerCase());
        await setDoc(userRef, { boundDeviceId: deleteField() }, { merge: true });
      } catch (err) {
        console.error("Error clearing device binding on logout:", err);
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
    if (!newCustomerForm.username) return setAdminMessage(t.nameRequired);
    if (!newCustomerForm.password || newCustomerForm.password.length < 4)
      return setAdminMessage(t.passRequired);

    const targetUsername = newCustomerForm.username.trim().toLowerCase();

    try {
      const userDoc = await getDoc(doc(db, "users", targetUsername));
      if (userDoc.exists()) {
        return setAdminMessage("Username already exists");
      }

      // Security check: Only owner can create admin accounts
      if (newCustomerForm.role === "admin" && currentUser?.role !== "owner") {
        return setAdminMessage("Only owner can create admin accounts");
      }

      const userData = { ...newCustomerForm, username: targetUsername };
      await setDoc(doc(db, "users", targetUsername), userData);
      setUsers((prev) => [...prev, userData]);
      setNewCustomerForm({ username: "", password: "", role: "customer" });
      setAdminMessage(t.userCreated);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err) {
      console.error("Create user error:", err);
      setAdminMessage("Error creating user");
    }
  };

  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<User>({ username: "", password: "", role: "customer" });

  const handleRenameUser = async (oldUsername: string, newData: User) => {
    try {
      setAdminMessage(`Renaming ${oldUsername}...`);
      const oldLower = oldUsername.toLowerCase();
      const newLower = newData.username.toLowerCase();

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
        localStorage.setItem("race_user", JSON.stringify(newData));
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

    if (editForm.username !== userToEdit.username) {
      await handleRenameUser(userToEdit.username, editForm);
    } else {
      try {
        const userToSave = { ...editForm };
        if (userToSave.boundDeviceId === undefined) delete userToSave.boundDeviceId;
        await setDoc(doc(db, "users", editForm.username.toLowerCase()), userToSave, { merge: true });
        setUsers(prev => prev.map(u => u.username === userToEdit.username ? editForm : u));
        if (currentUser?.username === userToEdit.username) {
          setCurrentUser(editForm);
          localStorage.setItem("race_user", JSON.stringify(editForm));
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
    const lowerName = username.toLowerCase();
    
    // Security check: Only owner can delete admins or other owners
    const targetUser = users.find(u => u.username.toLowerCase() === lowerName);
    
    if (targetUser?.role === "owner" && lowerName === "atmin") return; // Primary safety
    if (lowerName === currentUser?.username.toLowerCase()) return; // Protect self
    
    if (targetUser && (targetUser.role === "admin" || targetUser.role === "owner") && currentUser?.role !== "owner") {
      setAdminMessage("Only owner can delete admins");
      setTimeout(() => setAdminMessage(""), 3000);
      return;
    }

    setUserToDelete(username);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        // Delete runs subcollection first
        const runsRef = collection(db, "users", userToDelete, "runs");
        const runsSnapshot = await getDocs(runsRef);
        const batch = writeBatch(db);
        runsSnapshot.forEach((runDoc) => {
          batch.delete(runDoc.ref);
        });
        
        // Delete the user document
        batch.delete(doc(db, "users", userToDelete));
        
        await batch.commit();
        setUserToDelete(null);
        setAdminMessage("User deleted successfully");
      } catch (err) {
        console.error("Delete user error:", err);
        setAdminMessage("Error deleting user");
      }
      setTimeout(() => setAdminMessage(""), 3000);
    }
  };

  const handleMasterReset = async () => {
    if (!window.confirm("CRITICAL: All users and history will be DELETED. The new Admin account will be created. Continue?")) return;
    
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
  };

  const handleResetDevice = async (username: string) => {
    try {
      const userRef = doc(db, "users", username);
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

  // Accelerometer handling for G-Force
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.acceleration;
      if (accel && accel.x !== null && accel.y !== null && accel.z !== null) {
        // Calculate G-Force (absolute linear acceleration)
        const totalAccel = Math.sqrt(
          accel.x ** 2 + accel.y ** 2 + accel.z ** 2,
        );
        const gs = totalAccel / 9.80665;
        // Smoothing and Peak tracking
        setGForce((prev) => prev * 0.7 + gs * 0.3);
        setPeakG((prev) => {
          const next = gs > prev ? gs : prev;
          peakGRef.current = next;
          return next;
        });
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

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
            setGpsVersion(v => v + 1);
          }
        }
      }, 3000);
    };

    if (isLive) startWatchdog();
    
    // GPS Boost: Extra polling to force high-power state on some mobile devices
    let boostInterval: number | null = null;
    if (isLive) {
      boostInterval = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true, maximumAge: 0 });
      }, 5000);
    }

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

        // Calculate Hz with higher precision
        if (lastGpsTimestampRef.current) {
          const diff = position.timestamp - lastGpsTimestampRef.current;
          if (diff > 0) {
            const hz = 1000 / diff;
            setGpsHz(hz);
            if (isActiveRef.current) {
              sessionHzValuesRef.current.push(hz);
            }
          }
        }
        lastGpsTimestampRef.current = position.timestamp;

        // 2. Determine if Signal is "Locked" (Accuracy < 10m is standard, < 5m is pro)
        const locked = accuracy !== null && accuracy <= 10;
        setIsGpsLocked(locked);

        // --- SPEED UI UPDATES (Always update even if accuracy is poor) ---
        // Filter out speed below 0.4 m/s (~1.4 km/h) to prevent GPS drift while stationary
        const filteredSpeed = speed !== null && speed > 0.4 ? speed : 0;
        const rawSpeedKmr = filteredSpeed * 3.6;
        setCurrentSpeed((prev) => rawSpeedKmr * 0.8 + (prev || 0) * 0.2);
        const speedKmr = rawSpeedKmr;
        const now = Date.now();

        if (now - lastTelemetryUpdateRef.current > 120) {
          setRealTimeSpeedData((prev) => {
            const newPoint = {
              time: `t-${now}`,
              speed: Math.round(speedKmr),
            };
            return [...prev.slice(1), newPoint];
          });
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
          startPointRef.current = currentPoint;
          lastPointRef.current = currentPoint;
          pointsRef.current = [currentPoint];
          setElapsedTime(0);
          elapsedTimeRef.current = 0;
          setDistanceCovered(0);

          const freshSplits = selectedTargetsRef.current.map((t) => ({
            ...t,
            time: undefined,
            speedAtSplit: undefined,
          }));
          setSplits(freshSplits);
          splitsRef.current = freshSplits;

          const startTime = Date.now();
          if (timerRef.current) cancelAnimationFrame(timerRef.current);
          
          let lastUpdate = 0;
          const tick = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            elapsedTimeRef.current = elapsed;
            
            // Sync UI at approx 30fps to keep CPU usage low on mobile
            if (now - lastUpdate > 33) {
              setElapsedTime(elapsed);
              lastUpdate = now;
            }
            
            if (isLiveRef.current) {
              timerRef.current = requestAnimationFrame(tick);
            }
          };
          timerRef.current = requestAnimationFrame(tick);
        }

        if (isActiveRef.current && lastPointRef.current) {
          // 5. Distance Calculation filtering
          // Logic: Skip distance if accuracy is poor OR if speed is too low (prevents drifting while parked)
          if (accuracy > 20 || speedKmr < 1.0) {
            lastPointRef.current = currentPoint;
            return;
          }

          const dist = calculateDistance(lastPointRef.current, currentPoint);
          const totalDist = distanceCoveredRef.current + dist;
          
          distanceCoveredRef.current = totalDist;
          setDistanceCovered(totalDist);

          // Check and update splits
          let splitReached = false;
          const nextSplits = splitsRef.current.map((s) => {
            if (!s.time && totalDist >= s.distance) {
              splitReached = true;
              return {
                ...s,
                time: elapsedTimeRef.current / 1000,
                speedAtSplit: speedKmr,
              };
            }
            return s;
          });

          if (splitReached) {
            splitsRef.current = nextSplits;
            setSplits(nextSplits);
          }

          // Check for auto-stop condition
          const maxTargetDist =
            selectedTargetsRef.current.length > 0
              ? Math.max(
                  ...selectedTargetsRef.current.map((t) => t.distance),
                )
              : 0;

          if (maxTargetDist > 0 && totalDist >= maxTargetDist) {
            handleStop(totalDist, elapsedTimeRef.current, nextSplits);
          }

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
      navigator.geolocation.clearWatch(watchId);
      if (watchdog) window.clearInterval(watchdog);
      if (boostInterval) window.clearInterval(boostInterval);
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

      const newRun: RaceRun = {
        id: Date.now().toString(),
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

      if (isLoggedIn && currentUser) {
        const usernameKey = currentUser.username.toLowerCase();
        setDoc(doc(db, "users", usernameKey, "runs", newRun.id), newRun)
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${usernameKey}/runs/${newRun.id}`));
      } else {
        setHistory((prev) => [newRun, ...prev]);
      }
    }

    setIsActive(false);
    isActiveRef.current = false;
    setIsLive(false);
    isLiveRef.current = false;
    playSound("click");
  };

  const deleteHistory = async (id: string) => {
    playSound("click");
    if (isLoggedIn && currentUser) {
      const usernameKey = currentUser.username.toLowerCase();
      try {
        await deleteDoc(doc(db, "users", usernameKey, "runs", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${usernameKey}/runs/${id}`);
      }
    } else {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const clearHistory = async () => {
    playSound("click");
    if (window.confirm(t.deleteConfirm)) {
      playSound("error");
      if (isLoggedIn && currentUser) {
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
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden">
      <AnimatePresence>
        {broadcastMessage && currentUser?.role !== "owner" && (
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
                  onAnimationComplete={() => setBroadcastMessage("")}
                />
              </div>
              <div className="bg-violet-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-black text-white text-center uppercase mb-2">Notice</h3>
              <p className="text-gray-300 text-center text-sm leading-relaxed mb-8">{broadcastMessage}</p>
              <button 
                onClick={() => setBroadcastMessage("")}
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
        {maintenanceMode && currentUser?.role !== "owner" && (
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
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-violet-600/40 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-600/40 blur-[80px] rounded-full" />
      </div>

      <AnimatePresence>
        {!isLoggedIn ? (
          <motion.main
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="w-full bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

              <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mb-4 border border-violet-500/20">
                  <Flag className="w-10 h-10 text-violet-500 -rotate-12 fill-violet-500/20" />
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                  DRAG <span className="text-violet-500">RACE</span>
                </h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-[0.3em] mt-2 uppercase">
                  Elite Performance Tracker
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t.username}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder={t.username}
                      className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder={t.password}
                      className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-gray-700"
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black py-3 rounded-xl text-center uppercase tracking-wider"
                  >
                    {loginError}
                  </motion.div>
                )}

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
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        loginForm.rememberMe
                          ? "bg-violet-600 border-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                          : "bg-gray-950 border-gray-800 group-hover:border-gray-700"
                      }`}
                    >
                      {loginForm.rememberMe && (
                        <CheckSquare className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {t.rememberMe}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-800 flex items-start gap-3">
                   <ShieldCheck className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                   <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                     Privacy focused authentication. credentials are stored only on this device and are never saved in the online database for session persistence.
                   </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-600/20 transition-all text-xs uppercase tracking-[0.2em] italic flex items-center justify-center gap-2 mt-4"
                >
                  {t.signIn}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-medium italic">
                  Powered by L.A Tech PRO Series
                </p>
              </div>
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
              {broadcastMessage && (
                <div className="flex-1 mx-4 overflow-hidden bg-violet-600/10 border border-violet-500/20 rounded h-4 flex items-center">
                  <motion.div
                    animate={{ x: [200, -400] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
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

            <AnimatePresence initial={false}>
              {view === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center justify-center text-center px-4"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                  >
                    <div className="relative inline-block mb-10">
                      <div className="relative z-10 bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <Flag className="w-16 h-16 text-violet-500 mx-auto drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] fill-violet-500/10" />
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="absolute inset-0 bg-violet-600/30 blur-[60px] -z-10"
                      />
                      <div className="absolute bottom-1 -right-4 bg-violet-500 text-black px-3 py-1 rounded-lg text-[10px] font-black italic tracking-widest shadow-2xl z-20 border border-white/20">
                        PRO+
                      </div>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                      <h1 className="text-7xl font-black italic tracking-tighter text-white leading-none">
                        DRAG
                      </h1>
                      <h1 className="text-7xl font-black italic tracking-tighter text-violet-500 leading-none -mt-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                        RACE
                      </h1>
                    </div>

                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                      <span className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-[0.3em]">
                        L.A Division
                      </span>
                      <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-mono font-black text-violet-400 uppercase tracking-[0.3em] italic">
                        Precision Gear
                      </span>
                    </div>

                    <p className="text-gray-500 text-[10px] max-w-[240px] mx-auto leading-relaxed uppercase tracking-[0.2em] font-bold opacity-60 mb-10">
                      {t.precisionGPS}
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateView("dashboard")}
                    className="bg-white text-black font-black py-4 px-12 rounded-2xl text-lg italic tracking-tight shadow-2xl shadow-white/10 flex items-center gap-3 group"
                  >
                    {t.enterTrack}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

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
                  gForce={gForce} 
                  peakG={peakG} 
                  gpsAltitude={gpsAltitude} 
                  gpsHeading={gpsHeading} 
                  isGpsLocked={isGpsLocked} 
                  handleStart={handleStart} 
                  handleStop={handleStop}
                  formatTime={formatTime}
                  formatDistance={formatDistance}
                />
              )}

              {view === "history" && (
                <motion.div
                  key="history"
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
                          <React.Fragment key={run.id}>
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
                                      <p className="text-[9px] uppercase font-black text-gray-500 mb-3 tracking-[0.2em]">
                                        {t.splitsTargets.toUpperCase()}
                                      </p>
                                      <div className="bg-gray-950/40 rounded-2xl overflow-hidden border border-gray-800/50">
                                        {run.splits.map((s, i) => (
                                          <div
                                            key={i}
                                            className={`px-4 py-2.5 flex items-center justify-between border-b border-gray-800/30 last:border-0 ${s.time ? "bg-violet-500/[0.03]" : "opacity-40"}`}
                                          >
                                            <div className="flex flex-col">
                                              <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-tighter">
                                                {s.label}
                                              </span>
                                              <span className="text-[8px] font-mono text-gray-600 uppercase">
                                                {formatDistance(s.distance)}
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
                  key="charts"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col gap-6 will-change-[opacity,transform]"
                >
                  {/* LIVE MONITOR SECTION */}
                  <div className="bg-gray-900/80 rounded-[2.5rem] border border-violet-500/20 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
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

                  {/* DYNO RECORDS MANAGER */}
                  <div className="bg-gray-900/60 rounded-3xl border border-violet-500/20 p-1 backdrop-blur-md overflow-hidden shadow-xl shadow-violet-500/5">
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

                    <div className="bg-gray-950/40 border border-violet-500/10 overflow-hidden mx-1 mb-1 rounded-xl">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-violet-950/30 border-b border-violet-500/10">
                              <th className="px-3 py-3 w-10"></th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest">
                                Date & Time
                              </th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest">
                                ID Run
                              </th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">
                                Max KPH
                              </th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">
                                Max G
                              </th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">
                                Dist (m)
                              </th>
                              <th className="text-[9px] font-black px-3 py-3 text-violet-300 uppercase tracking-widest text-center">
                                Time (s)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-[9px] font-mono">
                            {history.length === 0 ? (
                              <tr className="text-gray-600 italic">
                                <td
                                  colSpan={7}
                                  className="px-4 py-12 text-center bg-transparent uppercase tracking-[0.4em] opacity-30 text-[8px]"
                                >
                                  No records found
                                </td>
                              </tr>
                            ) : (
                              history.map((run) => (
                                <tr
                                  key={run.id}
                                  className={`border-b border-violet-500/5 transition-all uppercase cursor-pointer relative group ${selectedRuns.includes(run.id) ? "bg-violet-600/15" : "hover:bg-violet-500/5"}`}
                                  onClick={() => {
                                    setSelectedRuns((prev) =>
                                      prev.includes(run.id)
                                        ? prev.filter((id) => id !== run.id)
                                        : [...prev, run.id],
                                    );
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
                                    {new Date(run.date).toLocaleString([], {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })}
                                  </td>
                                  <td className="px-3 py-3 text-gray-500 font-medium">
                                    RUN_{run.id.slice(-4)}
                                  </td>
                                  <td className="px-3 py-3 font-black text-red-500/80 text-center text-xs italic">
                                    {Math.round(run.maxSpeed)}
                                  </td>
                                  <td className="px-3 py-3 font-black text-blue-500/80 text-center text-xs italic">
                                    {run.peakG?.toFixed(2) || "0.00"}
                                  </td>
                                  <td className="px-3 py-3 text-center text-gray-400">
                                    {Math.round(run.totalDistance)}
                                  </td>
                                  <td className="px-3 py-3 font-black text-center text-violet-400 text-xs italic">
                                    {(run.totalTime / 1000).toFixed(2)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="px-4 py-2 flex justify-between items-center text-[7px] font-black text-violet-500/40 uppercase tracking-[0.2em]">
                      <span>{history.length} OBJECTS REGISTERED</span>
                      <span>Dyno Graph Viewer v1.0.4 PRO</span>
                    </div>
                  </div>

                  {/* Multi-Run Dyno Graph */}
                  <div className="bg-gray-950 rounded-3xl border border-violet-500/20 p-6 flex flex-col gap-4 relative overflow-hidden shadow-2xl shadow-black/50">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(139,92,246,1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                    <div className="absolute top-2 right-4 flex items-center gap-4 z-20">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-red-500 shadow-[0_0_5px_red]" />
                        <span className="text-[8px] text-red-500 font-bold uppercase tracking-tighter italic">
                          HP - SPEED
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-cyan-400 shadow-[0_0_5px_cyan]" />
                        <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-tighter italic">
                          TORQUE - ACCEL
                        </span>
                      </div>
                    </div>

                    <div className="h-[400px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                          data={(() => {
                            const selectedData = history.filter((r) =>
                              selectedRuns.includes(r.id),
                            );
                            if (selectedData.length === 0) return [];

                            const timePointsMap = new Map<string, any>();
                            
                            selectedData.forEach((run) => {
                              // Better fallback if telemetry is missing
                              const telemetry = (run.telemetry && run.telemetry.length > 5) 
                                ? run.telemetry 
                                : Array.from({ length: 20 }, (_, i) => {
                                    const t = (i / 19) * (run.totalTime / 1000);
                                    // Simulated curve: 0 -> maxSpeed -> slightly down
                                    const progress = i / 19;
                                    const speed = run.maxSpeed * (1 - Math.pow(1 - progress, 2));
                                    const accel = (run.peakG || 0) * (1 - progress);
                                    return { time: t, speed, accel };
                                  });

                              telemetry.forEach((p) => {
                                const tStr = p.time.toFixed(1);
                                if (!timePointsMap.has(tStr)) {
                                  timePointsMap.set(tStr, { time: parseFloat(tStr) });
                                }
                                const point = timePointsMap.get(tStr);
                                point[`speed_${run.id}`] = p.speed;
                                point[`accel_${run.id}`] = p.accel * 10; // More pronounced accel
                              });
                            });

                            return Array.from(timePointsMap.values()).sort(
                              (a, b) => a.time - b.time,
                            );
                          })()}
                        >
                          <defs>
                            {history.filter(r => selectedRuns.includes(r.id)).map((run, idx) => {
                              const colors = ["#ff0000", "#ff6600", "#ff00ff"];
                              const color = colors[idx % colors.length];
                              const cyanColors = ["#22d3ee", "#00ff88", "#88fbff"];
                              const cyanColor = cyanColors[idx % cyanColors.length];
                              // Use a safer ID for gradients (letters first)
                              const runSafeId = run.id.replace(/[^a-zA-Z0-9]/g, '');
                              return (
                                <React.Fragment key={`defs_dyno_${run.id}`}>
                                  <linearGradient id={`grad_speed_${runSafeId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                                  </linearGradient>
                                  <linearGradient id={`grad_accel_${runSafeId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={cyanColor} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={cyanColor} stopOpacity={0}/>
                                  </linearGradient>
                                </React.Fragment>
                              );
                            })}
                            <filter id="neonRed" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                             <filter id="neonCyan" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="1 5"
                            stroke="#ffffff10"
                            vertical={true}
                          />
                          <XAxis
                            dataKey="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            stroke="#444"
                            fontSize={8}
                            tickLine={true}
                            axisLine={true}
                            tick={{ fill: "#666" }}
                            minTickGap={20}
                            label={{
                              value: "ELAPSED TIME (S)",
                              position: "insideBottom",
                              offset: -10,
                              fill: "#444",
                              fontSize: 7,
                              fontWeight: "bold",
                            }}
                          />
                          <YAxis
                            yAxisId="left"
                            stroke="#ff000040"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, (max: number) => Math.max(120, Math.ceil(max / 20) * 20 + 20)]}
                            tick={{
                              fill: "#ff4444",
                              fontSize: 9,
                              fontWeight: "900",
                              fontStyle: "italic",
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#22d3ee40"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 20]}
                            tick={{
                              fill: "#22d3ee",
                              fontSize: 9,
                              fontWeight: "900",
                              fontStyle: "italic",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0,0,0,0.95)",
                              border: "1px solid rgba(139,92,246,0.3)",
                              borderRadius: "12px",
                              padding: "12px",
                              backdropFilter: "blur(10px)",
                            }}
                            labelStyle={{
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: "bold",
                              marginBottom: "8px",
                              fontFamily: "monospace",
                            }}
                            formatter={(val: any, name: string) => {
                              const isAccel = name.includes("accel");
                              const runIdString = name.split("_")[1];
                              const label = `RUN_${runIdString.slice(-4)} (${isAccel ? "G" : "KPH"})`;
                              const displayVal = isAccel ? (val / 10).toFixed(2) : Math.round(val);
                              return [displayVal, label];
                            }}
                          />
                          {history
                            .filter((r) => selectedRuns.includes(r.id))
                            .map((run, idx) => {
                              const colors = ["#ff0000", "#ff6600", "#ff00ff"];
                              const color = colors[idx % colors.length];
                              const runSafeId = run.id.replace(/[^a-zA-Z0-9]/g, '');
                              return (
                                <Area
                                  key={`speed_${run.id}`}
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey={`speed_${run.id}`}
                                  stroke={color}
                                  fill={`url(#grad_speed_${runSafeId})`}
                                  strokeWidth={5}
                                  dot={false}
                                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                                  animationDuration={idx * 200 + 1000}
                                  connectNulls
                                />
                              );
                            })}
                          {history
                            .filter((r) => selectedRuns.includes(r.id))
                            .map((run, idx) => {
                              const colors = ["#22d3ee", "#00ff88", "#88fbff"];
                              const color = colors[idx % colors.length];
                              const runSafeId = run.id.replace(/[^a-zA-Z0-9]/g, '');
                              return (
                                <Area
                                  key={`accel_${run.id}`}
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey={`accel_${run.id}`}
                                  stroke={color}
                                  fill={`url(#grad_accel_${runSafeId})`}
                                  strokeWidth={2}
                                  strokeDasharray="4 2"
                                  dot={false}
                                  activeDot={false}
                                  animationDuration={idx * 200 + 1500}
                                  connectNulls
                                />
                              );
                            })}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>


                    {selectedRuns.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                        <Activity className="w-12 h-12 text-gray-800 mb-4 animate-pulse" />
                        <p className="text-[10px] font-black italic text-gray-500 uppercase tracking-[0.3em]">
                          Select runs from table to compare data
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {view === "settings" && (
                <motion.div
                  key="settings"
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
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-4 mt-4">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 block">
                          {t.myTargets}
                        </label>
                        <div className="space-y-2">
                          {selectedTargets.map((target, idx) => (
                            <div
                              key={idx}
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
                                value={target.distance}
                                onChange={(e) => {
                                  const newTargets = [...selectedTargets];
                                  newTargets[idx].distance = parseFloat(
                                    e.target.value,
                                  );
                                  setSelectedTargets(newTargets);
                                }}
                                className="bg-transparent border-none focus:ring-0 text-sm font-mono text-violet-400 text-right w-24"
                              />
                              <span className="text-[10px] text-gray-600 font-bold">
                                M
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

                          <button
                            onClick={() =>
                              setSelectedTargets([
                                ...selectedTargets,
                                { distance: 1000, label: "Custom" },
                              ])
                            }
                            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-800 rounded-xl text-[10px] font-bold text-gray-500 hover:text-violet-500 hover:border-violet-500/50 transition-all uppercase"
                          >
                            <Plus className="w-3 h-3" /> {t.addTarget}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {(currentUser?.role === "admin" || currentUser?.role === "owner") && (
                    <section className="bg-gray-900/60 rounded-3xl border border-violet-500/30 p-6 shadow-xl shadow-violet-500/5">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> {t.adminPanel}
                        </div>
                        {currentUser?.role === "owner" && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-black animate-pulse">
                            OWNER PRIVILEGES ACTIVE
                          </span>
                        )}
                      </h3>

                      {currentUser?.role === "owner" && (
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
                                     <p className="text-[10px] text-gray-500 font-black uppercase">Race {fastestRun.totalDistance}m by {fastestRun.username}</p>
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

                      {currentUser?.role === "owner" && (
                        <div className="bg-gray-950/40 rounded-2xl border border-amber-500/20 p-4 mb-8 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Owner Command Center</h4>
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
                              {auditLogs.map((log, idx) => (
                                <div key={idx} className="bg-black/40 p-2 rounded-lg border border-gray-900 flex justify-between items-start gap-3">
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
                          {(currentUser?.role === "owner" ? ["customer", "admin"] : ["customer"]).map((r) => (
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
                            {currentUser?.role === "owner" && (
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
                              const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
                              const matchesRole = roleFilter === "all" || u.role === roleFilter;
                              return matchesSearch && matchesRole;
                            })
                            .map((u, i) => (
                            <div
                              key={i}
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
                                  {currentUser?.role === "owner" && u.role !== "owner" && (
                                     <div className="flex gap-1 ml-auto">
                                        {u.role === "customer" ? (
                                          <button 
                                            onClick={() => handleUpdateRole(u.username, "admin")}
                                            className="p-1 rounded-md bg-violet-600/10 text-violet-500 hover:bg-violet-600 hover:text-white transition-all"
                                            title="Promote to Admin"
                                          ><ArrowUpCircle className="w-3 h-3" /></button>
                                        ) : (
                                          <button 
                                            onClick={() => handleUpdateRole(u.username, "customer")}
                                            className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all"
                                            title="Demote to Member"
                                          ><ArrowDownCircle className="w-3 h-3" /></button>
                                        )}
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
                                {(currentUser?.role === "owner" || (u.username !== currentUser?.username && u.role === "customer")) && (
                                  <div className="flex gap-1 items-center">
                                    {currentUser?.role === "owner" && u.role !== "owner" && (
                                      <button
                                        onClick={() => toggleUserBan(u)}
                                        title={u.isBanned ? "Unban User" : "Ban User"}
                                        className={`p-1.5 rounded-lg border transition-all active:scale-95 ${u.isBanned ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-red-500'}`}
                                      >
                                        <ShieldAlert className="w-3 h-3" />
                                      </button>
                                    )}
                                    {currentUser?.role === "owner" && (
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
                                    {currentUser?.role === "owner" && u.boundDeviceId && (
                                      <button
                                        onClick={() => handleResetDevice(u.username)}
                                        title="Force Unbind Device"
                                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-all border border-amber-500/20 active:scale-95"
                                      >
                                        <Smartphone className="w-3 h-3" />
                                      </button>
                                    )}
                                    {currentUser?.role === "owner" && (
                                      <button
                                        onClick={async () => {
                                          if (window.confirm(`Wipe all history for ${u.username}?`)) {
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
                                          }
                                        }}
                                        title="Wipe History"
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95"
                                      >
                                        <Database className="w-3 h-3" />
                                      </button>
                                    )}
                                    {u.username.toLowerCase() !== "atmin" && u.username !== currentUser?.username && (
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
                          if(window.confirm("This will wipe your 'Remember Me' status and local racer name. Continue?")) {
                            playSound("error");
                            localStorage.removeItem("race_logged_in");
                            localStorage.removeItem("race_current_user");
                            localStorage.removeItem("race_local_pilot");
                            window.location.reload();
                          }
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

            {/* Footer info */}
            <footer className="mt-8 text-center pb-8 opacity-30">
              <p className="text-[8px] font-mono tracking-[0.3em] uppercase">
                Built for Performance • L.A Tech Division
              </p>
            </footer>

            {/* Warning Popup */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-gray-900 border border-violet-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl shadow-violet-500/10 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
                      <AlertTriangle className="w-8 h-8 text-violet-500" />
                    </div>

                    <h2 className="text-xl font-black italic text-white mb-4 tracking-tighter uppercase">
                      {t.warningTitle}
                    </h2>

                    <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium italic">
                      "{t.warningMessage}"
                    </p>

                    <button
                      onClick={() => setShowWarning(false)}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest italic"
                    >
                      {t.next}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  gForce: number;
  peakG: number;
  gpsAltitude: number | null;
  gpsHeading: number | null;
  isGpsLocked: boolean;
  handleStart: () => void;
  handleStop: () => void;
  formatTime: (ms: number) => string;
  formatDistance: (m: number) => string;
}

const DashboardView = React.memo(({ 
  t, currentSpeed, accuracy, gpsHz, gpsVersion, calibrateGPS, 
  maxSpeed, elapsedTime, distanceCovered, splits, isActive, isLive,
  gForce, peakG, gpsAltitude, gpsHeading, isGpsLocked, 
  handleStart, handleStop, formatTime, formatDistance 
}: DashboardViewProps) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex-1 flex flex-col gap-6 will-change-[opacity,transform]"
    >
      {/* Primary Speed Display */}
      <div className="bg-gray-900/40 rounded-3xl p-8 border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="text-[10px] font-mono text-violet-500 mb-2 tracking-[0.2em] uppercase">
          {t.currentSpeed}
        </div>
        <div className="relative transform-gpu will-change-transform">
          <div className="text-8xl font-black italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            {Math.round(currentSpeed)}
          </div>
          <div className="absolute -right-10 bottom-4 text-sm font-bold text-gray-500 italic">
            KM/H
          </div>
        </div>

        {/* Accuracy Status Indicator */}
        <div className="flex flex-col items-center gap-1 mt-4 relative">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${accuracy !== null && accuracy < 10 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : accuracy !== null && accuracy <= 30 ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"} shadow-lg`}
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {t.gpsAccuracyLabel}
            </span>
          </div>
          <div className="text-[10px] font-black font-mono text-gray-400 italic flex items-center gap-2">
            <span>
              {gpsHz > 0 ? gpsHz.toFixed(1) : "0.0"} Hz{" "}
              <span className="text-[8px] text-gray-600 uppercase font-bold not-italic ml-0.5">
                Update rate
              </span>
            </span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              animate={{ rotate: gpsVersion * 360 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
              onClick={calibrateGPS}
              className="p-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-colors text-violet-400"
              title={t.calibrate}
            >
              <Crosshair className="w-2.5 h-2.5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-gray-800 pt-6">
          <div className="text-center">
            <div className="text-[10px] uppercase font-mono text-gray-500 mb-1">
              {t.maxSpeed}
            </div>
            <div className="text-2xl font-bold font-mono text-violet-400 italic">
              {Math.round(maxSpeed)}{" "}
              <span className="text-[10px]">KM/H</span>
            </div>
          </div>
          <div className="text-center border-l border-gray-800">
            <div className="text-[10px] uppercase font-mono text-gray-500 mb-1">
              {t.accuracy}
            </div>
            <div
              className={`text-2xl font-bold font-mono italic ${accuracy !== null && accuracy < 10 ? "text-green-500" : "text-yellow-500"}`}
            >
              {accuracy ? `±${Math.round(accuracy)}m` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Timer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              {t.elapsedTime}
            </span>
          </div>
          <div className="text-3xl font-black font-mono italic tracking-tight">
            {formatTime(elapsedTime)}
            <span className="text-xs ml-1 text-gray-600">S</span>
          </div>
        </div>
        <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              {t.distance}
            </span>
          </div>
          <div className="text-3xl font-black font-mono italic tracking-tight">
            {formatDistance(distanceCovered)}
          </div>
        </div>
      </div>

      {/* Splits Table */}
      <div className="bg-gray-950/80 rounded-3xl border border-gray-800 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gray-900/20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> {t.splitsTargets}
          </h2>
          {isActive && (
            <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                {t.recording}
              </span>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="px-4 py-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-black/20 border-b border-gray-800">
          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider">
            {t.distance}
          </span>
          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider text-center">
            TIME
          </span>
          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider text-right">
            KPH
          </span>
        </div>

        <div className="divide-y divide-gray-800/30">
          {splits.map((s, i) => (
            <div
              key={i}
              className={`px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-colors ${s.time ? "bg-violet-500/5" : ""}`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-200">
                  {s.label}
                </span>
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                  {formatDistance(s.distance)}
                </span>
              </div>

              <div className="text-center">
                <div
                  className={`text-xl font-black italic tabular-nums leading-none ${s.time ? "text-white" : "text-gray-800"}`}
                >
                  {s.time ? s.time.toFixed(2) : "--.--"}
                  <span className="text-[10px] ml-0.5 not-italic uppercase opacity-30">
                    s
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-lg font-black font-mono tracking-tighter italic ${s.speedAtSplit ? "text-blue-400" : "text-gray-700"}`}
                >
                  {s.speedAtSplit
                    ? Math.round(s.speedAtSplit)
                    : "---"}
                  <span className="text-[8px] ml-0.5 not-italic opacity-40">
                    kph
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* G-Force & GPS Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-950/80 rounded-3xl p-4 border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 blur-2xl -mr-8 -mt-8" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] font-black text-violet-500 uppercase tracking-[0.2em]">
              {t.gForce}
            </span>
            <Activity className="w-3 h-3 text-violet-500/50" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono italic text-violet-500 leading-none">
              {gForce.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-600 font-bold italic">
              G
            </span>
          </div>
          <div className="mt-3 h-1 bg-gray-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
              animate={{ width: `${Math.min(gForce * 50, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[8px] text-gray-500 font-mono flex justify-between uppercase">
            <span>Peak</span>
            <span className="text-violet-400 font-black">
              {peakG.toFixed(2)}G
            </span>
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-3xl p-4 border border-gray-800 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-500/5 blur-2xl -ml-6 -mb-6" />
          <div className="text-[10px] font-mono text-gray-500 uppercase mb-2 tracking-widest">
            {t.gpsInfo}
          </div>
          <div className="space-y-1.5 font-mono text-[9px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {t.altitude.toUpperCase()}
              </span>
              <span className="text-blue-300 font-bold">
                {gpsAltitude !== null
                  ? `${Math.round(gpsAltitude)}m`
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {t.heading.toUpperCase()}
              </span>
              <span className="text-blue-300 font-bold">
                {gpsHeading !== null
                  ? `${Math.round(gpsHeading)}°`
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
              <span className="text-gray-600 flex items-center gap-1">
                ACC
              </span>
              <span
                className={`font-black ${accuracy && accuracy < 5 ? "text-green-500" : "text-orange-500"}`}
              >
                ±{accuracy ? accuracy.toFixed(1) : "---"}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto space-y-4">
        {!isLive ? (
          <div className="flex flex-col gap-3">
            <div
              className={`text-[10px] font-black uppercase tracking-[0.2em] text-center px-4 py-2 rounded-xl transition-all border ${isGpsLocked ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-orange-500/10 border-orange-500/30 text-orange-500 animate-pulse"}`}
            >
              {isGpsLocked ? t.signalReady : t.waitingSignal}
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
              className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-950/20 transition-all flex items-center justify-center gap-3 text-lg italic tracking-tight group"
            >
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              {t.startTest}
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStop}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-950/20 transition-all flex items-center justify-center gap-3 text-lg italic tracking-tight"
          >
            <CircleStop className="w-6 h-6" />
            {t.stopSave}
          </motion.button>
        )}

        <p className="text-[9px] text-center text-gray-500 leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter">
          {t.movementDetected}
        </p>
      </div>
    </motion.div>
  );
});
