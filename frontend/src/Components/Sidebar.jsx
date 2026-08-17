import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import api from "../services/api";

function MenuNode({ item }) {
  const Icon = Icons[item.icon] || Icons.Circle;

  return (
    <div>
      <Link
        to={item.path}
        className="flex items-center gap-2 px-3 py-2 text-cream hover:text-gold transition-colors"
      >
        <Icon size={18} />
        {item.label}
      </Link>

      {item.children?.length > 0 && (
        <div className="ml-5 border-l border-gold/20">
          {item.children.map((child) => (
            <MenuNode key={child._id || child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [tree, setTree] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    api
      .get("/mapping/my-menu")
      .then((res) => {
        setTree(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 text-red-400">
        Couldn't load your menu. Try refreshing.
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="p-4 text-cream/50">
        No menu items assigned to your role yet.
      </div>
    );
  }

  return (
    <nav className="bg-charcoal h-full">
      {tree.map((item) => (
        <MenuNode key={item._id || item.id} item={item} />
      ))}
    </nav>
  );
}