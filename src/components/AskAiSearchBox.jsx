import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBuilding } from '../context/BuildingContext';

export default function AskAiSearchBox({
  value = '',
  onChange,
  onSubmit,
  placeholder = "Ask AI or search...",
  context = 'general', // 'global' | 'dashboard' | 'tenants' | 'rooms' | 'rent' | 'electricity' | 'expenses'
  className = '',
  size = 'default', // 'sm' | 'default' | 'lg'
  showButton = true,
  autoFocus = false,
}) {
  const navigate = useNavigate();
  const { selectedHostel } = useBuilding() || {};
  const [internalQuery, setInternalQuery] = useState(value);
  const [aiReply, setAiReply] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  // Sync internal state if external value changes
  useEffect(() => {
    setInternalQuery(value);
  }, [value]);

  // Close AI reply popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAiReply(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onChange) {
      onChange(val);
    }
  };

  const handleClear = () => {
    setInternalQuery('');
    setAiReply(null);
    if (onChange) {
      onChange('');
    }
  };

  const handleExecute = (e) => {
    if (e) e.preventDefault();
    const query = (internalQuery || '').trim();
    if (!query) return;

    // If caller provided an onSubmit handler, call it
    if (onSubmit) {
      onSubmit(query);
    }

    const lower = query.toLowerCase();

    // Smart Natural Language AI intent routing & insights
    if (lower.includes('vacant') || lower.includes('empty') || lower.includes('available bed') || lower.includes('free bed') || lower.includes('room')) {
      if (context !== 'rooms') {
        setAiReply({
          title: 'Room & Bed Inventory',
          message: `Inspecting vacant bed allocations in ${selectedHostel?.name || 'current property'}...`,
          actionLabel: 'View Rooms & Beds',
          action: () => navigate('/rooms')
        });
      }
    } else if (lower.includes('pending') || lower.includes('due') || lower.includes('rent') || lower.includes('unpaid') || lower.includes('money')) {
      if (context !== 'rent') {
        setAiReply({
          title: 'Rent & Collections',
          message: 'Reviewing active billing cycles, pending dues, and invoices...',
          actionLabel: 'Go to Rent Collection',
          action: () => navigate('/rent')
        });
      }
    } else if (lower.includes('electricity') || lower.includes('meter') || lower.includes('power') || lower.includes('unit')) {
      if (context !== 'electricity') {
        setAiReply({
          title: 'Electricity Meters',
          message: 'Opening submeter calculations and monthly tariff readings...',
          actionLabel: 'Open Electricity',
          action: () => navigate('/electricity')
        });
      }
    } else if (lower.includes('add tenant') || lower.includes('new tenant') || lower.includes('enroll') || lower.includes('register resident')) {
      setAiReply({
        title: 'Resident Enrollment',
        message: 'Launching rapid 3-step resident onboarding wizard...',
        actionLabel: 'Add Resident',
        action: () => navigate('/tenants/add')
      });
    } else if (lower.includes('expense') || lower.includes('bill') || lower.includes('cost') || lower.includes('repair')) {
      if (context !== 'expenses') {
        setAiReply({
          title: 'Operational Expenses',
          message: 'Tracking maintenance bills, vendor invoices, and property costs...',
          actionLabel: 'View Expenses',
          action: () => navigate('/expenses')
        });
      }
    } else if (lower.includes('report') || lower.includes('revenue') || lower.includes('profit') || lower.includes('p&l') || lower.includes('summary')) {
      if (context !== 'reports') {
        setAiReply({
          title: 'Financial Reports',
          message: 'Compiling financial summaries, collection rates, and expense ratios...',
          actionLabel: 'View Reports',
          action: () => navigate('/reports')
        });
      }
    } else if (lower.includes('staff') || lower.includes('employee') || lower.includes('role') || lower.includes('permission')) {
      if (context !== 'staff') {
        setAiReply({
          title: 'Staff Management',
          message: 'Opening team roles and granular access permissions...',
          actionLabel: 'Manage Staff',
          action: () => navigate('/staff')
        });
      }
    } else if (context === 'global') {
      // In the global top bar, standard search queries route directly to tenants directory
      navigate(`/tenants?search=${encodeURIComponent(query)}`);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleExecute}
        className={`group relative flex items-center bg-card border rounded-xl shadow-sm transition-all duration-200 ${
          isFocused
            ? 'border-primary/60 ring-2 ring-primary/20 shadow-md'
            : 'border-border/80 hover:border-border'
        } ${isSmall ? 'h-8 px-2.5 py-1 text-xs' : 'h-9 px-3 py-1.5 text-xs sm:text-sm'}`}
      >
        {/* Ask AI Sparkles Icon Pill */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <div className={`rounded-lg bg-primary/10 text-primary flex items-center justify-center ${isSmall ? 'h-5 w-5' : 'h-5 w-5'}`}>
            <Sparkles className={`${isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5'} animate-pulse`} />
          </div>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={internalQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground focus:ring-0 min-w-0 font-normal"
        />

        {/* Clear Button */}
        {internalQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors mr-1 shrink-0"
            title="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Ask / Search Button */}
        {showButton && (
          <Button
            type="submit"
            size="sm"
            className={`rounded-lg font-semibold gap-1 shrink-0 ml-1 transition-all ${
              isSmall ? 'h-6 px-2 text-[10px]' : 'h-7 px-2.5 text-xs'
            }`}
          >
            <span>Ask</span>
            <Send className="h-2.5 w-2.5" />
          </Button>
        )}
      </form>

      {/* AI Assistant Insight Popover */}
      {aiReply && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-popover text-popover-foreground border border-border/80 p-3.5 rounded-xl shadow-xl animate-in slide-in-from-top-1 text-xs">
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-border/50">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant • {aiReply.title}</span>
            </div>
            <button
              onClick={() => setAiReply(null)}
              className="text-muted-foreground hover:text-foreground text-xs p-0.5 rounded-md hover:bg-muted"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-foreground/90 leading-relaxed font-medium">
            {aiReply.message}
          </p>
          {aiReply.action && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  aiReply.action();
                  setAiReply(null);
                }}
                className="h-7 px-3 text-xs gap-1 font-semibold"
              >
                <span>{aiReply.actionLabel || 'Proceed'}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
