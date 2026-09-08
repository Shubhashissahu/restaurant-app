// frontend/src/components/admin/FoodMenuManagement.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import api from "../../services/api";
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  RotateCw,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  ChefHat,
  LayoutGrid,
  List,
  Eye,
  Camera,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveDishImage, CURATED_DISH_PRESETS, DEFAULT_FOOD_IMAGE } from "../../utils/imageUtils";

const CATEGORIES = ["All", "Starters", "Main Course", "Appetizers", "Desserts", "Beverages"];

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

// --- Dish Item Modal with Multi-source Photo Picker ---
export function FoodItemModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      category: "Main Course",
      price: "",
      description: "",
      image: "",
      imageUrl: "",
    }
  );

  const [photoTab, setPhotoTab] = useState("upload"); // 'upload' | 'url' | 'presets'
  const [urlInput, setUrlInput] = useState(initial?.image || initial?.imageUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state when initial dish changes
  useEffect(() => {
    if (initial) {
      setForm(initial);
      const existingImg = initial.image || initial.imageUrl || "";
      setUrlInput(existingImg);
      setSelectedFile(null);
      setFilePreview(null);
      if (existingImg.startsWith("http")) {
        setPhotoTab("url");
      }
    }
  }, [initial]);

  // Active current preview (prioritizes local file, then URL/presets, then existing saved image)
  const currentImage =
    filePreview ||
    (photoTab === "url" && urlInput.trim() ? urlInput.trim() : null) ||
    form.image ||
    form.imageUrl ||
    "";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setError("");
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setFilePreview(localUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setUrlInput("");
    setForm((prev) => ({ ...prev, image: "", imageUrl: "" }));
  };

  const handlePresetSelect = (presetUrl) => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setUrlInput(presetUrl);
    setForm((prev) => ({ ...prev, image: presetUrl, imageUrl: presetUrl }));
    toast.success("Preset photo selected!");
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      return setError("Please enter an image URL");
    }
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setForm((prev) => ({
      ...prev,
      image: urlInput.trim(),
      imageUrl: urlInput.trim(),
    }));
    toast.success("Image URL applied");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Dish name is required");
    if (!form.price || Number(form.price) <= 0) return setError("Please enter a valid price");

    setSubmitting(true);
    setError("");

    try {
      let finalImagePath = (form.image || form.imageUrl || "").trim();

      // If user typed/pasted a URL, use it directly
      if (photoTab === "url" && urlInput.trim()) {
        finalImagePath = urlInput.trim();
      }

      // If user chose a local file, upload it first to the backend
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("photo", selectedFile);

        // DO NOT set Content-Type header manually so Axios automatically generates boundary!
        const uploadRes = await api.post("/menu/upload", formData);

        if (uploadRes.data?.imageUrl) {
          finalImagePath = uploadRes.data.imageUrl;
        }
      }

      await onSubmit({
        ...form,
        _id: initial?._id || form._id,
        price: Number(form.price),
        image: finalImagePath,
        imageUrl: finalImagePath,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save menu dish. Please check your connection."
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#3A2E24]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <ChefHat size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#FAF7F2]">
                {initial ? "Edit Food Menu Dish" : "Add New Food Menu Dish"}
              </h2>
              <p className="text-xs text-[#C2B59B]">
                Configure dish details and attach delicious photos for the food catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#C2B59B] hover:text-[#FAF7F2] p-1.5 rounded-lg hover:bg-[#2A2A2A] transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dish Name */}
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
              Dish Name *
            </label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. Royal Butter Chicken, Paneer Tikka Masala"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
                Category *
              </label>
              <select
                className={INPUT_STYLE}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Pasta">Pasta</option>
                <option value="Salads">Salads</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
                Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className={INPUT_STYLE}
                placeholder="280"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
              Description
            </label>
            <textarea
              className={`${INPUT_STYLE} resize-none h-20`}
              placeholder="Freshly prepared with authentic herbs, cream, and aromatic spices..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* PHOTO MANAGEMENT SECTION */}
          <div className="pt-2 border-t border-[#3A2E24]/70">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D4A373] flex items-center gap-1.5">
                <Camera size={14} /> Dish Photo
              </label>
              {currentImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline"
                >
                  <X size={12} /> Remove photo
                </button>
              )}
            </div>

            {/* Current Photo Preview Card */}
            {currentImage ? (
              <div className="relative mb-4 rounded-2xl overflow-hidden border border-[#3A2E24] bg-[#141414] h-44 flex items-center justify-center group">
                <img
                  src={resolveDishImage(currentImage, form.name, form.category)}
                  alt="Dish preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="text-xs font-semibold bg-[#1E1E1E]/90 text-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#3A2E24]">
                    Photo attached
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white transition"
                    title="Change / Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Photo Source Tabs */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#3A2E24] mb-3">
              <button
                type="button"
                onClick={() => setPhotoTab("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  photoTab === "upload"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                <Upload size={13} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  photoTab === "url"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                <LinkIcon size={13} /> Image URL
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab("presets")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  photoTab === "presets"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                <Sparkles size={13} /> Presets Gallery
              </button>
            </div>

            {/* Tab 1: Upload from Computer */}
            {photoTab === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3A2E24] hover:border-[#D4A373]/60 rounded-2xl p-6 text-center cursor-pointer transition bg-[#1E1E1E]/50 hover:bg-[#2A2A2A]/40 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373] mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-semibold text-[#FAF7F2]">
                  {selectedFile ? selectedFile.name : "Click to select or drag & drop dish photo"}
                </p>
                <p className="text-[11px] text-[#8B7E6A] mt-1">
                  Supports JPG, PNG, WEBP, GIF up to 5MB
                </p>
              </div>
            )}

            {/* Tab 2: Web Image URL */}
            {photoTab === "url" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    className={INPUT_STYLE}
                    placeholder="https://images.unsplash.com/photo-..."
                    value={urlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUrlInput(val);
                      setForm((prev) => ({
                        ...prev,
                        image: val.trim(),
                        imageUrl: val.trim(),
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleUrlApply}
                    className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#D4A373] text-[#FAF7F2] hover:text-[#141414] border border-[#3A2E24] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    <Check size={14} /> Apply
                  </button>
                </div>
                <p className="text-[11px] text-[#8B7E6A]">
                  Paste any public image link from Unsplash, Pexels, or your web CDN.
                </p>
              </div>
            )}

            {/* Tab 3: Curated Food Presets */}
            {photoTab === "presets" && (
              <div className="space-y-2">
                <p className="text-[11px] text-[#8B7E6A]">
                  Select from professional high-resolution food photography:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                  {CURATED_DISH_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p.url)}
                      className="group/preset relative rounded-xl overflow-hidden border border-[#3A2E24] hover:border-[#D4A373] transition aspect-video bg-[#141414]"
                    >
                      <img
                        src={p.url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover/preset:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-90 p-1 flex items-end">
                        <span className="text-[9px] font-semibold text-white leading-tight truncate">
                          {p.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A2E24]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] transition disabled:opacity-50 shadow-md shadow-[#D4A373]/20 flex items-center gap-2"
            >
              {(submitting || uploading) && <RotateCw size={14} className="animate-spin" />}
              {uploading
                ? "Uploading Photo..."
                : submitting
                ? "Saving..."
                : initial
                ? "Save Changes"
                : "Add Dish to Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Food Menu Card Component ---
export function FoodMenuCard({ item, onEdit, onDelete }) {
  const imageUrl = resolveDishImage(item.image || item.imageUrl, item.name, item.category);
  const hasCustomPhoto = Boolean(item.image || item.imageUrl);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden transition-all duration-300 hover:border-[#D4A373]/50 hover:shadow-2xl hover:-translate-y-1">
      {/* Top Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-[#242424]">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = DEFAULT_FOOD_IMAGE;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-black/20 to-transparent" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-[#1E1E1E]/90 backdrop-blur-md text-[#D4A373] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-[#3A2E24] shadow-md">
          {item.category || "Main Course"}
        </span>

        {/* Custom Photo Indicator */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md flex items-center gap-1 ${
            hasCustomPhoto
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-black/60 text-[#C2B59B] border-white/10"
          }`}
        >
          <Camera size={10} />
          {hasCustomPhoto ? "Photo Attached" : "Default Photo"}
        </span>

        {/* Price Tag in Image */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xl font-extrabold text-[#D4A373] bg-[#1E1E1E]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-[#3A2E24] shadow-xl">
            ₹{Number(item.price || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#FAF7F2] text-lg leading-snug group-hover:text-[#D4A373] transition-colors mb-1.5">
          {item.name}
        </h3>

        {item.description ? (
          <p className="text-xs text-[#C2B59B] line-clamp-2 leading-relaxed mb-4 flex-1">
            {item.description}
          </p>
        ) : (
          <p className="text-xs text-[#8B7E6A] italic mb-4 flex-1">
            No description provided for this dish.
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#3A2E24]/60 mt-auto">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 text-xs text-[#D4A373] hover:text-[#FAF7F2] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#2A2A2A] transition"
          >
            <Camera size={13} /> {hasCustomPhoto ? "Change Photo" : "Add Photo"}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
              title="Edit dish details"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              title="Delete dish"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dedicated Food Menu Management Page Component ---
export default function FoodMenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Price Change Approval Workflow States
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'price-requests'
  const [priceRequests, setPriceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
  const [actionProcessingId, setActionProcessingId] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchMenuItems();
    fetchPriceRequests();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/menu");
      setMenuItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load food menu items");
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get("/admin/price-requests");
      setPriceRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching price requests for admin:", err);
      toast.error("Failed to load price requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (request) => {
    setActionProcessingId(request._id);
    try {
      const res = await api.patch(`/admin/price-requests/${request._id}/approve`, {});
      toast.success(res.data?.message || `Approved price update for "${request.dishName}"!`, {
        icon: "✅",
      });

      // Update dish in local menuItems list
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === (request.menuItem?._id || request.menuItem)
            ? { ...item, price: request.requestedPrice }
            : item
        )
      );

      // Update local request status
      setPriceRequests((prev) =>
        prev.map((r) =>
          r._id === request._id
            ? { ...r, status: "Approved", reviewedAt: new Date(), reviewedByName: "You" }
            : r
        )
      );
    } catch (err) {
      console.error("Error approving price request:", err);
      toast.error(err.response?.data?.message || "Failed to approve price change");
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    setActionProcessingId(rejectingItem._id);
    try {
      const res = await api.patch(`/admin/price-requests/${rejectingItem._id}/reject`, {
        note: rejectReason,
      });
      toast.success(res.data?.message || `Price change request rejected`, { icon: "🚫" });

      setPriceRequests((prev) =>
        prev.map((r) =>
          r._id === rejectingItem._id
            ? {
                ...r,
                status: "Rejected",
                reviewNote: rejectReason,
                reviewedAt: new Date(),
                reviewedByName: "You",
              }
            : r
        )
      );
      setRejectingItem(null);
      setRejectReason("");
    } catch (err) {
      console.error("Error rejecting price request:", err);
      toast.error(err.response?.data?.message || "Failed to reject price change");
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleAddItem = async (item) => {
    const res = await api.post("/menu", item);
    const created = res.data.item || res.data;
    setMenuItems((prev) => [...prev, created]);
    toast.success("Food menu dish added successfully!");
  };

  const handleEditItem = async (item) => {
    const res = await api.put(`/menu/${item._id}`, item);
    const updated = res.data.item || res.data;
    setMenuItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    toast.success("Food menu dish updated successfully!");
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item from the menu?")) return;
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Dish deleted from menu");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete dish");
    }
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const total = menuItems.length;
    const withPhotos = menuItems.filter((i) => Boolean(i.image || i.imageUrl)).length;
    const pendingPriceCount = priceRequests.filter((r) => r.status === "Pending").length;
    return {
      total,
      withPhotos,
      photoPercent: total ? Math.round((withPhotos / total) * 100) : 0,
      pendingPriceCount,
    };
  }, [menuItems, priceRequests]);

  const filteredRequests = useMemo(() => {
    return priceRequests.filter((r) => {
      if (requestFilter === "all") return true;
      return r.status.toLowerCase() === requestFilter.toLowerCase();
    });
  }, [priceRequests, requestFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#241F1A] to-[#1A1A1A] border border-[#3A2E24] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
              <UtensilsCrossed size={13} />
              Culinary Menu Catalogue
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#FAF7F2] tracking-tight">
              Food Menu Management
            </h1>
            <p className="text-[#C2B59B] text-sm md:text-base max-w-2xl leading-relaxed">
              Upload mouthwatering dish photos, configure recipe descriptions, update real-time prices,
              and categorize dishes across your restaurant portals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-[#D4A373]/20 text-sm"
            >
              <Plus size={16} />
              Add Food Item
            </button>
            <button
              onClick={fetchMenuItems}
              className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] font-semibold px-4 py-3 rounded-xl transition text-sm"
              title="Refresh catalog"
            >
              <RotateCw size={15} className={loading ? "animate-spin text-[#D4A373]" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C2B59B]">
            Total Dishes
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] mt-1">{stats.total}</p>
          <p className="text-xs text-[#8B7E6A] mt-1">Active menu dishes</p>
        </div>

        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4A373]">
            Dishes with Custom Photos
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#D4A373] mt-1">
            {stats.withPhotos}{" "}
            <span className="text-sm font-medium text-[#C2B59B]">({stats.photoPercent}%)</span>
          </p>
          <p className="text-xs text-[#8B7E6A] mt-1">Custom photos attached</p>
        </div>

        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C2B59B]">
            Active Categories
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] mt-1">{CATEGORIES.length - 1}</p>
          <p className="text-xs text-[#8B7E6A] mt-1">Starters, Mains, etc.</p>
        </div>

        {/* Pending Price Approvals Metric Card */}
        <div
          onClick={() => setActiveTab("price-requests")}
          className={`bg-[#1E1E1E] border rounded-2xl p-5 shadow-xl transition cursor-pointer ${
            stats.pendingPriceCount > 0
              ? "border-amber-500/40 hover:border-amber-400 bg-amber-500/5"
              : "border-[#3A2E24] hover:border-[#D4A373]/40"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center justify-between">
            <span>Price Approvals</span>
            {stats.pendingPriceCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
            {stats.pendingPriceCount}
          </p>
          <p className="text-xs text-[#8B7E6A] mt-1">
            {stats.pendingPriceCount > 0 ? "Awaiting your review & approval" : "All requests resolved"}
          </p>
        </div>
      </div>

      {/* Main Navigation Pill Tabs */}
      <div className="flex items-center gap-3 border-b border-[#3A2E24] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#D4A373] text-[#141414] shadow-lg shadow-[#D4A373]/20"
              : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
          }`}
        >
          <UtensilsCrossed size={14} />
          <span>Food Menu Catalog ({menuItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("price-requests")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === "price-requests"
              ? "bg-[#D4A373] text-[#141414] shadow-lg shadow-[#D4A373]/20"
              : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
          }`}
        >
          <Clock size={14} />
          <span>Price Change Requests</span>
          {stats.pendingPriceCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "price-requests"
                  ? "bg-[#141414] text-[#D4A373]"
                  : "bg-amber-400 text-[#141414] animate-pulse shadow-sm"
              }`}
            >
              {stats.pendingPriceCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FOOD CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
            <input
              type="text"
              placeholder="Search dishes or recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#C2B59B] mr-1 hidden sm:inline">View:</span>
            <div className="flex bg-[#141414] p-1 rounded-xl border border-[#3A2E24]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === "grid"
                    ? "bg-[#D4A373] text-[#141414]"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
                title="Grid cards with photo"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === "table"
                    ? "bg-[#D4A373] text-[#141414]"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
                title="Compact table view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-[#8B7E6A] mr-1 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-[#D4A373] text-[#141414] shadow-md shadow-[#D4A373]/20"
                  : "bg-[#2A2A2A] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] border border-[#3A2E24]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Display */}
        {loading ? (
          <div className="py-20 text-center text-[#C2B59B]">
            <RotateCw size={28} className="animate-spin mx-auto text-[#D4A373] mb-2" />
            Loading food catalog items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-[#3A2E24] p-8 space-y-3">
            <ChefHat size={40} className="mx-auto text-[#8B7E6A]" />
            <p className="text-base font-semibold text-[#FAF7F2]">
              {searchQuery || selectedCategory !== "All"
                ? "No food dishes matched your search."
                : "No dishes added yet."}
            </p>
            <p className="text-xs text-[#C2B59B] max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search keywords or switching category."
                : "Click '+ Add Food Item' above to introduce your first recipe with photo."}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs font-semibold text-[#D4A373] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filteredItems.map((item) => (
              <FoodMenuCard
                key={item._id}
                item={item}
                onEdit={setEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-[#3A2E24]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3A2E24] bg-[#141414] text-[#8B7E6A] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Dish Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2E24]/60 text-sm">
                {filteredItems.map((item) => {
                  const img = resolveDishImage(item.image || item.imageUrl, item.name, item.category);
                  return (
                    <tr key={item._id} className="hover:bg-[#2A2A2A]/40 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#3A2E24] bg-[#141414]">
                          <img
                            src={img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = DEFAULT_FOOD_IMAGE;
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#FAF7F2]">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-[#2A2A2A] text-[#D4A373] px-2.5 py-1 rounded-full border border-[#3A2E24]">
                          {item.category || "Main Course"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#D4A373]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#C2B59B] max-w-xs truncate">
                        {item.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditItem(item)}
                            className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                            title="Edit dish and photo"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                            title="Delete dish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )}

      {/* TAB 2: PRICE CHANGE REQUESTS */}
      {activeTab === "price-requests" && (
        <div className="space-y-6">
          {/* Sub-toolbar */}
          <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B7E6A]">Filter:</span>
              {["all", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRequestFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    requestFilter === f
                      ? "bg-[#D4A373] text-[#141414] shadow-sm font-extrabold"
                      : "bg-[#141414] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24]"
                  }`}
                >
                  {f}
                  {f === "pending" && stats.pendingPriceCount > 0 && ` (${stats.pendingPriceCount})`}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchPriceRequests}
              disabled={loadingRequests}
              className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2A2A2A] hover:bg-[#333] text-[#FAF7F2] border border-[#3A2E24] text-xs font-bold transition cursor-pointer"
            >
              <RotateCw size={13} className={loadingRequests ? "animate-spin text-[#D4A373]" : ""} />
              <span>Refresh Requests</span>
            </button>
          </div>

          {/* Requests Content */}
          {loadingRequests ? (
            <div className="py-16 text-center text-[#8B7E6A] flex flex-col items-center justify-center gap-3">
              <RotateCw size={24} className="animate-spin text-[#D4A373]" />
              <p className="text-sm font-semibold">Loading price change requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#1E1E1E] border border-[#3A2E24]">
              <FileText size={40} className="mx-auto text-[#3A2E24] mb-3" />
              <h3 className="text-base font-bold text-[#FAF7F2]">No Price Change Requests</h3>
              <p className="text-xs text-[#8B7E6A] mt-1">
                {requestFilter === "pending"
                  ? "Awesome! No pending dish price change requests awaiting approval."
                  : "No requests found matching the selected filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => {
                const priceDiff = Number(req.requestedPrice) - Number(req.currentPrice);
                const percentDiff = req.currentPrice > 0 ? Math.round((priceDiff / req.currentPrice) * 100) : 0;
                const isProcessing = actionProcessingId === req._id;

                return (
                  <div
                    key={req._id}
                    className={`p-5 rounded-3xl border transition-all duration-200 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                      req.status === "Pending"
                        ? "bg-[#1E1A17] border-amber-500/30 hover:border-amber-500/50"
                        : req.status === "Approved"
                        ? "bg-[#1A1E1A] border-emerald-500/20"
                        : "bg-[#1E1A1A] border-rose-500/20 opacity-80"
                    }`}
                  >
                    {/* Left: Dish info & price diff */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#141414] border border-[#3A2E24] shrink-0">
                        <img
                          src={resolveDishImage(req.dishImage, req.dishName, req.category)}
                          alt={req.dishName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_FOOD_IMAGE;
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-[#FAF7F2]">{req.dishName}</h4>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#3A2E24] text-[#D4A373]">
                            {req.category || "Dish"}
                          </span>
                        </div>

                        {/* Price Visualizer */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs text-[#8B7E6A] line-through font-semibold">
                            ₹{req.currentPrice}
                          </span>
                          <ArrowRight size={14} className="text-[#D4A373]" />
                          <span className="text-lg font-extrabold text-[#D4A373]">
                            ₹{req.requestedPrice}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              priceDiff > 0
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : priceDiff < 0
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-neutral-500/10 text-neutral-400"
                            }`}
                          >
                            {priceDiff > 0 ? `+₹${priceDiff} (+${percentDiff}%)` : `₹${priceDiff} (${percentDiff}%)`}
                          </span>
                        </div>

                        {/* Manager info & Reason */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#C2B59B] pt-1">
                          <span>
                            Requested by: <strong className="text-[#FAF7F2]">{req.requestedByName || "Store Manager"}</strong>
                            {req.requestedByEmail && <span className="text-[#8B7E6A] ml-1">({req.requestedByEmail})</span>}
                          </span>
                          <span>•</span>
                          <span className="text-[#8B7E6A] flex items-center gap-1">
                            <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {req.reason && (
                          <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1 mt-2 inline-block">
                            Manager Note: {req.reason}
                          </p>
                        )}

                        {req.reviewNote && (
                          <p className="text-xs text-[#C2B59B] bg-[#141414] border border-[#3A2E24] rounded-xl px-3 py-1 mt-1 inline-block">
                            Admin Note: {req.reviewNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions or Review Status */}
                    <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                      {req.status === "Pending" ? (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApproveRequest(req)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#141414] font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            <Check size={15} />
                            <span>{isProcessing ? "Updating..." : `Approve ₹${req.requestedPrice}`}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingItem(req);
                              setRejectReason("");
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            <X size={15} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              req.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {req.status === "Approved" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            <span>{req.status}</span>
                          </span>
                          <p className="text-[11px] text-[#8B7E6A]">
                            Reviewed {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in"
          onClick={() => setRejectingItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#1C1815] border border-[#44362A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3A2E24] pb-4">
              <div>
                <h3 className="text-lg font-bold text-rose-400">Reject Price Change</h3>
                <p className="text-xs text-[#8B7E6A]">
                  For {rejectingItem.dishName} (₹{rejectingItem.currentPrice} &rarr; ₹{rejectingItem.requestedPrice})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="w-8 h-8 rounded-full bg-[#141414] text-[#C2B59B] hover:text-[#FAF7F2] flex items-center justify-center border border-[#3A2E24]"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C2B59B] mb-1.5">
                  Rejection Reason (will be shown to manager)
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Price increase is too high for current season, please adjust to ₹..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#141414] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A2E24]">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#C2B59B] hover:text-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessingId === rejectingItem._id}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  {actionProcessingId === rejectingItem._id ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <FoodItemModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddItem}
        />
      )}

      {editItem && (
        <FoodItemModal
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={handleEditItem}
        />
      )}
    </div>
  );
}
