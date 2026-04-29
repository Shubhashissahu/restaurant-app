// components/Info.jsx
import { Clock, MapPin, Star } from "lucide-react";

const data = [
  { icon: Clock, title: "Open Daily", detail: "11:00 AM - 10:00 PM" },
  { icon: MapPin, title: "Location", detail: "123 Flavor Street" },
  { icon: Star, title: "Top Rated", detail: "4.9 / 5 Rating" },
];

export default function Info() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        {data.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                <Icon size={22} />
              </div>

              <h3 className="font-semibold text-lg mb-1">
                {item.title}
              </h3>

              <p className="text-gray-500 text-sm">
                {item.detail}
              </p>
            </div>
          );
        })}

      </div>
    </section>
  );
}