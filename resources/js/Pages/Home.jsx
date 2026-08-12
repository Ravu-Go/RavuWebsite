import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-2xl shadow-xl text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-blue-600">
          ReactNertia 🚀
        </h1>

        <p className="text-gray-600">
          Tailwind v4 + Inertia + React 19 Ready
        </p>

        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Test Button
        </button>
      </motion.div>
    </div>
  );
}
