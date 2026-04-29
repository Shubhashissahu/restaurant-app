// components/Menu.jsx
import { Plus } from "lucide-react";

const menuItems = [
  { id: 1, emoji: "🍔", name: "Classic Burger", price: "$12.99", badge: "Popular" },
  { id: 2, emoji: "🍕", name: "Pizza", price: "$16.99", badge: "Chef's Pick" },
  { id: 3, emoji: "🍱", name: "Sushi", price: "$24.99", badge: "New" },
  { id: 4, emoji: "🍰", name: "Cake", price: "$8.99" },
  { id: 5, emoji: "☕", name: "Coffee", price: "$4.99" },
];

export default function Menu() {
  return (
   <section className="py-24 bg-white mb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Featured Delicacies</h2>
          <p className="text-gray-500 mt-2">
            Handpicked selections from our master chefs
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition hover:-translate-y-1 relative"
            >
              {item.badge && (
                <span className="absolute top-3 right-3 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}

              <div className="text-4xl text-center mb-3">{item.emoji}</div>

              <h3 className="font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>

              <div className="flex justify-between items-center">
                <span className="text-teal-600 font-bold">
                  {item.price}
                </span>

                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}