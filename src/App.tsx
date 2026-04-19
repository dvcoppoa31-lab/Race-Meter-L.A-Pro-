/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
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
  Trash2,
  Plus,
  Info,
  Flag,
  Crosshair,
  Cpu,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Signal,
  Wifi,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- Types ---

type Language = 'id' | 'en' | 'th' | 'vi' | 'ms';

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
  obdScanner: string;
  connectOBD: string;
  disconnectOBD: string;
  obdStatus: string;
  rpm: string;
  coolant: string;
  engineLoad: string;
  throttle: string;
  connectionError: string;
  obdInfo: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  id: {
    welcome: 'SELAMAT DATANG',
    elitePerformance: 'Meter Performa PRO+',
    precisionGPS: 'lihat dan catat performa kendaraan mu dengan aplikasi DRAG RACE L.A PRO+',
    enterTrack: 'MASUK KE TRACK',
    dashboard: 'Dasbor',
    history: 'Histori',
    settings: 'Pengaturan',
    currentSpeed: 'Kecepatan Saat Ini',
    maxSpeed: 'Kecepatan Maks',
    accuracy: 'Akurasi',
    elapsedTime: 'Waktu Berjalan',
    distance: 'Jarak',
    splitsTargets: 'Splits & Target',
    recording: 'Merekam',
    startTest: 'MULAI TES PERFORMA',
    stopSave: 'BERHENTI & SIMPAN SESI',
    movementDetected: 'Tes dimulai otomatis saat gerakan terdeteksi (>1 km/jam). Jaga ponsel tetap stabil untuk GPS yang akurat.',
    pastSessions: 'Sesi Sebelumnya',
    deleteAll: 'Hapus Semua',
    noHistory: 'Belum ada data histori.',
    takeFirstTest: 'Ambil tes pertama kamu di Dashboard.',
    details: 'Detail Splits',
    config: 'Konfigurasi Jarak',
    templates: 'Templat Standar',
    reset: 'Reset ke Standar',
    myTargets: 'Target Saya',
    addTarget: 'Tambah Target Jarak',
    gpsInfo: 'GPS INFO',
    language: 'Bahasa',
    deleteConfirm: 'Hapus semua histori?',
    dailyBest: 'WAKTU TERBAIK',
    gForce: 'Tekanan G',
    altitude: 'Ketinggian',
    heading: 'Arah',
    gpsAccuracyLabel: 'Akurasi GPS',
    charts: 'Grafik',
    calibrate: 'Kalibrasi',
    obdScanner: 'OBD2 Scanner',
    connectOBD: 'Sambungkan OBD2',
    disconnectOBD: 'Putuskan',
    obdStatus: 'Status OBD',
    rpm: 'RPM Mesin',
    coolant: 'Suhu Pendingin',
    engineLoad: 'Beban Mesin',
    throttle: 'Posisi Throttle',
    connectionError: 'Gagal Menyambung',
    obdInfo: 'Sambungkan ke adaptor OBD2 BLE untuk melihat detail mesin real-time.'
  },
  en: {
    welcome: 'WELCOME',
    elitePerformance: 'PRO+ Performance Meter',
    precisionGPS: 'view and record your vehicle performance with DRAG RACE L.A PRO+ app',
    enterTrack: 'ENTER TRACK',
    dashboard: 'Dashboard',
    history: 'History',
    settings: 'Settings',
    currentSpeed: 'Current Speed',
    maxSpeed: 'Max Speed',
    accuracy: 'Accuracy',
    elapsedTime: 'Elapsed Time',
    distance: 'Distance',
    splitsTargets: 'Splits & Targets',
    recording: 'Recording',
    startTest: 'START PERFORMANCE TEST',
    stopSave: 'STOP & SAVE SESSION',
    movementDetected: 'Test begins automatically when movement is detected (>1 km/h). Keep phone steady for accurate GPS.',
    pastSessions: 'Past Sessions',
    deleteAll: 'Delete All',
    noHistory: 'No history data yet.',
    takeFirstTest: 'Take your first test in the Dashboard.',
    details: 'Split Details',
    config: 'Distance Configuration',
    templates: 'Default Templates',
    reset: 'Reset to Defaults',
    myTargets: 'My Targets',
    addTarget: 'Add Target Distance',
    gpsInfo: 'GPS INFO',
    language: 'Language',
    deleteConfirm: 'Delete all history?',
    dailyBest: 'DAILY BEST',
    gForce: 'G-Force',
    altitude: 'Altitude',
    heading: 'Heading',
    gpsAccuracyLabel: 'GPS Accuracy',
    charts: 'Charts',
    calibrate: 'Calibrate',
    obdScanner: 'OBD2 Scanner',
    connectOBD: 'Connect OBD2',
    disconnectOBD: 'Disconnect',
    obdStatus: 'OBD Status',
    rpm: 'Engine RPM',
    coolant: 'Coolant Temp',
    engineLoad: 'Engine Load',
    throttle: 'Throttle Position',
    connectionError: 'Connection Error',
    obdInfo: 'Connect to a BLE OBD2 adapter to see real-time engine details.'
  },
  th: {
    welcome: 'ยินดีต้อนรับ',
    elitePerformance: 'PRO+ Performance Meter',
    precisionGPS: 'ดูและบันทึกสมรรถนะรถของคุณด้วยแอป DRAG RACE L.A PRO+',
    enterTrack: 'เข้าสู่สนาม',
    dashboard: 'แดชบอร์ด',
    history: 'ประวัติ',
    settings: 'การตั้งค่า',
    currentSpeed: 'ความเร็วปัจจุบัน',
    maxSpeed: 'ความเร็วสูงสุด',
    accuracy: 'ความแม่นยำ',
    elapsedTime: 'เวลาที่ใช้ไป',
    distance: 'ระยะทาง',
    splitsTargets: 'ช่วงเวลาและเป้าหมาย',
    recording: 'กำลังบันทึก',
    startTest: 'เริ่มการทดสอบสมรรถนะ',
    stopSave: 'หยุดและบันทึกเซสชัน',
    movementDetected: 'การทดสอบเริ่มโดยอัตโนมัติเมื่อตรวจพบการเคลื่อนไหว (>1 กม./ชม.) วางโทรศัพท์ให้มั่นคงเพื่อ GPS ที่แม่นยำ',
    pastSessions: 'เซสชันที่ผ่านมา',
    deleteAll: 'ลบทั้งหมด',
    noHistory: 'ยังไม่มีข้อมูลประวัติ',
    takeFirstTest: 'เริ่มการทดสอบครั้งแรกของคุณที่แดชบอร์ด',
    details: 'รายละเอียดช่วงเวลา',
    config: 'การกำหนดค่าระยะทาง',
    templates: 'เทมเพลตเริ่มต้น',
    reset: 'รีเซ็ตเป็นค่าเริ่มต้น',
    myTargets: 'เป้าหมายของฉัน',
    addTarget: 'เพิ่มระยะทางเป้าหมาย',
    gpsInfo: 'ข้อมูล GPS',
    language: 'ภาษา',
    deleteConfirm: 'ลบประวัติทั้งหมดหรือไม่?',
    dailyBest: 'เวลาที่ดีที่สุด',
    gForce: 'แรงจี',
    altitude: 'ระดับความสูง',
    heading: 'ทิศทาง',
    gpsAccuracyLabel: 'ความแม่นยำ GPS',
    charts: 'กราฟ',
    calibrate: 'คาลิเบรต',
    obdScanner: 'OBD2 สแกนเนอร์',
    connectOBD: 'เชื่อมต่อ OBD2',
    disconnectOBD: 'ตัดการเชื่อมต่อ',
    obdStatus: 'สถานะ OBD',
    rpm: 'รอบเครื่องยนต์',
    coolant: 'อุณหภูมิน้ำหล่อเย็น',
    engineLoad: 'ภาระเครื่องยนต์',
    throttle: 'ตำแหน่งลิ้นปีกผีเสื้อ',
    connectionError: 'การเชื่อมต่อผิดพลาด',
    obdInfo: 'เชื่อมต่อกับอะแดปเตอร์ OBD2 BLE เพื่อดูรายละเอียดเครื่องยนต์แบบเรียลไทม์'
  },
  vi: {
    welcome: 'CHÀO MỪNG',
    elitePerformance: 'Máy Đo Hiệu Suất PRO+',
    precisionGPS: 'xem và ghi lại hiệu suất xe của bạn với ứng dụng DRAG RACE L.A PRO+',
    enterTrack: 'VÀO ĐƯỜNG ĐUA',
    dashboard: 'Bảng Điều Khiển',
    history: 'Lịch Sử',
    settings: 'Cài Đặt',
    currentSpeed: 'Tốc Độ Hiện Tại',
    maxSpeed: 'Tốc Độ Tối Đa',
    accuracy: 'Độ Chính Xác',
    elapsedTime: 'Thời Gian Trôi Qua',
    distance: 'Khoảng Cách',
    splitsTargets: 'Phân Đoạn & Mục Tiêu',
    recording: 'Đang Ghi',
    startTest: 'BẮT ĐẦU KIỂM TRA HIỆU SUẤT',
    stopSave: 'DỪNG & LƯU PHIÊN',
    movementDetected: 'Kiểm tra tự động bắt đầu khi phát hiện chuyển động (>1 km/h). Giữ điện thoại ổn định để GPS chính xác.',
    pastSessions: 'Các Phiên Trước',
    deleteAll: 'Xóa Tất Cả',
    noHistory: 'Chưa có dữ liệu lịch sử.',
    takeFirstTest: 'Thực hiện bài kiểm tra đầu tiên của bạn tại Bảng điều khiển.',
    details: 'Chi Tiết Phân Đoạn',
    config: 'Cấu Hình Khoảng Cách',
    templates: 'Mẫu Mặc Định',
    reset: 'Đặt Lại Mặc Định',
    myTargets: 'Mục Tiêu Của Tôi',
    addTarget: 'Thêm Khoảng Cách Mục Tiêu',
    gpsInfo: 'THÔNG TIN GPS',
    language: 'Ngôn Ngữ',
    deleteConfirm: 'Xóa tất cả lịch sử?',
    dailyBest: 'KỶ LỤC NGÀY',
    gForce: 'Lực G',
    altitude: 'Độ Cao',
    heading: 'Hướng',
    gpsAccuracyLabel: 'Độ chính xác GPS',
    charts: 'Biểu đồ',
    calibrate: 'Hiệu Chỉnh',
    obdScanner: 'Máy Quét OBD2',
    connectOBD: 'Kết Nối OBD2',
    disconnectOBD: 'Ngắt Kết Nối',
    obdStatus: 'Trạng Thái OBD',
    rpm: 'Vòng Tua Máy',
    coolant: 'Nhiệt Độ Nước Làm Mát',
    engineLoad: 'Tải Động Cơ',
    throttle: 'Vị Trí Bướm Ga',
    connectionError: 'Lỗi Kết Nối',
    obdInfo: 'Kết nối với bộ điều hợp OBD2 BLE để xem chi tiết động cơ theo thời gian thực.'
  },
  ms: {
    welcome: 'SELAMAT DATANG',
    elitePerformance: 'Meter Prestasi PRO+',
    precisionGPS: 'lihat dan rakam prestasi kenderaan anda dengan aplikasi DRAG RACE L.A PRO+',
    enterTrack: 'MASUK KE TREK',
    dashboard: 'Papan Pemuka',
    history: 'Sejarah',
    settings: 'Tetapan',
    currentSpeed: 'Kelajuan Semasa',
    maxSpeed: 'Kelajuan Maks',
    accuracy: 'Ketepatan',
    elapsedTime: 'Masa Berlalu',
    distance: 'Jarak',
    splitsTargets: 'Pecahan & Sasaran',
    recording: 'Merakam',
    startTest: 'MULA UJIAN PRESTASI',
    stopSave: 'BERHENTI & SIMPAN SESI',
    movementDetected: 'Ujian bermula secara automatik apabila gerakan dikesan (>1 km/j). Pastikan telefon stabil untuk GPS yang tepat.',
    pastSessions: 'Sesi Lepas',
    deleteAll: 'Padam Semua',
    noHistory: 'Tiada data sejarah lagi.',
    takeFirstTest: 'Ambil ujian pertama anda di Papan Pemuka.',
    details: 'Butiran Pecahan',
    config: 'Konfigurasi Jarak',
    templates: 'Templat Lalai',
    reset: 'Set Semula ke Lalai',
    myTargets: 'Sasaran Saya',
    addTarget: 'Tambah Jarak Sasaran',
    gpsInfo: 'INFO GPS',
    language: 'Bahasa',
    deleteConfirm: 'Padam semua sejarah?',
    dailyBest: 'MASA TERBAIK',
    gForce: 'Daya G',
    altitude: 'Altitud',
    heading: 'Arah',
    gpsAccuracyLabel: 'Ketepatan GPS',
    charts: 'Carta',
    calibrate: 'Kalibrasi',
    obdScanner: 'Pengimbas OBD2',
    connectOBD: 'Sambung OBD2',
    disconnectOBD: 'Putuskan',
    obdStatus: 'Status OBD',
    rpm: 'RPM Enjin',
    coolant: 'Suhu Penyejuk',
    engineLoad: 'Beban Enjin',
    throttle: 'Kedudukan Throttle',
    connectionError: 'Ralat Sambungan',
    obdInfo: 'Sambung ke penyesuai OBD2 BLE untuk melihat butiran enjin masa nyata.'
  }
};

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
  splits: Split[];
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
  { distance: 18.288, label: '60ft' },
  { distance: 100, label: '100m' },
  { distance: 201.168, label: '201m' },
  { distance: 203, label: '203m' },
  { distance: 402.336, label: '402m' },
];

const SPEED_THRESHOLD = 0.5; // m/s to start/stop timer (detect movement)

// --- Utils ---

const calculateDistance = (p1: { lat: number, lng: number }, p2: { lat: number, lng: number }) => {
  const R = 6371e3; // meters
  const phi1 = p1.lat * Math.PI / 180;
  const phi2 = p2.lat * Math.PI / 180;
  const dPhi = (p2.lat - p1.lat) * Math.PI / 180;
  const dLambda = (p2.lng - p1.lng) * Math.PI / 180;

  const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
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
  const [view, setView] = useState<'welcome' | 'dashboard' | 'history' | 'settings' | 'charts' | 'obd2'>('welcome');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('race_lang');
    return (saved && TRANSLATIONS[saved as Language]) ? (saved as Language) : 'id';
  });
  const [isLive, setIsLive] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [maxSpeed, setMaxSpeed] = useState(0); // km/h
  const [elapsedTime, setElapsedTime] = useState(0); // ms
  const [distanceCovered, setDistanceCovered] = useState(0); // meters
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [history, setHistory] = useState<RaceRun[]>(() => {
    const saved = localStorage.getItem('race_history');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customDistance, setCustomDistance] = useState<number>(1000);
  const [selectedTargets, setSelectedTargets] = useState<typeof DEFAULT_TARGETS>(() => {
    const saved = localStorage.getItem('race_targets');
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
  const [realTimeSpeedData, setRealTimeSpeedData] = useState<{ time: string, speed: number }[]>([]);
  const [peakG, setPeakG] = useState(0);
  const [sessionMaxAccuracy, setSessionMaxAccuracy] = useState<number | null>(null);
  const [gpsVersion, setGpsVersion] = useState(0);

  // OBD2 States
  const [obdConnected, setObdConnected] = useState(false);
  const [obdRPM, setObdRPM] = useState(0);
  const [obdCoolant, setObdCoolant] = useState(0);
  const [obdLoad, setObdLoad] = useState(0);
  const [obdThrottle, setObdThrottle] = useState(0);
  const [isObdConnecting, setIsObdConnecting] = useState(false);

  const characteristicRef = useRef<any>(null);
  const obdIntervalRef = useRef<number | null>(null);

  const connectOBD = async () => {
    if (!(navigator as any).bluetooth) {
      alert("Web Bluetooth not supported in this browser");
      return;
    }
    setIsObdConnecting(true);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [0xFFE0] }],
        optionalServices: [0xFFE0]
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(0xFFE0);
      const characteristic = await service?.getCharacteristic(0xFFE1);

      if (characteristic) {
        characteristicRef.current = characteristic;
        await characteristic.startNotifications();
        
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = new TextDecoder().decode(event.target.value);
          // Very basic parser for ELM327 hex responses
          const clean = value.replace(/\s/g, '');
          
          if (clean.includes('410C')) { // RPM
            const hex = clean.split('410C')[1].substring(0, 4);
            setObdRPM(parseInt(hex, 16) / 4);
          } else if (clean.includes('4105')) { // Coolant
            const hex = clean.split('4105')[1].substring(0, 2);
            setObdCoolant(parseInt(hex, 16) - 40);
          } else if (clean.includes('4104')) { // Load
            const hex = clean.split('4104')[1].substring(0, 2);
            setObdLoad((parseInt(hex, 16) * 100) / 255);
          } else if (clean.includes('4111')) { // Throttle
            const hex = clean.split('4111')[1].substring(0, 2);
            setObdThrottle((parseInt(hex, 16) * 100) / 255);
          }
        });

        // Initialize ELM327
        const encoder = new TextEncoder();
        await characteristic.writeValue(encoder.encode("ATZ\r"));
        setTimeout(async () => {
          await characteristic.writeValue(encoder.encode("ATE0\r"));
          await characteristic.writeValue(encoder.encode("ATL0\r"));
          await characteristic.writeValue(encoder.encode("ATSP0\r"));
          
          setObdConnected(true);
          
          // Start polling
          let step = 0;
          obdIntervalRef.current = window.setInterval(async () => {
            const pids = ["010C\r", "0105\r", "0104\r", "0111\r"];
            try {
              await characteristic.writeValue(encoder.encode(pids[step]));
              step = (step + 1) % pids.length;
            } catch (e) {
              console.error("Poll error", e);
            }
          }, 250);
        }, 1000);
      }
    } catch (err) {
      console.error("OBD Error:", err);
    } finally {
      setIsObdConnecting(false);
    }
  };

  const disconnectOBD = () => {
    if (obdIntervalRef.current) clearInterval(obdIntervalRef.current);
    setObdConnected(false);
    setObdRPM(0);
    setObdCoolant(0);
    setObdLoad(0);
    setObdThrottle(0);
  };

  const startPointRef = useRef<GPSPoint | null>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);
  const timerRef = useRef<number | null>(null);
  const pointsRef = useRef<GPSPoint[]>([]);

  // System Status monitor (Battery & Signal)
  useEffect(() => {
    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setBatteryCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
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
        if (conn.effectiveType === '4g') setSignalBars(4);
        else if (conn.effectiveType === '3g') setSignalBars(3);
        else if (conn.effectiveType === '2g') setSignalBars(2);
        else setSignalBars(1);
      } else {
        setSignalBars(4); // Default to full if unknown but online
      }
    };

    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener('change', updateConnection);

    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      if (conn) conn.removeEventListener('change', updateConnection);
    };
  }, []);

  const t = TRANSLATIONS[lang];

  // Save changes
  useEffect(() => {
    localStorage.setItem('race_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('race_targets', JSON.stringify(selectedTargets));
  }, [selectedTargets]);

  useEffect(() => {
    localStorage.setItem('race_lang', lang);
  }, [lang]);

  const dailyBestIds = useMemo(() => {
    const bests: Record<string, string> = {}; // key: date_distance, value: runId
    const bestTimes: Record<string, number> = {};

    history.forEach(run => {
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
        const totalAccel = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
        const gs = totalAccel / 9.80665;
        // Smoothing and Peak tracking
        setGForce(prev => (prev * 0.7) + (gs * 0.3));
        if (gs > peakG) setPeakG(gs);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  // Geolocation handling
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, altitude, heading } = position.coords;
        setAccuracy(accuracy);
        setGpsAltitude(altitude);
        setGpsHeading(heading);
        
        const currentPoint: GPSPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: position.timestamp,
          speed: speed,
          accuracy: accuracy
        };

        // Convert speed to km/h (speed is m/s)
        const speedKmr = (speed !== null && speed > 0) ? speed * 3.6 : 0;
        
        // Update real-time speed data for the graph (limited to 60 points for better performance)
        setRealTimeSpeedData(prev => {
          const newData = [...prev, { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            speed: Math.round(speedKmr) 
          }];
          return newData.slice(-60);
        });

        if (accuracy < (sessionMaxAccuracy || Infinity)) setSessionMaxAccuracy(accuracy);

        if (!isLive) {
          // even if not live, we show current speed if available
          setCurrentSpeed(speedKmr);
          return;
        }

        setCurrentSpeed(speedKmr);
        if (speedKmr > maxSpeed) setMaxSpeed(speedKmr);

        // Auto-start logic: speed threshold
        if (!isActive && speedKmr > 1.0) { // Start if we move faster than 1km/h
          setIsActive(true);
          startPointRef.current = currentPoint;
          lastPointRef.current = currentPoint;
          pointsRef.current = [currentPoint];
          setElapsedTime(0);
          setDistanceCovered(0);
          setSplits(selectedTargets.map(t => ({ ...t, time: undefined, speedAtSplit: undefined })));
          
          const startTime = Date.now();
          timerRef.current = window.setInterval(() => {
            setElapsedTime(Date.now() - startTime);
          }, 10);
        }

          // Active run logic
        if (isActive && lastPointRef.current) {
          const dist = calculateDistance(lastPointRef.current, currentPoint);
          const totalDist = distanceCovered + dist;
          setDistanceCovered(totalDist);
          pointsRef.current.push(currentPoint);

          // Check and update splits
          let updatedAnySplit = false;
          const nextSplits = splits.map(s => {
            if (!s.time && totalDist >= s.distance) {
              updatedAnySplit = true;
              return { 
                ...s, 
                time: elapsedTime / 1000, 
                speedAtSplit: speedKmr 
              };
            }
            return s;
          });

          if (updatedAnySplit) {
            setSplits(nextSplits);
          }

          const maxTargetDistance = selectedTargets.length > 0 
            ? Math.max(...selectedTargets.map(t => t.distance)) 
            : 0;

          if (maxTargetDistance > 0 && totalDist >= maxTargetDistance) {
            handleStop(totalDist, elapsedTime, nextSplits);
          } else {
            lastPointRef.current = currentPoint;
          }
        }
      },
      (error) => {
        console.error("Geo error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isLive, isActive, distanceCovered, elapsedTime, selectedTargets, maxSpeed, gpsVersion]);

  const calibrateGPS = () => {
    setGpsVersion(v => v + 1);
    // Force a small notification or just trust the re-mount
  };

  const handleStart = () => {
    setIsLive(true);
    setIsActive(false);
    setMaxSpeed(0);
    setPeakG(0);
    setElapsedTime(0);
    setDistanceCovered(0);
    setSessionMaxAccuracy(null);
    setSplits(selectedTargets.map(t => ({ ...t, time: undefined, speedAtSplit: undefined })));
  };

  const handleStop = (finalDistance?: number | any, finalTime?: number, finalSplits?: Split[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isActive) {
      // If triggered by a button click event, finalDistance will be an object. 
      // We only want numbers for automatic stops.
      const isAutoStop = typeof finalDistance === 'number';
      const effectiveDistance = isAutoStop ? finalDistance : distanceCovered;
      const effectiveTime = typeof finalTime === 'number' ? finalTime : elapsedTime;
      const effectiveSplits = Array.isArray(finalSplits) ? finalSplits : splits;

      const newRun: RaceRun = {
        id: Date.now().toString(),
        date: Date.now(),
        totalDistance: effectiveDistance,
        totalTime: effectiveTime,
        maxSpeed: maxSpeed,
        avgSpeed: (effectiveDistance / (effectiveTime / 1000)) * 3.6,
        peakG: peakG,
        accuracy: sessionMaxAccuracy || (accuracy || 0),
        splits: [...effectiveSplits]
      };
      setHistory(prev => [newRun, ...prev]);
    }

    setIsActive(false);
    setIsLive(false);
  };

  const deleteHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm(t.deleteConfirm)) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 font-sans selection:bg-violet-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-violet-600/40 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-600/40 blur-[80px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col p-4">
        {/* System Bar */}
        <div className="flex justify-end items-center gap-3 mb-2 px-1">
          <div className="flex items-center gap-1.5 mr-auto">
             <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`} />
             <span className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-gray-500' : 'text-red-500 italic'}`}>
               {isOnline ? 'Online' : 'Offline'}
             </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-end gap-0.5 h-3">
              {[1, 2, 3, 4].map(b => (
                <div 
                  key={b} 
                  className={`w-0.5 rounded-full transition-all ${b <= signalBars ? 'bg-violet-400' : 'bg-gray-800'}`}
                  style={{ height: `${25 * b}%` }}
                />
              ))}
            </div>
            <span className="text-[9px] font-black text-gray-500 font-mono italic ml-1">
              {signalBars === 4 ? 'LTE' : signalBars === 3 ? '4G' : signalBars === 2 ? '3G' : signalBars === 1 ? 'E' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-900/40 px-2 py-0.5 rounded-full border border-gray-800/50">
            <span className="text-[9px] font-black font-mono text-gray-400">{batteryLevel}%</span>
            <div className="relative">
              {batteryLevel > 80 ? <BatteryFull className={`w-3.5 h-3.5 ${batteryCharging ? 'text-green-400' : 'text-gray-400'}`} /> :
               batteryLevel > 30 ? <BatteryMedium className={`w-3.5 h-3.5 ${batteryCharging ? 'text-green-400' : 'text-gray-400'}`} /> :
               <BatteryLow className={`w-3.5 h-3.5 ${batteryCharging ? 'text-green-400' : 'text-red-500 animate-pulse'}`} />}
              {batteryCharging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        {view !== 'welcome' && (
          <header className="flex items-center justify-between py-2 border-b border-gray-800 mb-4">
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tighter flex items-center gap-1.5 italic uppercase leading-none">
                <Flag className="w-3.5 h-3.5 text-violet-500 -rotate-12 fill-violet-500/20" />
                DRAG <span className="text-violet-500">RACE</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[7px] not-italic font-mono bg-violet-500 text-black px-1 py-0.5 rounded font-black tracking-tighter">L.A PRO+</span>
                <p className="text-[7px] text-gray-700 uppercase tracking-[0.2em] font-mono leading-none">{t.elitePerformance}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-gray-950/80 p-0.5 rounded-full border border-gray-800">
              <button 
                onClick={() => setView('dashboard')}
                className={`p-1.5 rounded-full transition-all ${view === 'dashboard' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                title={t.dashboard}
              >
                <Gauge className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('obd2')}
                className={`p-1.5 rounded-full transition-all ${view === 'obd2' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                title={t.obdScanner}
              >
                <Cpu className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('charts')}
                className={`p-1.5 rounded-full transition-all ${view === 'charts' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                title={t.charts}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('history')}
                className={`p-1.5 rounded-full transition-all ${view === 'history' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                title={t.history}
              >
                <HistoryIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('settings')}
                className={`p-1.5 rounded-full transition-all ${view === 'settings' ? 'bg-violet-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                title={t.settings}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        <AnimatePresence mode="popLayout">
          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute inset-0 bg-violet-600/30 blur-[60px] -z-10"
                  />
                  <div className="absolute bottom-1 -right-4 bg-violet-500 text-black px-3 py-1 rounded-lg text-[10px] font-black italic tracking-widest shadow-2xl z-20 border border-white/20">
                    PRO+
                  </div>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <h1 className="text-7xl font-black italic tracking-tighter text-white leading-none">DRAG</h1>
                  <h1 className="text-7xl font-black italic tracking-tighter text-violet-500 leading-none -mt-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">RACE</h1>
                </div>

                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                  <span className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-[0.3em]">L.A Division</span>
                  <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono font-black text-violet-400 uppercase tracking-[0.3em] italic">Precision Gear</span>
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
                onClick={() => setView('dashboard')}
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

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col gap-6 will-change-[opacity,transform]"
            >
              {/* Primary Speed Display */}
              <div className="bg-gray-900/40 rounded-3xl p-8 border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="text-[10px] font-mono text-violet-500 mb-2 tracking-[0.2em] uppercase">{t.currentSpeed}</div>
                <div className="relative">
                   <div className="text-8xl font-black italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    {Math.round(currentSpeed)}
                  </div>
                  <div className="absolute -right-10 bottom-4 text-sm font-bold text-gray-500 italic">KM/H</div>
                </div>

                {/* Accuracy Status Indicator */}
                <div className="flex flex-col items-center gap-1 mt-4 relative">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${accuracy !== null && accuracy < 10 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : accuracy !== null && accuracy <= 30 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'} shadow-lg`} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.gpsAccuracyLabel}</span>
                  </div>
                  <div className="text-[10px] font-black font-mono text-gray-400 italic flex items-center gap-2">
                    <span>{accuracy !== null ? Math.round(Math.max(0, 100 - (accuracy - 3) * 3.3)) : 0}% <span className="text-[8px] text-gray-600 uppercase font-bold not-italic ml-0.5">Reliability</span></span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      animate={{ rotate: gpsVersion * 360 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
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
                    <div className="text-[10px] uppercase font-mono text-gray-500 mb-1">{t.maxSpeed}</div>
                    <div className="text-2xl font-bold font-mono text-violet-400 italic">{Math.round(maxSpeed)} <span className="text-[10px]">KM/H</span></div>
                  </div>
                  <div className="text-center border-l border-gray-800">
                    <div className="text-[10px] uppercase font-mono text-gray-500 mb-1">{t.accuracy}</div>
                    <div className={`text-2xl font-bold font-mono italic ${accuracy !== null && accuracy < 10 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {accuracy ? `±${Math.round(accuracy)}m` : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress & Timer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{t.elapsedTime}</span>
                  </div>
                  <div className="text-3xl font-black font-mono italic tracking-tight">{formatTime(elapsedTime)}<span className="text-xs ml-1 text-gray-600">S</span></div>
                </div>
                <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{t.distance}</span>
                  </div>
                  <div className="text-3xl font-black font-mono italic tracking-tight">{formatDistance(distanceCovered)}</div>
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
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{t.recording}</span>
                    </div>
                  )}
                </div>
                
                {/* Table Header */}
                <div className="px-4 py-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-black/20 border-b border-gray-800">
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider">{t.distance}</span>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider text-center">TIME</span>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-wider text-right">KPH</span>
                </div>

                <div className="divide-y divide-gray-800/30">
                  {splits.map((s, i) => (
                    <div key={i} className={`px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-colors ${s.time ? 'bg-violet-500/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-200">{s.label}</span>
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{formatDistance(s.distance)}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-xl font-black italic tabular-nums leading-none ${s.time ? 'text-white' : 'text-gray-800'}`}>
                          {s.time ? s.time.toFixed(2) : '--.--'}<span className="text-[10px] ml-0.5 not-italic uppercase opacity-30">s</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-black font-mono tracking-tighter italic ${s.speedAtSplit ? 'text-blue-400' : 'text-gray-700'}`}>
                          {s.speedAtSplit ? Math.round(s.speedAtSplit) : '---'}<span className="text-[8px] ml-0.5 not-italic opacity-40">kph</span>
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
                    <span className="text-[9px] font-black text-violet-500 uppercase tracking-[0.2em]">{t.gForce}</span>
                    <Activity className="w-3 h-3 text-violet-500/50" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono italic text-violet-500 leading-none">{gForce.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-600 font-bold italic">G</span>
                  </div>
                  <div className="mt-3 h-1 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" 
                      animate={{ width: `${Math.min(gForce * 50, 100)}%` }} 
                    />
                  </div>
                  <div className="mt-2 text-[8px] text-gray-500 font-mono flex justify-between uppercase">
                    <span>Peak</span>
                    <span className="text-violet-400 font-black">{peakG.toFixed(2)}G</span>
                  </div>
                </div>

                <div className="bg-gray-900/60 rounded-3xl p-4 border border-gray-800 relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-500/5 blur-2xl -ml-6 -mb-6" />
                  <div className="text-[10px] font-mono text-gray-500 uppercase mb-2 tracking-widest">{t.gpsInfo}</div>
                  <div className="space-y-1.5 font-mono text-[9px]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.altitude.toUpperCase()}</span>
                      <span className="text-blue-300 font-bold">{gpsAltitude !== null ? `${Math.round(gpsAltitude)}m` : '---'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.heading.toUpperCase()}</span>
                      <span className="text-blue-300 font-bold">{gpsHeading !== null ? `${Math.round(gpsHeading)}°` : '---'}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
                      <span className="text-gray-600 flex items-center gap-1">ACC</span>
                      <span className={`font-black ${accuracy && accuracy < 5 ? 'text-green-500' : 'text-orange-500'}`}>±{accuracy ? accuracy.toFixed(1) : '---'}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-auto space-y-4">
                {!isLive ? (
                  <button 
                    onClick={handleStart}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg italic tracking-tight group"
                  >
                    <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    {t.startTest}
                  </button>
                ) : (
                  <button 
                    onClick={handleStop}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg italic tracking-tight"
                  >
                    <CircleStop className="w-6 h-6" />
                    {t.stopSave}
                  </button>
                )}
                
                <p className="text-[9px] text-center text-gray-500 leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter">
                  {t.movementDetected}
                </p>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
               key="history"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.15 }}
               className="flex-1 flex flex-col gap-4 will-change-[opacity]"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t.pastSessions}</h2>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-[10px] font-bold text-red-500 hover:text-red-400 p-1">{t.deleteAll}</button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-12 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                  <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">{t.noHistory}<br /><span className="text-xs opacity-50">{t.takeFirstTest}</span></p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map((run) => (
                    <div key={run.id} className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-gray-400 font-mono mb-1 bg-gray-950/50 inline-block px-2 py-0.5 rounded border border-gray-800 self-start">
                            {new Date(run.date).toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour12: false })} • {new Date(run.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-black italic text-violet-500 uppercase leading-none">{run.maxSpeed.toFixed(0)} <span className="text-xs text-violet-400">{t.maxSpeed.toUpperCase()}</span></p>
                            {dailyBestIds.has(run.id) && (
                              <div className="flex items-center gap-1 bg-violet-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black italic">
                                <Trophy className="w-2 h-2 fill-current" />
                                {t.dailyBest}
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteHistory(run.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-black/20 p-2 rounded-xl relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/20 group-hover:bg-violet-500 transition-colors" />
                          <div className="text-[8px] uppercase text-gray-500 mb-1">{t.elapsedTime}</div>
                          <div className="text-sm font-black font-mono tracking-tight">{(run.totalTime / 1000).toFixed(2)}<span className="text-[10px] ml-0.5 opacity-30">S</span></div>
                        </div>
                         <div className="bg-black/20 p-2 rounded-xl relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                          <div className="text-[8px] uppercase text-gray-500 mb-1">{t.distance}</div>
                          <div className="text-sm font-black font-mono tracking-tight">{formatDistance(run.totalDistance)}</div>
                        </div>
                        <div className="bg-black/20 p-2 rounded-xl border border-gray-800/30">
                          <div className="text-[8px] uppercase text-gray-500 mb-1">Peak G</div>
                          <div className="text-sm font-black font-mono text-violet-400">{run.peakG ? run.peakG.toFixed(2) : '--.--'}<span className="text-[10px] ml-0.5 opacity-30">G</span></div>
                        </div>
                         <div className="bg-black/20 p-2 rounded-xl border border-gray-800/30">
                          <div className="text-[8px] uppercase text-gray-500 mb-1">ACCURACY</div>
                          <div className="text-sm font-black font-mono text-blue-400">±{run.accuracy ? run.accuracy.toFixed(1) : '--.-'}<span className="text-[10px] ml-0.5 opacity-30">M</span></div>
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-3">
                        <p className="text-[9px] uppercase font-bold text-gray-500 mb-2 tracking-widest">{t.details}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {run.splits.filter(s => s.time).map((s, i) => (
                            <div key={i} className="text-center bg-gray-950/50 p-2 rounded-xl border border-gray-800">
                              <p className="text-[8px] text-gray-500 font-bold mb-1">{s.label}</p>
                              <p className="text-sm font-black text-white italic leading-none">{s.time?.toFixed(2)}s</p>
                              {s.speedAtSplit && (
                                <p className="text-[9px] font-bold text-blue-400 italic mt-1">{Math.round(s.speedAtSplit)} kph</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'charts' && (
            <motion.div
              key="charts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-6 will-change-[opacity]"
            >
              <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> {t.charts}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Speed Feed</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-64 w-full bg-black/40 rounded-[2rem] p-4 border border-gray-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(139,92,246,1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={realTimeSpeedData.length > 0 ? realTimeSpeedData : [{ time: '', speed: 0 }]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 4" stroke="#222" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          stroke="#444" 
                          fontSize={8} 
                          tickLine={false}
                          axisLine={false}
                          hide={realTimeSpeedData.length === 0}
                        />
                        <YAxis 
                          stroke="#666" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          unit="kph"
                          domain={[0, 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #8b5cf633', borderRadius: '12px', fontSize: '9px', fontFamily: 'monospace' }}
                          itemStyle={{ color: '#8b5cf6', padding: '2px 0' }}
                          labelStyle={{ color: '#444' }}
                          cursor={{ stroke: '#8b5cf644', strokeWidth: 2 }}
                        />
                        <Area 
                          type="stepAfter" 
                          dataKey="speed" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorSpeed)" 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                      <p className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Current</p>
                      <p className="text-2xl font-black text-white italic">{Math.round(currentSpeed)} <span className="text-xs text-gray-500">KPH</span></p>
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                      <p className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Status</p>
                      <p className={`text-2xl font-black italic ${currentSpeed > 5 ? 'text-green-500' : 'text-gray-600'}`}>
                        {currentSpeed > 5 ? 'ACTIVE' : 'IDLE'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-4">
                    <p className="text-[10px] text-gray-400 leading-relaxed italic uppercase tracking-wider text-center">
                      Real-time telemetry streaming enabled
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'obd2' && (
            <motion.div
              key="obd2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-6 will-change-[opacity]"
            >
              <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> {t.obdScanner}
                  </h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${obdConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${obdConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{obdConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                  </div>
                </div>

                {!obdConnected ? (
                   <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center border border-gray-800 mb-6 group relative">
                         <div className="absolute inset-0 bg-violet-600/10 blur-2xl rounded-full" />
                         <BluetoothOff className="w-10 h-10 text-gray-700" />
                      </div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-8 max-w-[200px]">
                        {t.obdInfo}
                      </p>
                      <button 
                        onClick={connectOBD}
                        disabled={isObdConnecting}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-black py-4 px-10 rounded-2xl text-xs italic tracking-widest shadow-xl shadow-violet-600/20 flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isObdConnecting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Bluetooth className="w-4 h-4" />}
                        {t.connectOBD.toUpperCase()}
                      </button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {/* Big RPM Gauge */}
                    <div className="bg-gray-950 p-8 rounded-[2.5rem] border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-3xl -mr-16 -mt-16" />
                       <div className="text-[10px] font-mono text-violet-500 mb-2 tracking-[0.2em] uppercase">{t.rpm}</div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-7xl font-black italic tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                           {Math.round(obdRPM)}
                         </span>
                       </div>
                       <div className="w-full h-2 bg-gray-900 rounded-full mt-6 overflow-hidden max-w-[240px]">
                         <motion.div 
                            className="h-full bg-gradient-to-r from-violet-500 to-red-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                            animate={{ width: `${Math.min((obdRPM / 8000) * 100, 100)}%` }}
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800">
                          <div className="text-[8px] font-bold text-gray-600 uppercase mb-2 tracking-widest">{t.coolant}</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic text-gray-300">{Math.round(obdCoolant)}</span>
                            <span className="text-[10px] text-gray-600">°C</span>
                          </div>
                          <div className="mt-3 w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${Math.min((obdCoolant / 120) * 100, 100)}%` }} />
                          </div>
                       </div>
                       <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800">
                          <div className="text-[8px] font-bold text-gray-600 uppercase mb-2 tracking-widest">{t.engineLoad}</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic text-gray-300">{Math.round(obdLoad)}</span>
                            <span className="text-[10px] text-gray-600">%</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.throttle}</span>
                          <span className="text-lg font-black text-violet-400 italic">{Math.round(obdThrottle)}%</span>
                       </div>
                       <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                             className="h-full bg-violet-500 rounded-full"
                             animate={{ width: `${obdThrottle}%` }}
                          />
                       </div>
                    </div>

                    <button 
                      onClick={disconnectOBD}
                      className="mt-4 border border-red-500/20 text-red-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                    >
                      <BluetoothOff className="w-3.5 h-3.5" />
                      {t.disconnectOBD}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-6 will-change-[opacity]"
            >
              <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center gap-2">
                  <Gauge className="w-4 h-4" /> {t.language}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['id', 'en', 'th', 'vi', 'ms'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${lang === l ? 'bg-violet-500 border-violet-400 text-white shadow-lg' : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">{l === 'id' ? 'Indonesia' : l === 'en' ? 'English' : l === 'th' ? 'Thailand' : l === 'vi' ? 'Vietnam' : 'Malaysia'}</span>
                      {lang === l && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> {t.config}
                </h3>
                
                <div className="space-y-4">
                   <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t.templates}</label>
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
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 block">{t.myTargets}</label>
                    <div className="space-y-2">
                      {selectedTargets.map((target, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-950/80 p-3 rounded-xl border border-gray-800">
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
                              newTargets[idx].distance = parseFloat(e.target.value);
                              setSelectedTargets(newTargets);
                            }}
                            className="bg-transparent border-none focus:ring-0 text-sm font-mono text-violet-400 text-right w-24"
                          />
                          <span className="text-[10px] text-gray-600 font-bold">M</span>
                          <button 
                            onClick={() => setSelectedTargets(selectedTargets.filter((_, i) => i !== idx))}
                            className="text-gray-600 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => setSelectedTargets([...selectedTargets, { distance: 1000, label: 'Custom' }])}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-800 rounded-xl text-[10px] font-bold text-gray-500 hover:text-violet-500 hover:border-violet-500/50 transition-all uppercase"
                      >
                        <Plus className="w-3 h-3" /> {t.addTarget}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-violet-500 shrink-0" />
                <p className="text-[10px] text-violet-200/70 leading-relaxed font-medium uppercase tracking-wider">
                  Always ensure clear sky view for best results
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <footer className="mt-8 text-center pb-8 opacity-30">
          <p className="text-[8px] font-mono tracking-[0.3em] uppercase">Built for Performance • L.A Tech Division</p>
        </footer>
      </main>
    </div>
  );
}
