import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MockPaymentQR from '../components/MockPaymentQR';
import {
  Crown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Info,
  X
} from 'lucide-react';

const Subscription = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState(null); // 'bronze' | 'silver' | 'gold'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const errorBannerRef = useRef(null);
  
  // Mock Payment Flow Modal State
  const [mockModalData, setMockModalData] = useState(null); // { order, planName, price }
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [confirmStep, setConfirmStep] = useState(false);
  const [submittingMock, setSubmittingMock] = useState(false);
  const [successAnimationState, setSuccessAnimationState] = useState(null); // { planName, limitText }

  // Auto-dismiss alerts after 8 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Lock body scroll when mock payment modal is open
  useEffect(() => {
    if (mockModalData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mockModalData]);

  // Load Razorpay Script dynamically (ready for when MOCK_PAYMENTS is turned off)
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch Current Subscription Status
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/current');
      setSubData(res.data);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setErrorMsg('Failed to load subscription status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Handle Plan Upgrade Click
  const handleUpgradeClick = async (planKey) => {
    setErrorMsg('');
    setSuccessMsg('');
    setUpgradingPlan(planKey);

    try {
      // 1. Create Order via backend API
      const res = await api.post('/subscriptions/create-order', { planName: planKey });
      const { order, keyId, planName, price, mockMode } = res.data;

      // 2. Open Mock Payment Modal if mock mode is active (or placeholder keys)
      if (mockMode || order.mock || keyId === 'rzp_test_mock') {
        setMockModalData({ order, planName, price });
        setUtrNumber('');
        setPaymentMethod('UPI');
        setConfirmStep(false);
        setSuccessAnimationState(null);
        setUpgradingPlan(null);
        return;
      }

      // 3. Real Razorpay Checkout Flow (when live test keys are configured)
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'InternConnect',
        description: `Upgrade to ${planName.toUpperCase()} Subscription Plan`,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response) {
          try {
            setUpgradingPlan(planKey);
            const verifyRes = await api.post('/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: planKey
            });
            setSuccessMsg(verifyRes.data.message || 'Subscription upgraded successfully!');
            fetchSubscription();
          } catch (vErr) {
            const vMsg = vErr.response?.data?.message || 'Payment verification failed.';
            setErrorMsg(vMsg);
          } finally {
            setUpgradingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setUpgradingPlan(null);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setErrorMsg('Razorpay Checkout SDK failed to load. Please refresh and try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payments are only allowed between 10:00 AM and 11:00 AM IST. Please try again during this window.';
      setErrorMsg(msg);
      // Smooth scroll into view of plan error banner if needed
      if (errorBannerRef.current) {
        errorBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      setUpgradingPlan(null);
    }
  };

  // Submit Mock Payment Confirmation with Processing & Zomato/Swiggy-style Success Animation
  const handleConfirmMockPayment = async () => {
    if (!mockModalData) return;
    const { order, planName } = mockModalData;
    setSubmittingMock(true);

    try {
      const transactionId = utrNumber.trim() || `mock_utr_${Date.now()}`;
      
      // Minimum 800ms processing state for smooth user feedback
      const [verifyRes] = await Promise.all([
        api.post('/subscriptions/verify-payment', {
          razorpay_order_id: order.id,
          razorpay_payment_id: `${paymentMethod}_${transactionId}`,
          razorpay_signature: 'mock_signature_valid',
          planName
        }),
        new Promise(resolve => setTimeout(resolve, 850))
      ]);

      // Calculate feature unlock text
      let limitText = '3 applications/month unlocked';
      if (planName === 'silver') limitText = '5 applications/month unlocked';
      if (planName === 'gold') limitText = 'Unlimited applications unlocked';

      setSubmittingMock(false);
      setSuccessAnimationState({
        planName: planName.toUpperCase(),
        limitText
      });

      // Auto close modal after ~2.2s celebration animation and refresh subscription page state
      setTimeout(() => {
        setMockModalData(null);
        setSuccessAnimationState(null);
        setSuccessMsg(verifyRes.data.message || 'Subscription upgraded successfully!');
        fetchSubscription();
      }, 2300);

    } catch (err) {
      setSubmittingMock(false);
      setErrorMsg(err.response?.data?.message || 'Mock payment verification failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sky-600 font-bold">
          <div className="h-6 w-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const currentSub = subData?.subscription || {};
  const currentPlanKey = currentSub.planName || 'free';
  const plansObj = subData?.plans || {};
  const isWindowActive = subData?.isWindowActive ?? false;

  const used = currentSub.applicationsUsedThisMonth || 0;
  const currentPlanInfo = plansObj[currentPlanKey] || plansObj.free;
  const limit = currentPlanInfo.limit;
  const isUnlimited = limit === Infinity || limit > 999;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Viewport-Fixed Floating Alerts (Always visible regardless of scroll position) */}
      {(errorMsg || successMsg) && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fade-in pointer-events-auto">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-600/95 dark:bg-rose-950/95 backdrop-blur-md border border-rose-400 dark:border-rose-700 text-white shadow-2xl flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-white/20 text-white shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-100">Subscription Policy Notice</h4>
                <p className="text-xs font-semibold text-white mt-0.5 leading-snug">{errorMsg}</p>
              </div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-600/95 dark:bg-emerald-950/95 backdrop-blur-md border border-emerald-400 dark:border-emerald-700 text-white shadow-2xl flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-white/20 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-100">Success</h4>
                <p className="text-xs font-semibold text-white mt-0.5 leading-snug">{successMsg}</p>
              </div>
              <button
                onClick={() => setSuccessMsg('')}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PART 1: Custom Mock Payment Dialog / Modal */}
      {mockModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-500/30 shadow-2xl space-y-5 relative max-h-[85vh] overflow-y-auto">
            
            {/* STATE 1: Processing / Loading State */}
            {submittingMock ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="h-14 w-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{t('subscription.modalConfirming')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t('subscription.modalActivating')}</p>
                </div>
              </div>
            ) : successAnimationState ? (
              
              /* STATE 2: Celebratory Zomato/Swiggy-Style Success Animation */
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                
                {/* Pop Checkmark Container with Radiating Outer Rings */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-24 w-24 rounded-full border-2 border-emerald-500/40 animate-ring-expand" />
                  <div className="absolute h-32 w-32 rounded-full border border-teal-400/30 animate-ring-expand" style={{ animationDelay: '0.3s' }} />

                  {/* Pop & Scale-Bounce Icon */}
                  <div className="h-20 w-20 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-success-pop z-10">
                    <CheckCircle2 className="h-10 w-10 text-white stroke-[2.5]" />
                  </div>
                </div>

                {/* Slide & Fade-Up Text */}
                <div className="animate-slide-up-fade space-y-1.5 z-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('subscription.modalSuccessTitle')}
                  </h3>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {t('subscription.modalSuccessSubtitle', { planName: successAnimationState.planName })}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
                      ✨ {successAnimationState.limitText}
                    </span>
                  </div>
                </div>
              </div>

            ) : (
              
              /* STATE 3: Standard Mock Payment Form & Confirmation Step */
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-2xl">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t('subscription.modalUpgradeTitle', { planName: mockModalData.planName })}
                      </h3>
                      <p className="text-xs text-slate-400">{t('subscription.modalTempPortal')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMockModalData(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Plain English Notice Box */}
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    {t('subscription.modalNotice')}
                  </p>
                </div>

                {/* Order Details Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('subscription.modalSelectedPlan')}</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{t('subscription.planTitle', { name: mockModalData.planName })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('subscription.modalAmountDue')}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{mockModalData.price}</span>
                  </div>
                </div>

                {/* Step 1: Fake Payment Proof Form */}
                {!confirmStep ? (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('subscription.modalPaymentMethod')}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                        <option value="Card">Credit / Debit Card</option>
                        <option value="NetBanking">Net Banking</option>
                      </select>
                    </div>

                    {paymentMethod === 'UPI' && (
                      <MockPaymentQR />
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('subscription.modalUtrLabel')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('subscription.modalUtrPlaceholder')}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{t('subscription.modalUtrHelp')}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setConfirmStep(true)}
                        className="flex-1 btn-animate bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 text-xs rounded-xl shadow cursor-pointer"
                      >
                        {t('subscription.modalProceed')}
                      </button>
                      <button
                        onClick={() => setMockModalData(null)}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {t('subscription.modalCancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Confirmation Step */
                  <div className="space-y-4 pt-1">
                    <div className="bg-sky-50 dark:bg-sky-950/60 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 text-center space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t('subscription.modalConfirmQuestion', { price: mockModalData.price })}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t('subscription.modalRefInfo', { method: paymentMethod, utr: utrNumber || 'Auto-generated' })}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmMockPayment}
                        className="flex-1 btn-animate bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 text-xs rounded-xl shadow cursor-pointer"
                      >
                        {t('subscription.modalYesPaid')}
                      </button>
                      <button
                        onClick={() => setConfirmStep(false)}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {t('subscription.modalBack')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3">
                <Crown className="h-4 w-4" /> {t('subscription.suiteBadge')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('subscription.title')}
              </h1>
              <p className="text-sky-100 text-sm mt-1 max-w-xl">
                {t('subscription.subtitle')}
              </p>
            </div>

            {/* Time Window Rules Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2 max-w-xs">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Clock className="h-4 w-4 text-amber-300" />
                <span>{t('subscription.policyTitle')}</span>
              </div>
              <p className="text-[11px] text-sky-100 leading-normal">
                {t('subscription.policyDesc')}
              </p>
              <div className="pt-1">
                {isWindowActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {t('subscription.windowOpen')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {t('subscription.windowClosed')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Active Plan Usage Dashboard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('subscription.currentActivePlan')}</span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                  {t('subscription.planTitle', { name: currentPlanInfo.name })}
                </h2>
                <span className="bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-sky-200 dark:border-sky-800">
                  {currentSub.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-medium">{t('subscription.cycleStartDate')}</span>
              <span className="text-xs font-bold text-slate-880 dark:text-slate-200">
                {new Date(currentSub.cycleStartDate || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Applications Usage Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-sky-600" /> {t('subscription.monthlyAllowance')}
              </span>
              <span className="text-slate-900 dark:text-white">
                {isUnlimited ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{t('subscription.unlimitedGold', { used })}</span>
                ) : (
                  <span>{t('subscription.usedOfLimit', { used, limit })}</span>
                )}
              </span>
            </div>

            {!isUnlimited && (
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    used >= limit ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-500 to-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                />
              </div>
            )}

            <p className="text-xs text-slate-400 pt-1">
              {t('subscription.resetNotice')}
            </p>
          </div>
        </div>

        {/* 4 Plan Cards Grid */}
        <div ref={errorBannerRef} className="space-y-4 scroll-mt-24">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('subscription.availablePlansHeading')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('subscription.availablePlansSubtitle')}</p>
          </div>

          {/* Targeted Error Banner right above the Plan Cards */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-start justify-between gap-3 shadow-md animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-rose-800 dark:text-rose-300">Upgrade Request Blocked</span>
                  <span className="font-medium">{errorMsg}</span>
                </div>
              </div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-1 rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Free Plan */}
            <div className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border flex flex-col justify-between space-y-6 transition ${
              currentPlanKey === 'free'
                ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free</span>
                  {currentPlanKey === 'free' && (
                    <span className="text-[10px] font-extrabold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full">
                      {t('subscription.current')}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹0</div>
                  <div className="text-xs text-slate-400 font-medium">{t('subscription.perMonth')}</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.freeLimit')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.freeFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0" />
                    <span>{t('subscription.freeFeature3')}</span>
                  </li>
                </ul>
              </div>

              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed"
              >
                {currentPlanKey === 'free' ? t('subscription.activePlan') : t('subscription.basicTier')}
              </button>
            </div>

            {/* 2. Bronze Plan */}
            <div className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border flex flex-col justify-between space-y-6 transition ${
              currentPlanKey === 'bronze'
                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Bronze</span>
                  {currentPlanKey === 'bronze' && (
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {t('subscription.current')}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹100</div>
                  <div className="text-xs text-slate-400 font-medium">{t('subscription.perMonth')}</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.bronzeLimit')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.bronzeFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.bronzeFeature3')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleUpgradeClick('bronze')}
                  disabled={currentPlanKey === 'bronze' || upgradingPlan === 'bronze'}
                  className="w-full btn-animate py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {upgradingPlan === 'bronze' ? (
                    t('subscription.processing')
                  ) : currentPlanKey === 'bronze' ? (
                    t('subscription.activePlan')
                  ) : (
                    <>{t('subscription.upgradeToBronze')} <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
                {!isWindowActive && currentPlanKey !== 'bronze' && (
                  <p className="text-[10px] text-center text-amber-600 dark:text-amber-400 font-semibold pt-1.5 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" /> Payments open 10:00–11:00 AM IST
                  </p>
                )}
              </div>
            </div>

            {/* 3. Silver Plan */}
            <div className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border flex flex-col justify-between space-y-6 transition ${
              currentPlanKey === 'silver'
                ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-400'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Silver</span>
                  {currentPlanKey === 'silver' && (
                    <span className="text-[10px] font-extrabold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full">
                      {t('subscription.current')}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹300</div>
                  <div className="text-xs text-slate-400 font-medium">{t('subscription.perMonth')}</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.silverLimit')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.silverFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t('subscription.silverFeature3')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleUpgradeClick('silver')}
                  disabled={currentPlanKey === 'silver' || upgradingPlan === 'silver'}
                  className="w-full btn-animate py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {upgradingPlan === 'silver' ? (
                    t('subscription.processing')
                  ) : currentPlanKey === 'silver' ? (
                    t('subscription.activePlan')
                  ) : (
                    <>{t('subscription.upgradeToSilver')} <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
                {!isWindowActive && currentPlanKey !== 'silver' && (
                  <p className="text-[10px] text-center text-sky-600 dark:text-sky-400 font-semibold pt-1.5 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" /> Payments open 10:00–11:00 AM IST
                  </p>
                )}
              </div>
            </div>

            {/* 4. Gold Plan */}
            <div className={`relative rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-indigo-950 text-white border flex flex-col justify-between space-y-6 shadow-xl ${
              currentPlanKey === 'gold'
                ? 'border-yellow-400 ring-2 ring-yellow-400/30'
                : 'border-indigo-800'
            }`}>
              <div className="absolute top-3 right-3 bg-yellow-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                {t('subscription.popular')}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="h-4 w-4" /> Gold
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">₹1000</div>
                  <div className="text-xs text-indigo-200 font-medium">{t('subscription.perMonth')}</div>
                </div>

                <ul className="space-y-2.5 text-xs text-indigo-100 pt-2 border-t border-indigo-800/80">
                  <li className="flex items-center gap-2 font-bold text-yellow-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>{t('subscription.goldLimit')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>{t('subscription.goldFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>{t('subscription.goldFeature3')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleUpgradeClick('gold')}
                  disabled={currentPlanKey === 'gold' || upgradingPlan === 'gold'}
                  className="w-full btn-animate py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {upgradingPlan === 'gold' ? (
                    t('subscription.processing')
                  ) : currentPlanKey === 'gold' ? (
                    t('subscription.activePlan')
                  ) : (
                    <>{t('subscription.upgradeToGold')} <Zap className="h-3.5 w-3.5 fill-current" /></>
                  )}
                </button>
                {!isWindowActive && currentPlanKey !== 'gold' && (
                  <p className="text-[10px] text-center text-amber-300 font-semibold pt-1.5 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" /> Payments open 10:00–11:00 AM IST
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
