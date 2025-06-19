import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; // Assuming Sidebar handles its own responsiveness

// Import Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSpinner,
  faWrench, // Main icon for Service Package Records
  faHashtag, // For Record Number
  faCalendarAlt, // For Service Date
  faCar, // For Plate Number
  faBoxOpen, // For Package Number
} from "@fortawesome/free-solid-svg-icons";

const Managerservicepackage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    RecordNumber: "",
    ServiceDate: "",
    PlateNumber: "",
    PackageNumber: "",
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/services");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
      alert("Failed to fetch service package records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/services", formData);
      alert("Record added!");
      setFormData({ RecordNumber: "", ServiceDate: "", PlateNumber: "", PackageNumber: "" });
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      console.error("Error adding record:", err.response?.data || err.message);
      alert("Failed to add record");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Ensure ServiceDate is in 'YYYY-MM-DD' format for date input type
    const formattedServiceDate = record.ServiceDate
      ? new Date(record.ServiceDate).toISOString().split("T")[0]
      : "";
    setFormData({
      RecordNumber: record.RecordNumber,
      ServiceDate: formattedServiceDate,
      PlateNumber: record.PlateNumber,
      PackageNumber: record.PackageNumber,
    });
    setShowForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/services/${editingRecord.RecordNumber}`,
        formData
      );
      alert("Record updated!");
      setShowForm(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      console.error("Error updating record:", err.response?.data || err.message);
      alert("Failed to update record");
    }
  };
const handleDelete = async (RecordNumber) => {
    if (!window.confirm("Are you sure you want to delete this Package?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/services/${RecordNumber}`);
      alert("Record deleted!");
      fetchPackages();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete Record");
    }
  };






  // Helper function to format field names for display
  const formatFieldName = (fieldName) => {
    return fieldName.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="flex min-h-screen bg-gray-50  dark:bg-gray-900 dark:text-white"> {/* Changed bg-gray-100 to bg-gray-50 for consistency */}
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2 dark:text-white">
            <FontAwesomeIcon icon={faWrench} className="text-blue-600 " />
            Service Package Records
          </h1>

          <button
            onClick={() => {
              setEditingRecord(null);
              setFormData({ RecordNumber: "", ServiceDate: "", PlateNumber: "", PackageNumber: "" });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Record
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-600 flex items-center justify-center gap-2 py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
            Loading records...
          </p>
        ) : (
          /* Records Table */
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm text-left text-gray-700 bg-white">
              <thead className="text-xs text-white uppercase bg-blue-600">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">No</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">Record Number</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">Service Date</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell">Plate Number</th> {/* Hide on small screens */}
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 hidden lg:table-cell">Package Number</th> {/* Hide on medium/small screens */}
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((record, index) => (
                    <tr
                      key={record.RecordNumber}
                      className="border-b hover:bg-gray-100 transition duration-150 dark:bg-gray-800 dark:text-white"
                    >
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-medium">{index + 1}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-semibold">{record.RecordNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 whitespace-nowrap">
                        {new Date(record.ServiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell ">{record.PlateNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 hidden lg:table-cell dark:text-white">{record.PackageNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 text-center space-x-1 sm:space-x-2 flex flex-col sm:flex-row items-center justify-center">
                        <button
                          onClick={() => handleEdit(record)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-150 flex items-center gap-1 mb-1 sm:mb-0"
                          title="Edit Record"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(record.RecordNumber)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-150 flex items-center gap-1"
                          title="Delete Record"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6" // Adjusted colspan based on hidden columns
                      className="px-6 py-8 text-center text-gray-500 italic"
                    >
                      No service records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={editingRecord ? handleEditSubmit : handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingRecord ? "Edit Service Package Record" : "Add New Service Package Record"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingRecord(null); // Reset editing state on close
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faHashtag} className="mr-2 text-gray-500" />
                {formatFieldName("RecordNumber")}
              </label>
              <input
                type="number"
                name="RecordNumber"
                value={formData.RecordNumber}
                onChange={handleChange}
                required
                disabled={!!editingRecord} // Disable if editing an existing record
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${formatFieldName("RecordNumber")}`}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" />
                {formatFieldName("ServiceDate")}
              </label>
              <input
                type="date"
                name="ServiceDate"
                value={formData.ServiceDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faCar} className="mr-2 text-gray-500" />
                {formatFieldName("PlateNumber")}
              </label>
              <input
                type="text"
                name="PlateNumber"
                value={formData.PlateNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${formatFieldName("PlateNumber")}`}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faBoxOpen} className="mr-2 text-gray-500" />
                {formatFieldName("PackageNumber")}
              </label>
              <input
                type="number"
                name="PackageNumber"
                value={formData.PackageNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${formatFieldName("PackageNumber")}`}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={editingRecord ? faEdit : faPlus} />
                {editingRecord ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Managerservicepackage;