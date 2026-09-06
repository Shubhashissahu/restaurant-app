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
  Camera
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

  useEffect(() => {
    fetchMenuItems();
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
    return {
      total,
      withPhotos,
      photoPercent: total ? Math.round((withPhotos / total) * 100) : 0,
    };
  }, [menuItems]);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C2B59B]">
            Total Dishes
          </p>
          <p className="text-3xl font-extrabold text-[#FAF7F2] mt-1">{stats.total}</p>
          <p className="text-xs text-[#8B7E6A] mt-1">Available in active food menu</p>
        </div>

        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4A373]">
            Dishes with Custom Photos
          </p>
          <p className="text-3xl font-extrabold text-[#D4A373] mt-1">
            {stats.withPhotos}{" "}
            <span className="text-sm font-medium text-[#C2B59B]">({stats.photoPercent}%)</span>
          </p>
          <p className="text-xs text-[#8B7E6A] mt-1">Custom uploaded or assigned photos</p>
        </div>

        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C2B59B]">
            Active Categories
          </p>
          <p className="text-3xl font-extrabold text-[#FAF7F2] mt-1">{CATEGORIES.length - 1}</p>
          <p className="text-xs text-[#8B7E6A] mt-1">Starters, Mains, Desserts, Beverages</p>
        </div>
      </div>

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
