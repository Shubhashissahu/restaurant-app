// src/pages/menu.jsx

import { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet";
import {
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Star,
  Filter,
  X,
  Eye,
  UtensilsCrossed,
  SearchX,
  FilterX,
  RotateCw,
  Sparkles,
  Clock,
  Flame,
  Check,
  ChefHat,
  Tag,
  CircleDot,
} from "lucide-react";
import api from "../services/api";
import { resolveDishImage, CATEGORY_FALLBACK_IMAGES, DEFAULT_FOOD_IMAGE } from "../utils/imageUtils";

// ── Category Normalizer ──────────────────────────────────────────────────────
function normalizeCategory(category = "", name = "") {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase().trim();

  if (
    n.includes("chai") ||
    n.includes("lassi") ||
    n.includes("tea") ||
    n.includes("shake") ||
    n.includes("coffee") ||
    n.includes("juice")
  ) {
    return "Drinks";
  }

  if (c === "mains" || c === "main course" || c === "main-course" || c === "maincourse") {
    return "Main Course";
  }
  if (c === "starters" || c === "starter" || c === "appetizers" || c === "appetizer") {
    return "Starters";
  }
  if (c === "drinks" || c === "drink" || c === "beverages" || c === "beverage") {
    return "Drinks";
  }
  if (c === "desserts" || c === "dessert" || c === "sweets" || c === "sweet") {
    return "Desserts";
  }
  if (c === "specials" || c === "special") {
    return "Specials";
  }
  return category || "General";
}

// ── Price Filters Configuration ──────────────────────────────────────────────
const PRICE_FILTERS = [
  { label: "All Prices", value: "all" },
  { label: "Below ₹100", value: "below100" },
  { label: "₹100–₹500", value: "range" },
  { label: "Above ₹500", value: "above500" },
];

const POPULAR_SEARCH_TAGS = ["Truffle", "Paneer", "Biryani", "Butter Chicken", "Pasta", "Gulab Jamun", "Lassi"];

// ── Deterministic Rating & Review Calculator ─────────────────────────────────
function getRating(id) {
  if (!id) return "4.8";
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (4.2 + (seed % 8) / 10).toFixed(1);
}

function getReviews(id) {
  if (!id) return 42;
  const seed = id ? id.charCodeAt(2) ?? 10 : 10;
  return 25 + (seed % 120);
}

// ── Dish Details Modal ───────────────────────────────────────────────────────
function DishDetailsModal({ item, ordered, onOrder, onClose }) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const normCategory = normalizeCategory(item.category, item.name);
  const photo = resolveDishImage(item.image || item.imageUrl, item.name, normCategory);
  const rating = getRating(item._id);
  const reviews = getReviews(item._id);
  const isAvailable = item.isAvailable !== false && item.status !== "Sold Out";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-pop-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#3A2E24] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details modal"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#141414]/80 backdrop-blur-md border border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373] flex items-center justify-center transition duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none"
        >
          <X size={18} />
        </button>

        {/* Modal Left Image */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[240px] bg-[#141414] overflow-hidden">
          <img
            src={photo}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const fallback =
                CATEGORY_FALLBACK_IMAGES[normCategory] ||
                CATEGORY_FALLBACK_IMAGES[item.category] ||
                DEFAULT_FOOD_IMAGE;
              if (e.target.src !== fallback) {
                e.target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent md:hidden" />

          {/* Category Pill */}
          <span className="absolute top-4 left-4 z-10 bg-[#141414]/90 backdrop-blur-md text-[#D4A373] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#3A2E24]">
            {normCategory}
          </span>
        </div>

        {/* Modal Right Content */}
        <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto">
          {/* Header & Status */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-[#D4A373] font-semibold">
              <Star size={14} className="fill-[#D4A373]" />
              <span className="text-[#FAF7F2] font-bold">{rating}</span>
              <span className="text-[#8B7E6A]">({reviews} reviews)</span>
            </div>

            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isAvailable
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {isAvailable ? "Available Today" : "Sold Out"}
            </span>
          </div>

          <h2 id="dish-modal-title" className="text-2xl font-bold text-[#FAF7F2] mb-3">
            {item.name}
          </h2>

          <p className="text-[#C2B59B] text-sm leading-relaxed mb-6">
            {item.description || "Artisanal preparation crafted with freshly sourced seasonal ingredients, prepared by our master chefs."}
          </p>

          {/* Quick Dish Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-[#141414] border border-[#3A2E24]/60">
            <div className="flex items-center gap-2 text-xs text-[#C2B59B]">
              <Clock size={15} className="text-[#D4A373]" />
              <span>Prep Time: 15–20m</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C2B59B]">
              <ChefHat size={15} className="text-[#D4A373]" />
              <span>Freshly Made</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C2B59B]">
              <Flame size={15} className="text-[#D4A373]" />
              <span>Culinary Special</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C2B59B]">
              <Tag size={15} className="text-[#D4A373]" />
              <span>Dine-in / Pickup</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="mt-auto pt-4 border-t border-[#3A2E24]/60 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8B7E6A] font-semibold">Price</p>
              <span className="text-[#D4A373] text-2xl font-extrabold">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </span>
            </div>

            {ordered ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#D4A373] text-sm font-semibold">
                <CheckCircle size={17} />
                Added to Order
              </div>
            ) : (
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  onOrder(item);
                  onClose();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none ${
                  isAvailable
                    ? "bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414] hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-[#2A2A2A] text-[#8B7E6A] cursor-not-allowed border border-[#3A2E24]"
                }`}
              >
                <ShoppingCart size={17} />
                {isAvailable ? "Add to Order" : "Unavailable"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Polished Dish Card Component ─────────────────────────────────────────────
function MenuCard({ item, ordered, onOrder, onViewDetails, index = 0 }) {
  const normCategory = normalizeCategory(item.category, item.name);
  const photo = resolveDishImage(item.image || item.imageUrl, item.name, normCategory);
  const rating = getRating(item._id);
  const reviews = getReviews(item._id);
  const isAvailable = item.isAvailable !== false && item.status !== "Sold Out";

  return (
    <article
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
      className="group relative bg-[#1A1A1A] border border-[#3A2E24] rounded-[24px] overflow-hidden shadow-xl hover:-translate-y-2 hover:border-[#D4A373]/50 hover:shadow-[0_16px_36px_rgba(212,163,115,0.12)] transition-all duration-300 flex flex-col animate-slide-up"
    >
      {/* Subtle Gold Ambient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/5 via-transparent to-[#8B5E3C]/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none z-10" />

      {/* Top Edge Shine */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 z-10" />

      {/* 1. DISH IMAGE CONTAINER */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-[#141414]">
        <img
          src={photo}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const fallback =
              CATEGORY_FALLBACK_IMAGES[normCategory] ||
              CATEGORY_FALLBACK_IMAGES[item.category] ||
              DEFAULT_FOOD_IMAGE;
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />

        {/* Dark Bottom Vignette for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/20" />

        {/* 5. CATEGORY BADGE */}
        <div className="absolute top-3.5 left-3.5 z-20">
          <span className="bg-[#141414]/90 backdrop-blur-md text-[#D4A373] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#3A2E24] shadow-md">
            {normCategory}
          </span>
        </div>

        {/* 7. AVAILABILITY / STATUS BADGE */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <span
            aria-label={`Status: ${isAvailable ? "Available" : "Sold Out"}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-md ${
              isAvailable
                ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                : "bg-rose-950/80 text-rose-400 border-rose-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              }`}
            />
            {isAvailable ? "Available" : "Sold Out"}
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-20">
        {/* 4. RATING */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 text-xs text-[#C2B59B]"
            aria-label={`Rating: ${rating} out of 5 stars from ${reviews} reviews`}
          >
            <Star size={13} className="fill-[#D4A373] text-[#D4A373]" />
            <span className="font-bold text-[#FAF7F2]">{rating}</span>
            <span className="text-[#8B7E6A] text-[11px]">({reviews})</span>
          </div>

          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8B7E6A]">
            Fine Dining
          </span>
        </div>

        {/* 2. DISH NAME */}
        <h3
          title={item.name}
          className="font-bold text-[#FAF7F2] text-lg sm:text-xl leading-snug mb-2 line-clamp-1 group-hover:text-[#D4A373] transition-colors"
        >
          {item.name}
        </h3>

        {/* 6. SHORT DESCRIPTION */}
        <p className="text-[#C2B59B] text-xs sm:text-sm line-clamp-2 mb-5 flex-1 leading-relaxed">
          {item.description || "Artisanal preparation crafted with freshly sourced seasonal ingredients."}
        </p>

        {/* 3. PRICE & 8. ACTIONS */}
        <div className="pt-4 border-t border-[#3A2E24]/60 flex items-center justify-between gap-3 mt-auto">
          {/* Price */}
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-[#8B7E6A] leading-none mb-1">
              Price
            </p>
            <span className="text-[#D4A373] font-extrabold text-xl sm:text-2xl leading-none">
              ₹{Number(item.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2">
            {/* Action 1: View Details */}
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              aria-label={`View details for ${item.name}`}
              className="p-2.5 rounded-xl bg-[#252525] border border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/60 hover:bg-[#2F2F2F] active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none"
              title="Quick View Details"
            >
              <Eye size={17} />
            </button>

            {/* Action 2: Add / Order */}
            {ordered ? (
              <div
                role="status"
                aria-label={`${item.name} added to order`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D4A373]/10 border border-[#D4A373]/40 text-[#D4A373] text-xs font-bold"
              >
                <CheckCircle size={15} />
                <span>Added</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onOrder(item)}
                aria-label={
                  isAvailable
                    ? `Add ${item.name} to order`
                    : `${item.name} is currently sold out`
                }
                className={`relative px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none overflow-hidden ${
                  isAvailable
                    ? "bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414] hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-[#2A2A2A] text-[#8B7E6A] cursor-not-allowed border border-[#3A2E24]"
                }`}
              >
                <ShoppingCart size={15} />
                <span>{isAvailable ? "Order" : "Sold Out"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Gold Accent Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
    </article>
  );
}

// ── Polished State 1: Skeleton Loading Cards ─────────────────────────────────
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="bg-[#1A1A1A] rounded-[24px] overflow-hidden border border-[#3A2E24]/60 flex flex-col"
    >
      {/* Image Skeleton */}
      <div className="h-52 sm:h-56 bg-[#222222] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="absolute top-4 left-4 h-6 w-20 bg-[#2C2C2C] rounded-full" />
        <div className="absolute top-4 right-4 h-6 w-16 bg-[#2C2C2C] rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-3">
        {/* Rating row */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-[#252525] rounded-md" />
          <div className="h-3 w-14 bg-[#252525] rounded-md" />
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 bg-[#2A2A2A] rounded-md" />

        {/* Description */}
        <div className="space-y-2 py-1 flex-1">
          <div className="h-3.5 w-full bg-[#242424] rounded" />
          <div className="h-3.5 w-4/5 bg-[#242424] rounded" />
        </div>

        {/* Price & Actions Row */}
        <div className="pt-4 border-t border-[#3A2E24]/40 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-10 bg-[#252525] rounded" />
            <div className="h-6 w-16 bg-[#2C2C2C] rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-[#252525] rounded-xl" />
            <div className="h-9 w-20 bg-[#2C2C2C] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Polished State 2: No Dishes Found (Empty Menu Database) ───────────────────
function EmptyMenuState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto bg-[#1A1A1A]/60 border border-[#3A2E24] rounded-3xl backdrop-blur-md shadow-2xl animate-slide-up my-8">
      <div className="w-20 h-20 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373] mb-6 animate-pulse-glow">
        <UtensilsCrossed size={36} />
      </div>

      <h3 className="text-2xl font-bold text-[#FAF7F2] mb-2">No Menu Dishes Available</h3>
      <p className="text-[#C2B59B] text-sm leading-relaxed mb-6">
        Our culinary selections are currently being updated by our executive chef. Please check back shortly or refresh the menu catalogue.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-bold text-sm shadow-lg shadow-[#D4A373]/20 hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none cursor-pointer"
      >
        <RotateCw size={16} />
        <span>Refresh Menu</span>
      </button>
    </div>
  );
}

// ── Polished State 3: No Search Results ───────────────────────────────────────
function NoSearchResultsState({ query, onClearSearch, onSelectQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-xl mx-auto bg-[#1A1A1A]/80 border border-[#3A2E24] rounded-3xl backdrop-blur-md shadow-2xl animate-slide-up my-6">
      <div className="w-18 h-18 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373] mb-5">
        <SearchX size={34} />
      </div>

      <h3 className="text-2xl font-bold text-[#FAF7F2] mb-2">
        No dishes matching &ldquo;{query}&rdquo;
      </h3>
      <p className="text-[#C2B59B] text-sm leading-relaxed mb-6 max-w-md">
        We couldn&apos;t find any dishes or ingredients matching your search query. Check for typos or try one of our suggested culinary keywords.
      </p>

      {/* Clear Search Action */}
      <button
        type="button"
        onClick={onClearSearch}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-bold text-xs shadow-md transition-all duration-200 mb-6 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none"
      >
        <X size={14} />
        <span>Clear Search Query</span>
      </button>

      {/* Suggested Search Pills */}
      <div className="pt-4 border-t border-[#3A2E24]/60 w-full">
        <p className="text-xs text-[#8B7E6A] font-semibold uppercase tracking-wider mb-3">
          Popular Culinary Searches
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectQuery(tag)}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#252525] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373] border border-[#3A2E24] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Polished State 4: No Dishes in Selected Category ──────────────────────────
function NoCategoryDishesState({ category, activeFilter, onResetCategory, onResetPrice }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-xl mx-auto bg-[#1A1A1A]/80 border border-[#3A2E24] rounded-3xl backdrop-blur-md shadow-2xl animate-slide-up my-6">
      <div className="w-18 h-18 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373] mb-5">
        <FilterX size={34} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#D4A373] text-xs font-semibold mb-3">
        <Sparkles size={13} />
        <span>Category: {category}</span>
      </div>

      <h3 className="text-2xl font-bold text-[#FAF7F2] mb-2">
        No Dishes in &ldquo;{category}&rdquo;
      </h3>
      <p className="text-[#C2B59B] text-sm leading-relaxed mb-6 max-w-md">
        There are currently no items available in the <span className="text-[#FAF7F2] font-semibold">{category}</span> section
        {activeFilter !== "all" ? " under the selected price range" : ""}. Explore our full selection or reset the filters below.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetCategory}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-bold text-xs shadow-md transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none"
        >
          <UtensilsCrossed size={14} />
          <span>View All Categories</span>
        </button>

        {activeFilter !== "all" && (
          <button
            type="button"
            onClick={onResetPrice}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252525] hover:bg-[#303030] text-[#FAF7F2] font-semibold text-xs border border-[#3A2E24] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none"
          >
            <SlidersHorizontal size={14} />
            <span>Reset Price Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Menu Page ───────────────────────────────────────────────────────────
export default function Menu() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderMsg, setOrderMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderedItems, setOrderedItems] = useState([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Fetch Menu Items from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let queryParams = `?_t=${Date.now()}`;
      if (filter === "below100") queryParams += "&maxPrice=100";
      if (filter === "range") queryParams += "&minPrice=100&maxPrice=500";
      if (filter === "above500") queryParams += "&minPrice=500";

      const res = await api.get(`/menu${queryParams}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Unable to load menu. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamic list of categories present in loaded items
  const availableCategories = useMemo(() => {
    const defaultList = ["All", "Starters", "Main Course", "Desserts", "Drinks"];
    const fromItems = items.map((i) => normalizeCategory(i.category, i.name));
    const unique = Array.from(new Set([...defaultList, ...fromItems]))
      .filter((cat) => Boolean(cat) && cat !== "Appetizers");
    return unique;
  }, [items]);

  // Filter items by category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemNorm = normalizeCategory(item.category, item.name);
      let matchCategory = activeCategory === "All";

      if (!matchCategory) {
        if (activeCategory === "Main Course") {
          matchCategory = itemNorm === "Main Course";
        } else if (activeCategory === "Starters") {
          matchCategory = itemNorm === "Starters";
        } else if (activeCategory === "Drinks") {
          matchCategory = itemNorm === "Drinks";
        } else {
          matchCategory =
            itemNorm.toLowerCase() === activeCategory.toLowerCase() ||
            item.category?.toLowerCase() === activeCategory.toLowerCase();
        }
      }

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  // Sort items with fine-dining menu hierarchy
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    const order = {
      "Starters": 1,
      "Main Course": 2,
      "Drinks": 3,
      "Desserts": 4,
      "Specials": 5,
    };
    list.sort((a, b) => {
      const aRank = order[normalizeCategory(a.category, a.name)] || 99;
      const bRank = order[normalizeCategory(b.category, b.name)] || 99;
      if (aRank !== bRank) return aRank - bRank;
      return Number(a.price) - Number(b.price);
    });

    return list;
  }, [filteredItems]);

  // Order Handler
  const handleOrder = useCallback((item) => {
    setOrderedItems((prev) => (prev.includes(item._id) ? prev : [...prev, item._id]));
    setOrderMsg(`"${item.name}" has been added to your order.`);
    setTimeout(() => setOrderMsg(null), 3500);
  }, []);

  return (
    <>
      <Helmet>
        <title>Artisanal Culinary Menu | TasteHub Fine Dining</title>
        <meta
          name="description"
          content="Explore TasteHub's artisanal restaurant menu featuring luxury starters, main courses, handcrafted desserts, and signature beverages."
        />
      </Helmet>

      <div className="min-h-screen bg-[#141414] text-[#FAF7F2] pb-16">
        {/* HERO HEADER */}
        <div className="relative h-72 md:h-80 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt="TasteHub restaurant atmosphere"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-[#141414] flex flex-col items-center justify-center text-center px-6">
            <span className="text-[#D4A373] text-xs font-extrabold uppercase tracking-[0.25em] mb-2">
              Haute Cuisine &bull; Crafted Fresh
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#FAF7F2] mb-3 tracking-tight">
              Culinary Menu
            </h1>

            <p className="text-[#E5D3BE] text-sm md:text-base max-w-lg leading-relaxed">
              Discover our masterfully prepared selections, combining authentic culinary traditions with exquisite modern presentation.
            </p>

            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-[#D4A373] via-[#FAF7F2] to-[#8B5E3C] rounded-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* CONTROLS TOOLBAR */}
          <section
            aria-label="Menu filters and search controls"
            className="rounded-3xl bg-gradient-to-b from-[#1C1815] to-[#13100E] border border-[#44362A] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.7)] space-y-5 -mt-14 relative z-20 mb-10 overflow-hidden"
          >
            {/* Ambient Warm Glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#8B5E3C]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Row 1: Heading, Counter & Search */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#FAF7F2] tracking-tight">
                    Food Menu Items
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/40 font-bold inline-flex items-center gap-2 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A373] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A373]"></span>
                    </span>
                    {sortedItems.length} of {items.length} Dishes
                  </span>
                </div>
                <p className="text-xs text-[#C2B59B] mt-1 font-medium">
                  Explore our culinary dishes, filter by course, and select price ranges
                </p>
              </div>

              {/* Search Box - Kept as is */}
              <div className="relative w-full md:w-96 group">
                {/* Gold Highlighted Search Icon Badge */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#D4A373]/20 border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] group-focus-within:bg-[#D4A373] group-focus-within:text-[#141414] transition-all duration-300 pointer-events-none z-10 shadow-sm">
                  <Search size={16} className="transition-transform duration-300 group-focus-within:scale-110" />
                </div>

                <input
                  type="text"
                  placeholder="Search dishes, ingredients, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search dishes or ingredients"
                  className="w-full bg-[#141414] border-2 border-[#544336] hover:border-[#D4A373]/70 focus:border-[#D4A373] rounded-2xl pl-12 pr-10 py-3 text-sm text-[#FAF7F2] font-medium placeholder:text-[#C2B59B] focus:outline-none focus:ring-4 focus:ring-[#D4A373]/25 shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-300"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search input"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#2A2A2A] hover:bg-[#D4A373] hover:text-[#141414] text-[#FAF7F2] flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4A373] bg-[#D4A373]/10 border border-[#D4A373]/30 px-2 py-0.5 rounded-md">
                      Search
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Category Tabs & Price Slider */}
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-4 border-t border-[#3D3228]/80">
              {/* Category Filter Pills */}
              <div
                role="tablist"
                aria-label="Category filter"
                className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider mr-1 flex-shrink-0">
                  <Filter size={13} />
                  <span>Category:</span>
                </div>
                {availableCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none ${
                        isActive
                          ? "bg-gradient-to-r from-[#D4A373] to-[#B88755] text-[#141414] shadow-[0_4px_14px_rgba(212,163,115,0.35)] border border-[#EAC29A] scale-[1.02]"
                          : "bg-[#171310] hover:bg-[#251E19] text-[#DFD3C3] hover:text-[#FAF7F2] border border-[#3E3125] hover:border-[#D4A373]/50 shadow-sm"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Price Filter Pills & Reset */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider mr-1">
                  <SlidersHorizontal size={13} />
                  <span>Price:</span>
                </div>
                {PRICE_FILTERS.map((btn) => {
                  const isActive = filter === btn.value;
                  return (
                    <button
                      key={btn.value}
                      type="button"
                      onClick={() => setFilter(btn.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none ${
                        isActive
                          ? "bg-gradient-to-r from-[#D4A373] to-[#B88755] text-[#141414] shadow-[0_4px_14px_rgba(212,163,115,0.35)] border border-[#EAC29A] scale-[1.02]"
                          : "bg-[#171310] hover:bg-[#251E19] text-[#DFD3C3] hover:text-[#FAF7F2] border border-[#3E3125] hover:border-[#D4A373]/50 shadow-sm"
                      }`}
                    >
                      {btn.label}
                    </button>
                  );
                })}

                {(activeCategory !== "All" || filter !== "all" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("All");
                      setFilter("all");
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#D4A373] bg-[#D4A373]/10 hover:bg-[#D4A373]/20 border border-[#D4A373]/30 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none ml-1 whitespace-nowrap"
                  >
                    <RotateCw size={12} />
                    <span>Reset All</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ERROR NOTIFICATION */}
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 text-red-200 bg-red-950/40 border border-red-500/30 rounded-2xl p-5 mb-8 animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={22} className="text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              >
                <RotateCw size={13} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* ────────────────── POLISHED STATES ────────────────── */}

          {/* STATE 1: LOADING DISHES */}
          {loading && !error && (
            <div
              role="status"
              aria-label="Loading dishes"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
              <span className="sr-only">Loading menu dishes...</span>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* STATE 2: NO DISHES FOUND (Empty Database) */}
          {!loading && !error && items.length === 0 && (
            <EmptyMenuState onRefresh={fetchData} />
          )}

          {/* STATE 3: NO SEARCH RESULTS */}
          {!loading && !error && items.length > 0 && searchQuery.trim() !== "" && sortedItems.length === 0 && (
            <NoSearchResultsState
              query={searchQuery}
              onClearSearch={() => setSearchQuery("")}
              onSelectQuery={(tag) => setSearchQuery(tag)}
            />
          )}

          {/* STATE 4: NO DISHES IN SELECTED CATEGORY */}
          {!loading && !error && items.length > 0 && searchQuery.trim() === "" && activeCategory !== "All" && sortedItems.length === 0 && (
            <NoCategoryDishesState
              category={activeCategory}
              activeFilter={filter}
              onResetCategory={() => setActiveCategory("All")}
              onResetPrice={() => setFilter("all")}
            />
          )}

          {/* SUCCESSFUL DISHES GRID */}
          {!loading && !error && sortedItems.length > 0 && (
            <div
              key={`${activeCategory}-${filter}-${searchQuery}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
              {sortedItems.map((item, idx) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  index={idx}
                  ordered={orderedItems.includes(item._id)}
                  onOrder={handleOrder}
                  onViewDetails={setSelectedDetailItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DISH DETAIL MODAL */}
      {selectedDetailItem && (
        <DishDetailsModal
          item={selectedDetailItem}
          ordered={orderedItems.includes(selectedDetailItem._id)}
          onOrder={handleOrder}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* TOAST FEEDBACK */}
      {orderMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#D4A373] text-[#141414] px-6 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-pop-in border border-[#141414]/30"
        >
          <CheckCircle size={18} />
          <span>{orderMsg}</span>
        </div>
      )}
    </>
  );
}