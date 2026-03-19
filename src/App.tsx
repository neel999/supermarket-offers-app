/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Printer, Tag, Package, ShoppingBag, AlertCircle, Edit2, Check, X, Weight, Droplet, Box, Boxes, Layers, FileDown, Eye, EyeOff, FileUp, ShoppingCart, Boxes as BoxesIcon, Copy, ChevronLeft, ChevronRight, Rows, RotateCcw, Bold, Italic, Underline, User, Lock, ShoppingBasket, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from './types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const logoUrl = "https://storage.googleapis.com/aistudio-build-assets/nozha-market-logo.png";
  const [isPreview, setIsPreview] = useState(false);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [justBackFromPreview, setJustBackFromPreview] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [printOptions, setPrintOptions] = useState(() => {
    const defaultOptions = {
      columns: 2,
      rows: 2,
      labelsPerPage: 4,
      size: 'small' as 'small' | 'medium' | 'large',
      orientation: 'portrait' as 'portrait' | 'landscape',
      watermarkOpacity: 0.08,
      watermarkScale: 2.2,
      showWatermark: true,
      layout: 'standard' as 'standard',
      margin: 2,
      gap: 2,
      repeatFourTimes: false,
      borderRadius: '2xl' as 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    };

    const saved = localStorage.getItem('nozha_print_options');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultOptions, ...parsed, margin: 2, gap: 2 };
      } catch (e) {
        console.error('Error parsing saved print options', e);
      }
    }
    return defaultOptions;
  });

  useEffect(() => {
    localStorage.setItem('nozha_print_options', JSON.stringify(printOptions));
  }, [printOptions]);

  const bulkFileRef = useRef<HTMLInputElement>(null);
  
  const BRAND_GREEN = '#52733B';
  const BRAND_RED = '#D32F2F';
  const BRAND_GOLD = '#E1B024';

  const renderLabel = (product: Product, sizeOverride?: 'small' | 'medium' | 'large') => {
    const themeColor = '#000000';
    const accentColor = '#000000';
    const goldColor = '#000000';
    
    const size = sizeOverride || printOptions.size;

    const borderRadiusClasses: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    };

    const printBorderRadiusClasses: Record<string, string> = {
      none: 'print:rounded-none',
      sm: 'print:rounded-sm',
      md: 'print:rounded-md',
      lg: 'print:rounded-lg',
      xl: 'print:rounded-xl',
      '2xl': 'print:rounded-2xl',
      '3xl': 'print:rounded-3xl',
      full: 'print:rounded-full',
    };
    
    return (
      <div key={product.id + (sizeOverride || '')} className="relative group h-full">
        {/* UI Controls - Hidden on Print */}
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 print:hidden">
          <button 
            onClick={() => handleEdit(product)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title="تعديل"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleCopy(product)}
            className={`p-2 rounded-full transition-all ${
              copiedId === product.id 
                ? 'bg-green-100 text-green-600' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={copiedId === product.id ? "تم النسخ!" : "نسخ CSV"}
          >
            {copiedId === product.id ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button 
            onClick={() => setDeleteConfirmId(product.id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* The Label Card */}
        <div 
          className={`bg-white border-2 overflow-hidden shadow-lg print:shadow-none print:border-4 flex flex-col relative h-full ${borderRadiusClasses[printOptions.borderRadius] || 'rounded-2xl'} ${printBorderRadiusClasses[printOptions.borderRadius] || 'print:rounded-2xl'}`}
          style={{ 
            borderColor: '#000000',
            background: '#ffffff' 
          }}
        >
          {/* Premium Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            
          {/* Modern Geometric Accents */}
          <svg className="absolute top-0 right-0 w-32 h-32 opacity-[0.1]" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="80" fill="none" stroke="#000000" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="60" fill="none" stroke="#000000" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="40" fill="none" stroke="#000000" strokeWidth="0.5" />
          </svg>
        </div>

          {/* Offer Header */}
          <div 
            className={`bg-white text-black border-b-4 border-black text-center font-black uppercase tracking-widest relative z-10 shadow-sm flex items-center justify-center gap-4 ${
              size === 'large' ? 'py-6 text-4xl print:py-12 print:text-7xl' : 
              size === 'small' ? 'py-2 text-xl print:py-4 print:text-3xl' : 
              'py-3 text-2xl print:py-6 print:text-5xl'
            }`}
          >
            <span>عرض خاص • SPECIAL OFFER</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between print:p-8 relative z-10">
            {/* Savings Badge */}
            {product.oldPrice > product.newPrice && (
              <div 
                className={`absolute top-0 right-0 bg-white text-black border-b-4 border-l-4 border-black font-black font-display shadow-md rounded-bl-2xl ${
                  size === 'small' ? 'px-3 py-1 text-base print:text-2xl print:px-6 print:py-2' : 'px-4 py-2 text-xl print:text-4xl print:px-8 print:py-4'
                }`}
              >
                وفر {Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)}%
              </div>
            )}

            <div className={`text-center mb-6 relative ${
              size === 'small' && product.oldPrice > product.newPrice ? 'pt-10 print:pt-16' : ''
            } ${size === 'large' ? 'pt-16 print:pt-32' : ''}`}>
              <h2 className={`text-stone-800 mb-3 leading-tight font-display ${
                product.isBold ? 'font-black' : 'font-normal'
              } ${product.isItalic ? 'italic' : ''} ${product.isUnderline ? 'underline underline-offset-8' : ''} ${
                size === 'large' ? (product.name.length > 40 ? 'text-4xl print:text-7xl' : product.name.length > 25 ? 'text-5xl print:text-8xl' : 'text-6xl print:text-9xl') : 
                size === 'small' ? (product.name.length > 40 ? 'text-base print:text-xl px-10' : product.name.length > 25 ? 'text-lg print:text-2xl px-10' : 'text-xl print:text-3xl px-10') : 
                (product.name.length > 40 ? 'text-xl print:text-3xl' : product.name.length > 25 ? 'text-2xl print:text-4xl' : 'text-3xl print:text-6xl')
              }`}>
                {product.name}
              </h2>
              <div 
                className={`inline-flex items-center gap-3 px-5 py-2 rounded-2xl font-black border shadow-xs ${
                  size === 'large' ? 'print:text-6xl print:px-16 print:py-6 mt-8' : 'print:text-4xl print:px-12 print:py-4'
                } print:rounded-full`}
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  color: '#000000',
                  borderColor: '#000000'
                }}
              >
                <div className="bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center print:p-3 print:rounded-2xl">
                  {product.unit === 'كجم' && <Weight size={20} className="print:w-10 print:h-10" />}
                  {product.unit === 'لتر' && <Droplet size={20} className="print:w-10 print:h-10" />}
                  {product.unit === 'علبة' && <Box size={20} className="print:w-10 print:h-10" />}
                  {product.unit === 'كيس' && <ShoppingBasket size={20} className="print:w-10 print:h-10" />}
                  {product.unit === 'كرتونة' && <BoxesIcon size={20} className="print:w-10 print:h-10" />}
                  {product.unit === 'قطعة' && <Package size={20} className="print:w-10 print:h-10" />}
                  {!['كجم', 'لتر', 'علبة', 'كيس', 'كرتونة', 'قطعة'].includes(product.unit) && <Tag size={20} className="print:w-10 print:h-10" />}
                </div>
                <span className="tracking-wide">{product.unit}</span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-10 mb-8 print:gap-20">
              {product.oldPrice > 0 && (
                <div className="text-center">
                  <div className={`text-stone-400 font-bold mb-1 uppercase tracking-wider ${size === 'large' ? 'text-2xl print:text-5xl' : 'text-sm print:text-3xl'}`}>بدلاً من</div>
                  <div className={`text-stone-400 font-black opacity-70 font-display relative ${size === 'large' ? 'text-8xl print:text-[12rem]' : 'text-5xl print:text-8xl'}`}>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[120%] h-[4px] bg-stone-400 rotate-[-15deg] opacity-60"></div>
                    </div>
                    {product.oldPrice} <span className={`${size === 'large' ? 'text-3xl print:text-5xl' : 'text-lg print:text-3xl'}`}>ر.س</span>
                  </div>
                </div>
              )}
              
              <div className="text-center relative">
                <div className={`font-bold mb-1 uppercase tracking-wider ${size === 'large' ? 'text-2xl print:text-5xl' : 'text-sm print:text-3xl'}`} style={{ color: '#000000' }}>السعر الآن</div>
                <div 
                  className={`font-black flex items-baseline gap-1 drop-shadow-sm font-display ${
                    size === 'large' ? 'text-[12rem] print:text-[25rem]' : 
                    size === 'small' ? 'text-7xl print:text-[10rem]' : 
                    'text-[9rem] print:text-[18rem]'
                  }`}
                  style={{ color: '#000000' }}
                >
                  {product.newPrice}
                  <span className={`${size === 'large' ? 'text-4xl print:text-7xl' : 'text-2xl print:text-5xl'}`}>ر.س</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white border-2 border-dashed border-black rounded-xl p-4 flex items-center justify-center gap-3 text-black font-black print:text-4xl print:p-8 print:rounded-3xl">
                <AlertCircle size={24} className="print:w-12 print:h-12" />
                <span>{product.limit ? `الحد الأقصى لكل عميل: ${product.limit}` : 'العرض ساري حتى نفاذ الكمية'}</span>
              </div>

              {product.expiryDate && (
                <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-center gap-2 text-stone-600 font-bold text-xs print:text-3xl print:p-6 print:rounded-2xl">
                  <span>ينتهي العرض في: {product.expiryDate}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative Footer Bar */}
          <div className="h-2 w-full bg-black" />
        </div>
      </div>
    );
  };

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    oldPrice: 0,
    newPrice: 0,
    unit: 'قطعة',
    limit: '',
    expiryDate: '',
    isBold: false,
    isItalic: false,
    isUnderline: false
  });

  const handleAddProduct = () => {
    if (!formData.name || formData.newPrice <= 0) return;
    
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
      setEditingId(null);
    } else {
      const newProduct: Product = {
        ...formData,
        id: crypto.randomUUID()
      };
      setProducts([...products, newProduct]);
    }
    
    setFormData({ 
      name: '', 
      oldPrice: 0, 
      newPrice: 0, 
      unit: 'قطعة', 
      limit: '', 
      expiryDate: '',
      isBold: false,
      isItalic: false,
      isUnderline: false
    });
    setIsAdding(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      oldPrice: product.oldPrice,
      newPrice: product.newPrice,
      unit: product.unit,
      limit: product.limit || '',
      expiryDate: product.expiryDate || '',
      isBold: product.isBold || false,
      isItalic: product.isItalic || false,
      isUnderline: product.isUnderline || false
    });
    setEditingId(product.id);
    setIsAdding(true);
    
    const standardUnits = ['قطعة', 'كجم', 'لتر', 'علبة', 'كيس', 'كرتونة'];
    if (!standardUnits.includes(product.unit)) {
      setIsCustomUnit(true);
    } else {
      setIsCustomUnit(false);
    }
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (product: Product) => {
    const csv = Papa.unparse([
      {
        'Name': product.name,
        'Old Price': product.oldPrice,
        'New Price': product.newPrice,
        'Unit': product.unit,
        'Limit': product.limit || '',
        'Expiry Date': product.expiryDate || ''
      }
    ]);
    navigator.clipboard.writeText(csv);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBulkImport = (text: string) => {
    if (!text.trim()) return;
    setImportError(null);
    
    Papa.parse(text, {
      header: false,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setImportError(`خطأ في تحليل الملف: ${results.errors[0].message}`);
          return;
        }
        processImportData(results.data as any[][]);
      },
      error: (error) => {
        setImportError(`خطأ أثناء الاستيراد: ${error.message}`);
      }
    });
  };

  const handleExcelImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        processImportData(jsonData);
      } catch (error: any) {
        setImportError(`خطأ في قراءة ملف Excel: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const excelDateToJSDate = (serial: number) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);
    const seconds = total_seconds % 60;
    total_seconds -= seconds;
    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;
    const d = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
    return d.toISOString().split('T')[0];
  };

  const processImportData = (data: any[][]) => {
    if (data.length === 0) {
      setImportError('الملف فارغ أو لا يحتوي على بيانات صالحة.');
      return;
    }

    // Check if first row is a header
    let startIndex = 0;
    const firstRow = data[0];
    const expectedHeaders = ['الاسم', 'السعر القديم', 'السعر الجديد', 'الوحدة', 'الحد الأقصى', 'التاريخ'];
    const isHeader = firstRow.some(cell => 
      typeof cell === 'string' && 
      expectedHeaders.some(h => cell.includes(h) || h.includes(cell))
    );
    
    if (isHeader) {
      startIndex = 1;
    }

    const validRows = data.slice(startIndex).filter((row: any) => Array.isArray(row) && row.length >= 2);
    
    if (validRows.length === 0) {
      setImportError('لم يتم العثور على بيانات صالحة. تأكد من أن التنسيق صحيح (الاسم، السعر القديم، السعر الجديد).');
      return;
    }

    const errors: string[] = [];
    const newProducts: Product[] = [];

    validRows.forEach((row: any, index) => {
      const actualIndex = index + startIndex + 1;
      const [name, oldPrice, newPrice, unit, limit, expiryDate] = row;
      
      if (!name || String(name).trim() === '') {
        errors.push(`السطر ${actualIndex}: اسم المنتج مفقود.`);
        return;
      }

      const parsedOldPrice = parseFloat(String(oldPrice)) || 0;
      const parsedNewPrice = parseFloat(String(newPrice)) || 0;

      if (isNaN(parsedOldPrice) && oldPrice !== null && oldPrice !== undefined) {
        errors.push(`السطر ${actualIndex}: السعر القديم يجب أن يكون رقماً.`);
      }
      if (isNaN(parsedNewPrice) && newPrice !== null && newPrice !== undefined) {
        errors.push(`السطر ${actualIndex}: السعر الجديد يجب أن يكون رقماً.`);
      }

      let formattedExpiryDate = String(expiryDate || '').trim();
      if (typeof expiryDate === 'number' && expiryDate > 40000) {
        formattedExpiryDate = excelDateToJSDate(expiryDate);
      }

      newProducts.push({
        id: crypto.randomUUID(),
        name: String(name || '').trim(),
        oldPrice: parsedOldPrice,
        newPrice: parsedNewPrice,
        unit: String(unit || 'قطعة').trim(),
        limit: String(limit || '').trim(),
        expiryDate: formattedExpiryDate
      });
    });

    if (errors.length > 0) {
      setImportError(`تم العثور على أخطاء في ${errors.length} أسطر. مثال: ${errors[0]}`);
    }

    if (newProducts.length > 0) {
      setProducts([...products, ...newProducts]);
      if (errors.length === 0) {
        setIsBulkAdding(false);
        setBulkText('');
        setImportError(null);
      }
    } else if (errors.length > 0) {
      setImportError(errors[0]);
    }
  };

  const handlePrint = () => {
    setShowPrintConfirm(true);
  };

  const executePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `@page { size: ${printOptions.orientation}; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById(isPreview ? 'preview-container' : 'labels-grid');
    if (!element) return;
    
    setIsExporting(true);
    
    try {
      const opt = {
        margin: isPreview ? 0 : 10,
        filename: `nozha-offers-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: printOptions.orientation }
      };

      // @ts-ignore
      const worker = html2pdf();
      await worker.set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans dir-rtl relative overflow-hidden" dir="rtl">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 100, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl w-full max-w-lg rounded-[3.5rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-white relative z-10 p-12 text-center"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-stone-100 border border-stone-50 p-6"
            >
              <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </motion.div>

            <h1 className="text-5xl font-black text-stone-800 mb-4 tracking-tight">نزهة ماركت</h1>
            <p className="text-stone-500 mb-12 text-xl font-medium">نظام إدارة العروض والملصقات الذكي</p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogin(true)}
                className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50 flex items-center justify-center gap-3"
              >
                <span>ابدأ الآن</span>
                <ChevronLeft size={24} />
              </motion.button>
              
              <p className="text-stone-400 text-sm font-bold pt-8">v2.5 • نسخة احترافية</p>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans dir-rtl relative overflow-hidden" dir="rtl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 100, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              x: [0, -100, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-100/30 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 50, 0],
              y: [0, 100, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-white relative z-10"
        >
          <div className="p-10 text-center">
            <div className="flex justify-start mb-6">
              <button 
                onClick={() => setShowLogin(false)}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold transition-colors"
              >
                <ChevronRight size={20} />
                <span>رجوع</span>
              </button>
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-stone-100 border border-stone-100 overflow-hidden p-4 group"
            >
              <img 
                src={logoUrl} 
                alt="Nozha Market Logo" 
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl font-black text-stone-800 mb-3 font-display tracking-tight">نزهة ماركت</h1>
              <p className="text-stone-500 mb-10 font-medium text-lg">نظام إدارة العروض الذكي</p>
            </motion.div>
            
            <form onSubmit={handleLogin} className="space-y-5 text-right">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-bold text-stone-600 mb-2 mr-4">اسم المستخدم</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full pr-14 pl-8 py-5 bg-stone-50/50 border-2 border-stone-100 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-lg"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-bold text-stone-600 mb-2 mr-4">كلمة المرور</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pr-14 pl-8 py-5 bg-stone-50/50 border-2 border-stone-100 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-lg"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                </div>
              </motion.div>
              
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100"
                >
                  <AlertCircle size={20} />
                  {loginError}
                </motion.div>
              )}
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50 mt-4 flex items-center justify-center gap-3"
              >
                <span>دخول للنظام</span>
                <ChevronLeft size={24} />
              </motion.button>
            </form>
          </div>
          <div className="bg-stone-50/50 py-8 text-center border-t border-stone-100 backdrop-blur-sm">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">نظام إدارة العروض v2.5 • 2026</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans dir-rtl" dir="rtl">
      {/* Header - Hidden on Print */}
      <header className="bg-white border-b border-stone-200 py-6 px-4 mb-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-white w-24 h-24 rounded-xl flex items-center justify-center border border-stone-200 shadow-sm overflow-hidden p-2">
              <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-800 font-display">نزهة ماركت</h1>
              <p className="text-sm text-stone-500">مولد عروض السوبر ماركت الاحترافي</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {(isAdding || isBulkAdding) && (
              <button 
                onClick={() => {
                  if (isAdding) {
                    setIsAdding(false);
                    setEditingId(null);
                  }
                  if (isBulkAdding) {
                    setIsBulkAdding(false);
                  }
                }}
                className="flex items-center gap-2 bg-stone-100 text-stone-600 px-6 py-3 rounded-2xl hover:bg-stone-200 transition-all font-black shadow-sm border border-stone-200"
              >
                <ChevronRight size={20} />
                رجوع
              </button>
            )}
            <div className="flex bg-stone-100 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => {
                  if (justBackFromPreview) {
                    setProducts([]);
                    setJustBackFromPreview(false);
                  }
                  setIsAdding(true);
                }}
                className="flex items-center gap-2 bg-[#52733B] text-white px-5 py-2 rounded-lg hover:bg-[#3E572D] transition-all shadow-sm font-bold"
              >
                <Plus size={18} />
                <span>إضافة منتج</span>
              </button>
              <button 
                onClick={() => setIsBulkAdding(true)}
                className="flex items-center gap-2 text-stone-600 px-5 py-2 rounded-lg hover:bg-white hover:text-emerald-700 transition-all font-bold"
                title="استيراد متعدد"
              >
                <FileUp size={18} />
                <span className="hidden md:inline">استيراد متعدد</span>
              </button>
              {products.length > 0 && (
                <button 
                  onClick={() => setDeleteConfirmId('all')}
                  className="flex items-center gap-2 text-red-500 px-5 py-2 rounded-lg hover:bg-red-50 transition-all font-bold"
                  title="حذف الكل"
                >
                  <Trash2 size={18} />
                  <span className="hidden md:inline">حذف الكل</span>
                </button>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setShowLogin(false);
                }}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-xl hover:bg-red-100 transition-all font-black text-xs border border-red-100 shadow-sm"
              >
                <ChevronRight size={14} />
                خروج
              </button>
              {products.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (isPreview) {
                        setJustBackFromPreview(true);
                      }
                      setIsPreview(!isPreview);
                      setCurrentPreviewPage(0);
                    }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-md font-bold ${
                      isPreview ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                    title={isPreview ? 'إغلاق المعاينة' : 'معاينة الطباعة'}
                  >
                    {isPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                    <span className="hidden sm:inline">{isPreview ? 'إغلاق المعاينة' : 'معاينة الطباعة'}</span>
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className={`flex items-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition-all shadow-md font-bold ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="تصدير PDF"
                  >
                    {isExporting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileDown size={20} />
                    )}
                    <span className="hidden sm:inline">{isExporting ? 'جاري التصدير...' : 'تصدير PDF'}</span>
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-stone-800 text-white px-6 py-2.5 rounded-xl hover:bg-stone-900 transition-all shadow-md font-bold"
                  >
                    <Printer size={20} />
                    <span className="hidden sm:inline">طباعة الكل</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-20 print:p-0 print:max-w-none">
        {/* Print Settings - Hidden on Print */}
        {products.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 flex flex-wrap items-center gap-8 print:hidden shadow-sm"
          >
            {/* Visual Layout Preview */}
            <div className="flex flex-col items-center gap-2 pr-6 border-l border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Layers size={10} />
                تخطيط الصفحة
              </span>
              <div 
                className={`bg-stone-50 border-2 border-stone-300 rounded-md relative overflow-hidden transition-all duration-500 shadow-inner ${
                  printOptions.orientation === 'portrait' ? 'w-12 h-16' : 'w-16 h-12'
                }`}
              >
                {printOptions.layout === 'mixed' ? (
                  <div className="flex flex-col h-full w-full gap-[1px] bg-stone-200 p-[1px]">
                    <div className="h-1/2 bg-white border border-stone-100 rounded-[1px]" />
                    <div className="h-1/2 grid grid-cols-2 grid-rows-2 gap-[1px]">
                      <div className="bg-white border border-stone-100 rounded-[1px]" />
                      <div className="bg-white border border-stone-100 rounded-[1px]" />
                      <div className="bg-white border border-stone-100 rounded-[1px]" />
                      <div className="bg-white border border-stone-100 rounded-[1px]" />
                    </div>
                  </div>
                ) : (
                  <div 
                    className="grid h-full w-full bg-stone-200 p-[2px]"
                    style={{
                      gridTemplateColumns: `repeat(${printOptions.columns}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.ceil(printOptions.labelsPerPage / printOptions.columns)}, 1fr)`,
                      gap: `${(printOptions.gap || 10) / 10}px`
                    }}
                  >
                    {Array.from({ length: printOptions.labelsPerPage }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`bg-white border border-stone-100 transition-all duration-300 ${
                          printOptions.borderRadius === 'none' ? 'rounded-none' : 'rounded-[2px]'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  {printOptions.orientation === 'portrait' ? 'A4 R' : 'A4 L'}
                </span>
                <div className="flex gap-1 mt-0.5">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                    {printOptions.layout === 'mixed' ? 'MIXED' : (printOptions.size === 'small' ? 'S' : printOptions.size === 'medium' ? 'M' : 'L')}
                  </span>
                  {printOptions.layout !== 'mixed' && (
                    <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 rounded">
                      {printOptions.columns}x{printOptions.rows}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-500 flex items-center gap-2">
                <Layers size={16} />
                تخطيط الصفحة:
              </span>
              <div className="flex bg-stone-100 p-1 rounded-lg">
                {[1, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      let cols = 1;
                      let rows = 1;
                      let size: 'small' | 'medium' | 'large' = 'medium';
                      if (count === 4) {
                        cols = 2;
                        rows = 2;
                        size = 'small';
                      } else if (count === 1) {
                        cols = 1;
                        rows = 1;
                        size = 'large';
                      }
                      setPrintOptions({ 
                        ...printOptions, 
                        labelsPerPage: count, 
                        columns: cols, 
                        rows, 
                        size, 
                        layout: 'standard',
                        repeatFourTimes: count === 4 
                      });
                    }}
                    className={`px-6 py-1 rounded-md text-sm font-bold transition-all ${
                      printOptions.labelsPerPage === count && printOptions.layout === 'standard'
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {count === 1 ? 'ملصق واحد (كامل الصفحة)' : '4 ملصقات في الصفحة'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-stone-400 rounded-sm" />
                زوايا الملصق:
              </span>
              <select 
                value={printOptions.borderRadius}
                onChange={(e) => setPrintOptions({ ...printOptions, borderRadius: e.target.value })}
                className="bg-stone-100 px-3 py-1.5 rounded-lg text-sm font-bold text-stone-700 outline-none border-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="none">حادة (None)</option>
                <option value="sm">صغيرة (SM)</option>
                <option value="md">متوسطة (MD)</option>
                <option value="lg">كبيرة (LG)</option>
                <option value="xl">كبيرة جداً (XL)</option>
                <option value="2xl">دائرية (2XL)</option>
                <option value="3xl">دائرية جداً (3XL)</option>
                <option value="full">كاملة (Full)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-500 flex items-center gap-2">
                <Printer size={16} />
                الاتجاه:
              </span>
              <div className="flex bg-stone-100 p-1 rounded-lg">
                {(['portrait', 'landscape'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPrintOptions({ ...printOptions, orientation: opt })}
                    className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${
                      printOptions.orientation === opt 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {opt === 'portrait' ? 'رأسي' : 'أفقي'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button 
                onClick={() => setPrintOptions({
                  columns: 2,
                  rows: 2,
                  labelsPerPage: 4,
                  size: 'small',
                  orientation: 'portrait',
                  watermarkOpacity: 0.08,
                  watermarkScale: 2.2,
                  showWatermark: true,
                  layout: 'standard',
                  margin: 2,
                  gap: 2,
                  repeatFourTimes: false,
                  borderRadius: '2xl'
                })}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                title="إعادة ضبط الإعدادات"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Add Form Modal - Hidden on Print */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setIsAdding(false); setEditingId(null); }}
                      className="flex items-center gap-2 text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-100 rounded-lg transition-all"
                    >
                      <ChevronRight size={24} />
                      <span className="font-bold">رجوع</span>
                    </button>
                    <h2 className="text-xl font-bold">{editingId ? 'تعديل العرض' : 'إضافة عرض جديد'}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">اسم المنتج وتنسيقه</label>
                    <div className="border border-stone-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                      <div className="bg-stone-50 px-3 py-2 border-b border-stone-100 flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isBold: !formData.isBold})}
                          className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${formData.isBold ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:text-stone-600 hover:bg-white'}`}
                          title="عريض (Bold)"
                        >
                          <Bold size={16} />
                          <span className="hidden sm:inline">عريض</span>
                        </button>
                        <div className="w-px h-4 bg-stone-200 mx-1" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isItalic: !formData.isItalic})}
                          className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${formData.isItalic ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:text-stone-600 hover:bg-white'}`}
                          title="مائل (Italic)"
                        >
                          <Italic size={16} />
                          <span className="hidden sm:inline">مائل</span>
                        </button>
                        <div className="w-px h-4 bg-stone-200 mx-1" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isUnderline: !formData.isUnderline})}
                          className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${formData.isUnderline ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:text-stone-600 hover:bg-white'}`}
                          title="تحته خط (Underline)"
                        >
                          <Underline size={16} />
                          <span className="hidden sm:inline">تحته خط</span>
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-4 bg-white outline-none transition-all text-xl font-display ${formData.isBold ? 'font-black' : 'font-normal'} ${formData.isItalic ? 'italic' : ''} ${formData.isUnderline ? 'underline underline-offset-4' : ''}`}
                        placeholder="أدخل اسم المنتج هنا..."
                        autoFocus
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-stone-400 font-medium">سيظهر الاسم بهذا التنسيق تماماً على الملصق المطبوع</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">السعر القديم</label>
                      <input 
                        type="number" 
                        value={formData.oldPrice}
                        onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">السعر الجديد</label>
                      <input 
                        type="number" 
                        value={formData.newPrice}
                        onChange={e => setFormData({...formData, newPrice: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">وحدة القياس</label>
                      <div className="space-y-2">
                        <select 
                          value={isCustomUnit ? 'أخرى' : formData.unit}
                          onChange={e => {
                            if (e.target.value === 'أخرى') {
                              setIsCustomUnit(true);
                              setFormData({...formData, unit: ''});
                            } else {
                              setIsCustomUnit(false);
                              setFormData({...formData, unit: e.target.value});
                            }
                          }}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        >
                          <option value="قطعة">قطعة</option>
                          <option value="كجم">كجم</option>
                          <option value="لتر">لتر</option>
                          <option value="علبة">علبة</option>
                          <option value="كيس">كيس</option>
                          <option value="كرتونة">كرتونة</option>
                          <option value="أخرى">أخرى (كتابة يدوية)</option>
                        </select>
                        {isCustomUnit && (
                          <input 
                            type="text"
                            value={formData.unit}
                            onChange={e => setFormData({...formData, unit: e.target.value})}
                            placeholder="اكتب الوحدة هنا..."
                            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            autoFocus
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">الكمية لكل عميل (اختياري)</label>
                      <input 
                        type="text" 
                        value={formData.limit}
                        onChange={e => setFormData({...formData, limit: e.target.value})}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="مثال: 2 قطعة"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">تاريخ انتهاء العرض (اختياري)</label>
                    <div className="space-y-2">
                      <input 
                        type="date" 
                        value={formData.expiryDate}
                        onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 1);
                            date.setDate(0);
                            setFormData({...formData, expiryDate: date.toISOString().split('T')[0]});
                          }}
                          className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded hover:bg-stone-200 transition-colors"
                        >
                          نهاية الشهر الحالي
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 2);
                            date.setDate(0);
                            setFormData({...formData, expiryDate: date.toISOString().split('T')[0]});
                          }}
                          className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded hover:bg-stone-200 transition-colors"
                        >
                          نهاية الشهر القادم
                        </button>
                        {formData.expiryDate && (
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, expiryDate: ''})}
                            className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          >
                            مسح التاريخ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white flex gap-3">
                  <button 
                    onClick={handleAddProduct}
                    className="flex-1 bg-[#52733B] text-white py-2 rounded-lg font-bold hover:bg-[#3E572D] transition-colors"
                  >
                    حفظ المنتج
                  </button>
                  {editingId && (
                    <button 
                      onClick={() => setDeleteConfirmId(editingId)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      حذف
                    </button>
                  )}
                  <button 
                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                    className="flex-1 bg-white border border-stone-200 text-stone-600 py-2 rounded-lg font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronRight size={18} />
                    رجوع
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bulk Import Modal */}
        <AnimatePresence>
          {isBulkAdding && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsBulkAdding(false)}
                      className="flex items-center gap-2 text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-100 rounded-lg transition-all"
                    >
                      <ChevronRight size={24} />
                      <span className="font-bold">رجوع</span>
                    </button>
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                      <FileUp size={20} />
                    </div>
                    <h2 className="text-xl font-bold">استيراد من ملف Excel</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-white border border-stone-200 rounded-xl p-4 text-sm text-stone-600">
                    <p className="font-bold mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500" />
                      تنسيق الملف المتوقع:
                    </p>
                    <p className="text-xs text-stone-500 mb-3">يجب أن يحتوي الملف على الأعمدة التالية بالترتيب:</p>
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 font-mono text-[10px] md:text-xs overflow-x-auto whitespace-nowrap mb-3" dir="ltr">
                      الاسم, السعر القديم, السعر الجديد, الوحدة, الحد الأقصى, التاريخ
                    </div>
                    <p className="text-xs text-stone-400 italic">مثال: أرز بسمتي, 50, 45, كجم, 2 قطعة, 20 مارس</p>
                  </div>
                  
                  <div 
                    onClick={() => bulkFileRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FileUp size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-stone-700 mb-1">اضغط لرفع ملف Excel أو CSV</p>
                    <p className="text-sm text-stone-400">سيتم استيراد البيانات فور اختيار الملف</p>
                    <input 
                      type="file" 
                      ref={bulkFileRef}
                      className="hidden" 
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const fileName = file.name.toLowerCase();
                          if (fileName.endsWith('.csv')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                handleBulkImport(event.target.result as string);
                              }
                            };
                            reader.readAsText(file);
                          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                            handleExcelImport(file);
                          }
                        }
                      }}
                    />
                  </div>

                  {importError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">فشل الاستيراد:</p>
                        <p>{importError}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
                  <button 
                    onClick={() => setIsBulkAdding(false)}
                    className="px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-100 transition-all shadow-sm flex items-center gap-2"
                  >
                    <ChevronRight size={18} />
                    رجوع
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Empty State - Hidden on Print */}
        {products.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200 print:hidden">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400 border border-stone-100">
              <Tag size={32} />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-1">لا توجد عروض مضافة</h3>
            <p className="text-stone-500 mb-6">ابدأ بإضافة منتجات لإنشاء ملصقات العروض</p>
            <button 
              onClick={() => {
                if (justBackFromPreview) {
                  setProducts([]);
                  setJustBackFromPreview(false);
                }
                setIsAdding(true);
              }}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              إضافة أول منتج
            </button>
          </div>
        )}

        {/* Product List / Labels Grid */}
        {isPreview ? (
          <div id="preview-container" className="flex flex-col items-center gap-8 print:gap-0">
            {/* Preview Controls */}
            <div className="sticky top-24 z-30 w-full max-w-4xl bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-lg print:hidden">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setIsPreview(false);
                    setJustBackFromPreview(true);
                  }}
                  className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-bold px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all"
                  title="الرجوع للرئيسية"
                >
                  <ChevronRight size={20} />
                  <span className="hidden sm:inline">رجوع</span>
                </button>
                <div className="h-6 w-px bg-stone-200 mx-1" />
                <button 
                  onClick={() => setCurrentPreviewPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPreviewPage === 0}
                  className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
                <span className="text-sm font-bold text-stone-600 font-mono">
                  صفحة {currentPreviewPage + 1} من {
                    printOptions.repeatFourTimes 
                      ? Math.ceil((products.length * 4) / (printOptions.labelsPerPage || 4))
                      : Math.ceil(products.length / (printOptions.labelsPerPage || 4))
                  }
                </span>
                <button 
                  onClick={() => setCurrentPreviewPage(prev => {
                    const totalPages = printOptions.repeatFourTimes 
                      ? Math.ceil((products.length * 4) / (printOptions.labelsPerPage || 4))
                      : Math.ceil(products.length / (printOptions.labelsPerPage || 4));
                    return Math.min(totalPages - 1, prev + 1);
                  })}
                  disabled={currentPreviewPage === (
                    (printOptions.repeatFourTimes 
                      ? Math.ceil((products.length * 4) / (printOptions.labelsPerPage || 4))
                      : Math.ceil(products.length / (printOptions.labelsPerPage || 4))) - 1
                  )}
                  className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
                <div className="flex items-center gap-2 text-stone-500">
                  <Ruler size={16} />
                  <span className="text-xs font-bold">الهوامش والمسافات:</span>
                </div>
                <span className="text-xs font-mono font-bold text-stone-800 bg-white px-2 py-1 rounded-md border border-stone-200">2 مم (ثابت)</span>
              </div>

              {printOptions.labelsPerPage === 4 && (
                <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors"
                  onClick={() => setPrintOptions({ ...printOptions, repeatFourTimes: !printOptions.repeatFourTimes })}
                >
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${printOptions.repeatFourTimes ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${printOptions.repeatFourTimes ? 'right-1' : 'right-6'}`} />
                  </div>
                  <span className="text-xs font-bold text-stone-600">تكرار المنتج 4 مرات</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsPreview(false);
                    setJustBackFromPreview(true);
                  }}
                  className="px-4 py-2 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronRight size={18} />
                  رجوع
                </button>
                <button 
                  onClick={() => setShowPrintConfirm(true)}
                  className="flex items-center gap-2 bg-stone-800 text-white px-6 py-2 rounded-xl hover:bg-stone-900 transition-all shadow-md font-bold"
                >
                  <Printer size={20} />
                  <span>طباعة الآن</span>
                </button>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
            >
              <div className="flex justify-start mb-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold transition-colors"
                >
                  <ChevronRight size={20} />
                  <span>رجوع</span>
                </button>
              </div>
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">تأكيد الحذف</h3>
              <p className="text-stone-500 mb-8 font-medium">
                {deleteConfirmId === 'all' 
                  ? 'هل أنت متأكد من حذف جميع العروض؟ لا يمكن التراجع عن هذا الإجراء.' 
                  : 'هل أنت متأكد من حذف هذا المنتج؟'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 px-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirmId === 'all') {
                      setProducts([]);
                    } else {
                      handleDelete(deleteConfirmId);
                      if (editingId === deleteConfirmId) {
                        setIsAdding(false);
                        setEditingId(null);
                      }
                    }
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Confirmation Modal */}
            <AnimatePresence>
              {showPrintConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPrintConfirm(false)}
                    className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200"
                  >
                    <div className="p-8">
                      <div className="flex justify-start mb-4">
                        <button 
                          onClick={() => setShowPrintConfirm(false)}
                          className="flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold transition-colors"
                        >
                          <ChevronRight size={20} />
                          <span>رجوع</span>
                        </button>
                      </div>
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <Printer size={32} />
                      </div>
                      
                      <h3 className="text-2xl font-black text-stone-800 text-center mb-2">تأكيد أمر الطباعة</h3>
                      <p className="text-stone-500 text-center mb-8">يرجى التأكد من مراجعة الإعدادات التالية قبل البدء</p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-stone-500 font-bold">عدد المنتجات</span>
                          <span className="text-stone-800 font-black">{products.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-stone-500 font-bold">إجمالي الصفحات</span>
                          <span className="text-stone-800 font-black">
                            {printOptions.layout === 'mixed' 
                              ? products.length 
                              : Math.ceil(products.length / (printOptions.labelsPerPage || 4))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-stone-500 font-bold">اتجاه الورقة</span>
                          <span className="text-stone-800 font-black">
                            {printOptions.orientation === 'portrait' ? 'رأسي (Portrait)' : 'أفقي (Landscape)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-stone-500 font-bold">ملصقات لكل صفحة</span>
                          <span className="text-stone-800 font-black">{printOptions.labelsPerPage} ملصق</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-stone-500 font-bold">الهوامش الحالية</span>
                          <span className="text-stone-800 font-black">{printOptions.margin} ملم</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowPrintConfirm(false)}
                          className="flex-1 py-4 text-stone-600 font-black hover:bg-stone-100 rounded-2xl transition-colors"
                        >
                          إلغاء
                        </button>
                        <button 
                          onClick={() => {
                            setShowPrintConfirm(false);
                            setTimeout(() => executePrint(), 300);
                          }}
                          className="flex-1 py-4 bg-stone-800 text-white font-black rounded-2xl hover:bg-stone-900 transition-all shadow-lg shadow-stone-200"
                        >
                          تأكيد وطباعة
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {(() => {
              if (printOptions.layout === 'mixed') {
                return products.map((product, pageIdx) => (
                  <div 
                    key={pageIdx}
                    className={`bg-white shadow-2xl print:shadow-none overflow-hidden relative border border-stone-200 print:border-0 ${
                      pageIdx === currentPreviewPage ? 'block' : 'hidden print:block'
                    } ${
                      printOptions.orientation === 'portrait' ? 'w-[210mm] h-[297mm]' : 'w-[297mm] h-[210mm]'
                    }`}
                    style={{
                      transform: windowWidth < (printOptions.orientation === 'portrait' ? 850 : 1200) && pageIdx === currentPreviewPage ? `scale(${Math.min(0.95, (windowWidth - 48) / (printOptions.orientation === 'portrait' ? 794 : 1123))})` : 'none',
                      transformOrigin: 'top center',
                      marginBottom: windowWidth < (printOptions.orientation === 'portrait' ? 850 : 1200) && pageIdx === currentPreviewPage ? `-${(1 - Math.min(0.95, (windowWidth - 48) / (printOptions.orientation === 'portrait' ? 794 : 1123))) * (printOptions.orientation === 'portrait' ? 1123 : 794)}px` : '0'
                    }}
                  >
                    <div 
                      className="h-full flex flex-col gap-6"
                      style={{ padding: `${printOptions.margin}mm` }}
                    >
                      {/* Top Large Label */}
                      <div className="h-[50%]">
                        {renderLabel(product, 'large')}
                      </div>
                      {/* Bottom 4 Small Labels */}
                      <div className="h-[50%] grid grid-cols-2 grid-rows-2 gap-6">
                        {renderLabel(product, 'small')}
                        {renderLabel(product, 'small')}
                        {renderLabel(product, 'small')}
                        {renderLabel(product, 'small')}
                      </div>
                    </div>
                  </div>
                ));
              }

              const itemsPerPage = printOptions.labelsPerPage || 4;
              const displayProducts = printOptions.repeatFourTimes 
                ? products.flatMap(p => Array(4).fill(p))
                : products;
                
              const pages = [];
              for (let i = 0; i < displayProducts.length; i += itemsPerPage) {
                pages.push(displayProducts.slice(i, i + itemsPerPage));
              }
              
              return pages.map((pageProducts, pageIdx) => (
                <div 
                  key={pageIdx}
                  className={`bg-white shadow-2xl print:shadow-none overflow-hidden relative border border-stone-200 print:border-0 ${
                    pageIdx === currentPreviewPage ? 'block' : 'hidden print:block'
                  } ${
                    printOptions.orientation === 'portrait' ? 'w-[210mm] h-[297mm]' : 'w-[297mm] h-[210mm]'
                  }`}
                  style={{
                    transform: windowWidth < (printOptions.orientation === 'portrait' ? 850 : 1200) && pageIdx === currentPreviewPage ? `scale(${Math.min(0.95, (windowWidth - 48) / (printOptions.orientation === 'portrait' ? 794 : 1123))})` : 'none',
                    transformOrigin: 'top center',
                    marginBottom: windowWidth < (printOptions.orientation === 'portrait' ? 850 : 1200) && pageIdx === currentPreviewPage ? `-${(1 - Math.min(0.95, (windowWidth - 48) / (printOptions.orientation === 'portrait' ? 794 : 1123))) * (printOptions.orientation === 'portrait' ? 1123 : 794)}px` : '0'
                  }}
                >
                  <div 
                    className="h-full grid"
                    style={{
                      padding: `${printOptions.margin}mm`,
                      gap: `${printOptions.gap}mm`,
                      gridTemplateColumns: `repeat(${printOptions.columns}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${Math.ceil(itemsPerPage / printOptions.columns)}, 1fr)`
                    }}
                  >
                    {pageProducts.map(product => renderLabel(product))}
                  </div>
                  {/* Page Number for Preview */}
                  <div className="absolute bottom-4 right-4 text-stone-400 text-xs font-mono print:hidden">
                    Page {pageIdx + 1} of {pages.length}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div 
            id="labels-grid" 
            className="grid"
            style={{
              gap: `${printOptions.gap}mm`,
              gridTemplateColumns: window.innerWidth > 768 
                ? `repeat(${printOptions.columns}, minmax(0, 1fr))` 
                : 'repeat(1, minmax(0, 1fr))'
            }}
          >
            {products.map((product) => renderLabel(product))}
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
