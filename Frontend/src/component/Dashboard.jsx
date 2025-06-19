import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./Sidebar";

const dayData = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 19 },
  { day: "Wed", value: 8 },
  { day: "Thu", value: 15 },
  { day: "Fri", value: 10 },
  { day: "Sat", value: 20 },
  { day: "Sun", value: 5 },
];

const monthData = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 150 },
  { month: "May", value: 90 },
  { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
  // { month: "Jun", value: 130 },
];

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-200 dark:bg-gray-900 text-black dark:text-white">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-screen  min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to CWSMS Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Day of Week Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Cars by Day of Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke={null} />
                <XAxis dataKey="day" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937", 
                    borderColor: "#4b5563",     
                    color: "#f9fafb",           
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Month Chart */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Cars</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={null} />
                <XAxis dataKey="month" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#4b5563",
                    color: "#f9fafb",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
